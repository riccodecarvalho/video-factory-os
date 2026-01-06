# Video Factory OS — Execution Engine + Kanban System Spec
> Source of truth for the Execution Layer and Kanban Board  
> Version: 1.0 (post Phases 0-6)  
> Last Updated: 2026-01-06

---

## 1. System Overview

**Video Factory OS** is a Kanban-based video production pipeline that transforms user inputs (title, brief, configuration) into rendered videos through a multi-step execution engine.

### Core Components
| Component | Location | Purpose |
|-----------|----------|---------|
| **Kanban Board** | `/board` | Visual drag-and-drop interface |
| **State Machine** | `lib/engine/job-state-machine.ts` | Job state transitions |
| **Runner** | `lib/engine/runner.ts` | Step execution (LLM, TTS, Render) |
| **Actions** | `app/board/actions.ts` | Server actions + executeUntil |
| **DB Schema** | `lib/db/schema.ts` | SQLite with Drizzle ORM |

### Read Model Architecture
The board is a **pure read model**:
- No optimistic updates—all changes flow through DB
- Polling fetches latest state (1s running, 5s idle)
- State machine is the source of truth

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌──────────┐  ┌───────────┐  ┌────────────────────────┐   │
│  │BoardPage │  │BoardCard  │  │JobDetailsDrawer        │   │
│  │(polling) │→ │(draggable)│  │(6 tabs, no local state)│   │
│  └──────────┘  └───────────┘  └────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓ Server Actions
┌─────────────────────────────────────────────────────────────┐
│                       ACTIONS LAYER                          │
│  moveJobToColumn() → executeUntil() → runJob()              │
│  ├─ acquireStepLock()    (job_steps.locked_at)              │
│  ├─ idempotency check    (step.status + artifacts)          │
│  ├─ state update         (jobs.state + job_events)          │
│  └─ releaseStepLock()                                       │
└─────────────────────────────────────────────────────────────┘
                              ↓ Runner
┌─────────────────────────────────────────────────────────────┐
│                        ENGINE                                │
│  runJob() loops through recipe.pipeline:                     │
│  ├─ executeStepLLM()     (Claude API)                       │
│  ├─ executeStepTTS()     (Azure TTS)                        │
│  ├─ executeStepTransform()                                  │
│  └─ executeStepRender()  (FFmpeg)                           │
└─────────────────────────────────────────────────────────────┘
                              ↓ Persistence
┌─────────────────────────────────────────────────────────────┐
│                       DATABASE                               │
│  jobs         → Job config, state, progress                  │
│  job_steps    → Per-step status, locking, outputs            │
│  job_events   → Timeline of all events                       │
│  artifacts    → Generated files (scripts, audio, video)      │
│  job_templates→ Saved configurations for reuse               │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. State Machine

### 3.1 States (11 total)

| State | Column | Description |
|-------|--------|-------------|
| `DRAFT` | A_FAZER | Created but not configured |
| `READY` | A_FAZER | Configured, awaiting drag |
| `SCRIPTING` | ROTEIRO | Executing script steps |
| `SCRIPT_DONE` | ROTEIRO | Script complete |
| `TTS_RUNNING` | NARRACAO | Generating narration |
| `TTS_DONE` | NARRACAO | Narration complete |
| `RENDER_READY` | VIDEO | Awaiting render (Auto OFF) |
| `RENDER_RUNNING` | VIDEO | Rendering video |
| `DONE` | CONCLUIDO | Video ready for download |
| `FAILED` | (badge) | Error in any step |
| `CANCELLED` | (badge) | Cancelled by user |

### 3.2 Columns (5 total)

| Column | States | Target Step |
|--------|--------|-------------|
| `A_FAZER` | DRAFT, READY | — |
| `ROTEIRO` | SCRIPTING, SCRIPT_DONE | `roteiro` |
| `NARRACAO` | TTS_RUNNING, TTS_DONE | `tts` |
| `VIDEO` | RENDER_READY, RENDER_RUNNING | `export` |
| `CONCLUIDO` | DONE | — |

### 3.3 Transitions (21 total)

**Normal Flow:**
```
DRAFT → READY (user_action)
READY → SCRIPTING (user_action: drag to ROTEIRO)
SCRIPTING → SCRIPT_DONE (step_complete)
SCRIPT_DONE → TTS_RUNNING (user_action OR auto_advance)
TTS_RUNNING → TTS_DONE (step_complete)
TTS_DONE → RENDER_READY (step_complete, Auto OFF)
TTS_DONE → RENDER_RUNNING (auto_advance, Auto ON)
RENDER_READY → RENDER_RUNNING (user_action)
RENDER_RUNNING → DONE (step_complete)
```

**Error/Cancel:**
```
{SCRIPTING, TTS_RUNNING, RENDER_RUNNING} → FAILED (error)
{SCRIPTING, TTS_RUNNING, RENDER_RUNNING} → CANCELLED (cancel)
```

**Recovery:**
```
{FAILED, CANCELLED} → {SCRIPTING, TTS_RUNNING, RENDER_RUNNING} (user_action)
```

### 3.4 Auto Video Toggle
- **ON**: Automatic advancement after each step completion
- **OFF**: Pauses at _DONE states, requires manual drag

---

## 4. Main Flows

### 4.1 Create Video (from Board)
```
1. User clicks "Novo Vídeo" → NewVideoModal opens
2. User fills: title, language, storyType, voicePreset, visualMode
3. createJobFromBoard() → jobs.insert with state=DRAFT
4. Job appears in A_FAZER column
```

### 4.2 Execute on Drag (Auto ON)
```
1. User drags card from A_FAZER to ROTEIRO
2. moveJobToColumn(jobId, 'ROTEIRO')
3. executeUntil(jobId, 'roteiro')
   ├─ acquireStepLock()
   ├─ jobs.state = SCRIPTING, status = running
   ├─ emitJobEvent('auto_transition')
   ├─ emitJobEvent('step_started')
   ├─ await runJob(jobId)
   │   ├─ executeStepLLM('ideacao')
   │   ├─ executeStepLLM('roteiro')
   │   └─ updates jobs.progress, job_steps
   ├─ emitJobEvent('job_completed')
   └─ releaseStepLock()
4. Board poll picks up new state → card moves visually
5. Auto ON: continues to TTS → Render → DONE
```

### 4.3 Execute on Drag (Auto OFF)
```
Same as 4.2, but:
- Pauses at SCRIPT_DONE, TTS_DONE, RENDER_READY
- User must drag to next column to continue
```

### 4.4 Cancel
```
1. User opens drawer → clicks "Cancelar"
2. cancelJob(jobId)
3. jobs.state = CANCELLED, status = cancelled
4. emitJobEvent('step_failed', {reason: 'cancelled_by_user'})
5. Card shows CANCELLED badge
```

### 4.5 Resume
```
1. User opens drawer on CANCELLED/FAILED job → clicks "Retomar"
2. resumeJob(jobId)
3. jobs.state = READY, retryCount++, lastError = null
4. emitJobEvent('auto_transition', {reason: 'resume'})
5. Job returns to A_FAZER, can be dragged again
```

### 4.6 Retry (from FAILED)
```
Same as Resume, but:
- failedStep is preserved for debugging
- retryCount incremented
```

---

## 5. Contracts

### 5.1 executeUntil(jobId, targetStepKey)

**Signature:**
```typescript
async function executeUntil(
    jobId: string,
    targetStepKey: string
): Promise<{ status: string; newState: JobState; lastStep?: string }>
```

**Behavior:**
1. Validate job state (not running, cancelled, done)
2. Acquire step lock (job_steps.locked_at)
3. Check idempotency (step.status + artifacts)
4. Update jobs.state to running state
5. Execute runJob() **synchronously** (LOCAL-ONLY MODE)
6. Emit job_events throughout
7. Release lock and return result

**Locking:**
- Uses `job_steps.locked_at` and `job_steps.locked_by`
- Expiration: 5 minutes (allows steal lock)
- Lock ID format: `board_{timestamp}_{random}`

### 5.2 job_events

**Table Schema:**
```typescript
{
    id: string,
    jobId: string,
    eventType: string,
    stepKey?: string,
    payload?: string (JSON),
    createdAt: string
}
```

**Event Types:**
| Event | Variant | When |
|-------|---------|------|
| `step_started` | info | Step begins execution |
| `step_progress` | default | Progress update (percent) |
| `step_completed` | success | Step finishes successfully |
| `step_failed` | destructive | Step or job error |
| `step_skipped` | warning | Idempotency skip |
| `job_completed` | success | All steps done |
| `auto_transition` | info | State change |
| `lock_stolen` | warning | Lock expired and stolen |
| `artifact_written` | success | File generated |

### 5.3 artifacts

**Table Schema:**
```typescript
{
    id: string,
    jobId: string,
    stepKey: string,
    type: string,      // 'script', 'audio', 'video', 'image', 'outline'
    path: string,      // Relative path to file
    filename: string,
    mimeType: string,
    sizeBytes: integer,
    version: integer,
    isLatest: boolean,
    metadata?: string, // JSON
    createdAt: string
}
```

### 5.4 job_templates

**Table Schema:**
```typescript
{
    id: string,
    name: string,
    recipeId: string,
    configJson: string, // Saved job config
    createdAt: string,
    updatedAt: string
}
```

---

## 6. DB Schema (Execution Fields)

### jobs (key fields)
| Field | Type | Purpose |
|-------|------|---------|
| `state` | JobState | Execution state machine |
| `status` | string | Legacy: pending/running/completed/failed |
| `language` | string | pt-BR, es-ES, en-US |
| `durationPreset` | string | short, medium, long |
| `storyType` | string | historia_geral, drama, misterio |
| `voicePresetId` | FK | Voice configuration |
| `visualMode` | string | manual_upload, automatic |
| `imagesCount` | int | 1-10 |
| `autoVideoEnabled` | bool | Auto advance toggle |
| `retryCount` | int | Retry attempts |
| `failedStep` | string | Step that failed |
| `progress` | int | 0-100 |
| `currentStep` | string | Active step key |

### job_steps
| Field | Type | Purpose |
|-------|------|---------|
| `stepKey` | string | Step identifier |
| `status` | string | pending/running/success/failed/skipped |
| `lockedAt` | timestamp | Anti-concurrency lock |
| `lockedBy` | string | Lock holder ID |
| `inputHash` | string | Idempotency key |
| `outputRefs` | JSON | Output file references |
| `attempts` | int | Execution attempts |

---

## 7. UI Components

### BoardPage (`/board/page.tsx`)
- DndContext with PointerSensor + KeyboardSensor
- Adaptive polling: 1s (running jobs) / 5s (idle)
- State: boardData, loading, activeJob, selectedJobId

### BoardCard
- Draggable via @dnd-kit/sortable
- Shows: state badge, title, language, storyType
- Progress bar when running (uses job.progress)
- ETA display when available

### JobDetailsDrawer
- **No local state** - derives from DB
- 6 tabs:
  - Informações (config view/edit)
  - Outline (from artifacts)
  - Imagens (gallery + lightbox)
  - Roteiro (markdown viewer)
  - Áudios (player + list)
  - Logs (job_events timeline)
- Actions: Cancel, Resume, Retry, Download

### NewVideoModal
- 5 creation options (4 are stubs)
- Full form: title, language, storyType, voicePreset, visualMode

---

## 8. What is MVP / Stub / Future

### ✅ MVP (Implemented)
- State machine with 11 states, 21 transitions
- Kanban board with drag-and-drop
- Job creation from board
- executeUntil with step-level locking
- Cancel/Resume/Retry flows
- Job details drawer with 6 tabs
- Toast notifications with event mapping
- Progress tracking and polling

### ⚠️ Stubs (Placeholder)
- NewVideoModal: 4 of 5 options (voz, template, podcast, wizard)
- TabImagens: upload and AI generation buttons
- TabAudios: combine audio button
- ETA calculation (shows but not computed)

### 🔮 Future (Not Started)
- Worker/queue for serverless (current: sync local-only)
- Real ETA calculation
- Batch operations
- Multi-tenant isolation
- Priority queue tiers
- Background music upload

---

## 9. Architectural Decisions

### AD-1: Lock by Step, Not Job
**Decision:** Use `job_steps.locked_at/locked_by` for per-step locking  
**Rationale:** Prevents race conditions when multiple requests target different steps  
**Expiration:** 5 minutes (allows steal lock for abandoned executions)

### AD-2: Synchronous Execution (Local-Only)
**Decision:** `executeUntil` uses `await runJob()` synchronously  
**Rationale:** Simpler for local development; serverless needs queue  
**Future:** Replace with BullMQ/pg-boss for production

### AD-3: Read Model Board
**Decision:** No optimistic updates; all state from DB  
**Rationale:** Consistency over perceived performance; polling is cheap  
**Polling:** 1s when jobs running, 5s when idle

### AD-4: Drawer Without State
**Decision:** JobDetailsDrawer derives all data from props/server  
**Rationale:** Single source of truth; no stale local state

### AD-5: Idempotency Check
**Decision:** Skip step if `status=success` AND artifacts exist  
**Rationale:** Safe retry without duplicate work; respects inputHash

### AD-6: State Machine as Source of Truth
**Decision:** `jobs.state` (not `status`) drives all UI and flow logic  
**Rationale:** Explicit states enable precise transitions and recovery

---

## 10. File Map

```
app/board/
├── page.tsx              # Main Kanban board
├── layout.tsx            # ToastProvider wrapper
├── actions.ts            # Server actions (700+ lines)
└── components/
    ├── BoardCard.tsx     # Draggable card
    ├── BoardColumn.tsx   # Droppable column
    ├── BoardTopbar.tsx   # Navigation + actions
    ├── JobDetailsDrawer.tsx  # Main drawer
    ├── NewVideoModal.tsx # Creation modal
    └── drawer/
        ├── TabInformacoes.tsx
        ├── TabOutline.tsx
        ├── TabImagens.tsx
        ├── TabRoteiro.tsx
        ├── TabAudios.tsx
        └── TabLogs.tsx

lib/engine/
├── job-state-machine.ts  # States, transitions, helpers
├── runner.ts             # Step execution (1400+ lines)
├── providers.ts          # LLM/TTS integrations
└── ffmpeg.ts             # Video rendering

lib/db/
├── schema.ts             # Drizzle schema (600+ lines)
└── index.ts              # DB connection

components/ui/
└── use-toast.tsx         # Toast system + event mapping
```

---

## 11. Quick Reference

### Create Job
```typescript
await createJobFromBoard({
    title: 'My Video',
    language: 'pt-BR',
    storyType: 'drama',
    visualMode: 'automatic'
});
```

### Move to Column
```typescript
await moveJobToColumn(jobId, 'ROTEIRO');
// Internally calls executeUntil(jobId, 'roteiro')
```

### Cancel/Resume
```typescript
await cancelJob(jobId);
await resumeJob(jobId); // Works for CANCELLED and FAILED
```

### Get Board Data
```typescript
const data = await getJobsBoard();
// Returns: { columns: Record<BoardColumn, BoardJob[]>, autoVideoEnabled }
```

### Emit Event
```typescript
await emitJobEvent(jobId, 'step_progress', { percent: 50 });
```

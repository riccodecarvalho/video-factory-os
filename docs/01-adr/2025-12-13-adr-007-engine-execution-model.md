# ADR-007: Engine Execution Model

> **Status:** Aceito  
> **Data:** 2025-12-13  
> **Decisores:** Ricardo (owner), Antigravity (implementador)

---

## Contexto

Com a UI de Admin completa (Gate 0.8), precisamos conectar a interface de Produção (/jobs) ao engine de execução real, respeitando:

1. **Manifest-first**: cada job produz um manifest versionado
2. **Config-first**: vozes, presets, recipes vêm do DB
3. **Checkpoints idempotentes**: steps podem ser retomados

---

## Decisão

Implementar engine em fases:

### Phase 1 (Gate 0.9) — Stubbed Execution
- Runner executa steps sequencialmente
- Steps são stubados (simulated delay + mock output)
- Manifest real é gerado e persistido
- Status transitions reais (pending → running → success/failed)
- Logs por step com timestamps
- UI com polling (2s) para atualização

### Phase 2 (Gate 0.95) — Real Providers
- Integrar Claude API para script generation
- Integrar Azure TTS para áudio
- Validators reais
- Artifact storage real

### Phase 3 (Gate 1.0) — Production Ready
- Queue com retry automático
- Observability (traces, métricas)
- Paralelização onde possível

---

## Modelo de Dados

### Job
```typescript
{
  id: string;
  recipeId: string;
  recipeSlug: string;
  recipeVersion: number;
  input: JSON;
  manifest: JSON | null;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  currentStep: string | null;
  progress: number; // 0-100
  lastError: string | null;
}
```

### JobStep
```typescript
{
  id: string;
  jobId: string;
  stepKey: string;
  stepOrder: number;
  inputHash: string; // para idempotência
  status: "pending" | "running" | "success" | "failed" | "skipped";
  outputRefs: JSON;
  logs: JSON;
  attempts: number;
  durationMs: number;
}
```

### Manifest Contract
```typescript
{
  version: "1.0.0",
  job_id: string,
  created_at: ISO,
  updated_at: ISO,
  input: {...},
  snapshots: {recipe, prompts, presets, providers},
  steps: [{key, status, started_at, completed_at, duration_ms, output}],
  output: {...} | null,
  metrics: {total_duration_ms, step_count}
}
```

---

## Fluxo de Execução

```
1. User clica "Run"
   └─> startJob(jobId)
       └─> runJob(jobId)

2. runJob:
   ├─ Load job + recipe
   ├─ Create initial manifest
   ├─ Create JobStep records (pending)
   └─ For each step:
       ├─ Check if cancelled
       ├─ Update step → running
       ├─ Execute step
       ├─ Update step → success/failed
       └─ Add to manifest.steps

3. Finalize:
   ├─ Calculate metrics
   ├─ Persist manifest
   └─ Update job status
```

---

## UI Components

| Componente | Propósito |
|------------|-----------|
| `PipelineView` | Visualiza steps com status e retry |
| `LogsViewer` | Logs com auto-scroll e níveis |
| `ManifestViewer` | JSON read-only com copy |

---

## Alternativas Consideradas

### WebSocket para real-time
**Deferido para Phase 2**: polling é suficiente para MVP.

### Background queue (Redis/BullMQ)
**Deferido para Phase 3**: SQLite funciona para single-node.

---

## Consequências

### Positivas
- Job execution visível na UI
- Manifest captura estado completo
- Retry granular por step

### Negativas
- Polling consome requests
- Steps stubados não testam providers reais

---

## Referências

- [Manifest Contract](../../02-features/02-manifest-contract.md)
- [Recipe Schema](../../lib/db/schema.ts)
- [ADR-004 Design System](./2025-12-13-adr-004-design-system.md)

---

**Última atualização:** 2025-12-13

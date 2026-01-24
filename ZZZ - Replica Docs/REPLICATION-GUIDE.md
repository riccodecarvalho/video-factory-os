# Video Factory OS - Guia Completo de Replicação

> **Gerado automaticamente em:** 2026-01-24
> **Baseado em:** Análise de código real do repositório

Este documento contém **tudo que você precisa** para replicar o Video Factory OS em outro ambiente. Documentação baseada 100% no código fonte real.

---

## 📋 Índice

1. [Visão Geral do Sistema](#1-visão-geral-do-sistema)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Estrutura de Diretórios](#3-estrutura-de-diretórios)
4. [Schema do Banco de Dados](#4-schema-do-banco-de-dados)
5. [Engine de Execução](#5-engine-de-execução)
6. [Providers e Integrações](#6-providers-e-integrações)
7. [APIs e Server Actions](#7-apis-e-server-actions)
8. [Componentes Frontend](#8-componentes-frontend)
9. [Fluxo de Dados](#9-fluxo-de-dados)
10. [Configuração e Deploy](#10-configuração-e-deploy)
11. [Checklist de Replicação](#11-checklist-de-replicação)

---

## 1. Visão Geral do Sistema

### O que é o Video Factory OS?

Sistema **Config-First** para produção automatizada de vídeos narrados. Principais características:

- **Zero hardcode**: Prompts, presets, validators e recipes são configurados no banco de dados
- **Pipeline configurável**: Recipes definem a sequência de steps (roteiro → TTS → render)
- **Multi-projeto**: Suporta múltiplos canais com configurações independentes
- **Manifest-driven**: Cada execução gera um manifest completo para auditoria

### Fluxo Principal

```
Input (ideia/título) 
    → Recipe (pipeline de steps)
        → Step LLM (gera roteiro via Claude)
            → Step TTS (sintetiza áudio via Azure)
                → Step Render (gera vídeo via FFmpeg)
                    → Artifacts (arquivos finais)
```

---

## 2. Stack Tecnológico

### Core

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **Next.js** | 14.x | Framework React com App Router |
| **React** | 18.x | UI Components |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 3.x | Styling |

### Banco de Dados

| Tecnologia | Função |
|------------|--------|
| **SQLite** | Banco local (better-sqlite3) |
| **Drizzle ORM** | ORM type-safe |

### Providers Externos

| Provider | Função | API Key Env |
|----------|--------|-------------|
| **Claude (Anthropic)** | LLM para geração de roteiros | `ANTHROPIC_API_KEY` |
| **Azure Speech** | TTS (Text-to-Speech) | `AZURE_SPEECH_KEY` |
| **ImageFX (Google)** | Geração de imagens | `IMAGEFX_COOKIES` |
| **FFmpeg** | Renderização de vídeo | Sistema local |

### Dependências Principais

```json
{
  "@anthropic-ai/sdk": "^0.39.0",
  "@ffmpeg-installer/ffmpeg": "^1.1.0",
  "@ffprobe-installer/ffprobe": "^2.1.2",
  "better-sqlite3": "^11.7.0",
  "drizzle-orm": "^0.38.3",
  "fluent-ffmpeg": "^2.1.3",
  "next": "^14.2.35",
  "react": "^18.3.1",
  "zod": "^3.25.76"
}
```

---

## 3. Estrutura de Diretórios

```
video-factory-os/
├── app/                      # Next.js App Router
│   ├── admin/               # Painel administrativo
│   │   ├── actions.ts       # Server actions do admin
│   │   ├── execution-map/   # Config de bindings
│   │   ├── knowledge-base/  # CRUD de knowledge base
│   │   ├── presets/         # CRUD de presets (voice/video)
│   │   ├── prompts/         # CRUD de prompts
│   │   ├── providers/       # CRUD de providers
│   │   ├── recipes/         # CRUD de recipes
│   │   └── validators/      # CRUD de validators
│   ├── api/                 # API Routes
│   │   ├── artifacts/       # Serve arquivos de artifacts
│   │   ├── board/           # Board de jobs
│   │   ├── health/          # Health check
│   │   ├── jobs/            # API de jobs
│   │   └── render/          # API de render
│   ├── board/               # Kanban de jobs
│   ├── jobs/                # Gestão de jobs
│   │   ├── actions.ts       # Server actions de jobs
│   │   ├── new/             # Criar novo job
│   │   └── [id]/            # Detalhes do job
│   ├── wizard/              # Wizard step-by-step
│   ├── globals.css          # Estilos globais
│   ├── layout.tsx           # Layout principal
│   └── page.tsx             # Dashboard (Control Room)
│
├── components/              # Componentes React
│   ├── layout/             # AppShell, Sidebar, Header
│   ├── ui/                 # shadcn/ui components
│   └── vf/                 # Componentes Video Factory
│       ├── JobCard.tsx
│       ├── StepPreview.tsx
│       ├── WizardStepper.tsx
│       └── ...
│
├── lib/                     # Bibliotecas core
│   ├── adapters/           # Integrações externas
│   │   └── imagefx.ts      # Adapter ImageFX
│   ├── audit/              # Auditoria
│   ├── db/                 # Database
│   │   ├── index.ts        # Conexão SQLite
│   │   ├── schema.ts       # Schema Drizzle
│   │   ├── seed.ts         # Seed inicial
│   │   └── migrations/     # Migrations
│   ├── engine/             # Engine de execução
│   │   ├── runner.ts       # Orquestrador principal
│   │   ├── providers.ts    # Executores de providers
│   │   ├── ffmpeg.ts       # Renderização de vídeo
│   │   ├── executors/      # Executores por tipo de step
│   │   │   ├── llm.ts
│   │   │   ├── tts.ts
│   │   │   ├── render.ts
│   │   │   ├── scene-prompts.ts
│   │   │   └── generate-images.ts
│   │   └── ...
│   ├── timeline/           # Timeline DSL
│   │   ├── schema.ts       # Tipos Timeline
│   │   ├── compiler.ts     # Compila Timeline → RenderPlan
│   │   └── validator.ts    # Validação
│   └── utils.ts
│
├── config/                  # Configurações estáticas
│   ├── presets/            # JSON de presets
│   └── prompts/            # Templates de prompts
│
├── scripts/                 # Scripts utilitários
│   ├── backup.sh           # Backup do banco
│   ├── restore.sh          # Restore do banco
│   ├── e2e.ts              # Teste end-to-end
│   └── seed-*.ts           # Seeds específicos
│
├── artifacts/               # Arquivos gerados por jobs
│   └── {job-id}/           # Pasta por job
│       └── {step-key}/     # Pasta por step
│
├── docs/                    # Documentação
├── video-factory.db         # Banco SQLite
├── .env.local              # Variáveis de ambiente
├── package.json
└── drizzle.config.ts       # Config do Drizzle
```

---

## 4. Schema do Banco de Dados

### Tabelas Principais

#### `projects` - Contexto de Projeto (Canais)
```typescript
{
  id: string;                    // UUID
  key: string;                   // 'graciela', 'mil-nightmares'
  name: string;                  // Nome do projeto
  description?: string;
  voiceRate?: string;            // '-50%' to '+50%'
  voicePitch?: string;           // '-30%' to '+30%'
  llmTemperature?: number;       // 0 to 1
  llmMaxTokens?: number;
  imageStylePrefix?: string;
  imageStyleSuffix?: string;
  isActive: boolean;
  createdAt: string;
}
```

#### `recipes` - Pipelines de Produção
```typescript
{
  id: string;
  slug: string;                  // 'graciela-storytelling-v3'
  name: string;
  description?: string;
  pipeline: string;              // JSON array de steps
  defaultVoicePresetSlug?: string;
  defaultVideoPresetSlug?: string;
  validatorsConfig?: string;     // JSON: {"script": ["validator-slug"]}
  version: number;
  isActive: boolean;
}
```

**Exemplo de Pipeline:**
```json
[
  {"key": "titulo", "name": "Título", "kind": "llm"},
  {"key": "roteiro", "name": "Roteiro", "kind": "llm"},
  {"key": "parse_script", "name": "Limpar Script", "kind": "transform"},
  {"key": "tts", "name": "Narração", "kind": "tts"},
  {"key": "render", "name": "Vídeo Final", "kind": "render"}
]
```

#### `prompts` - Templates LLM
```typescript
{
  id: string;
  slug: string;                  // 'graciela-script-v3'
  name: string;
  category: string;              // 'script', 'title', 'brief'
  description?: string;
  systemPrompt?: string;         // System prompt
  userTemplate: string;          // Template com {{variáveis}}
  model: string;                 // 'claude-sonnet-4-20250514'
  maxTokens: number;             // 4096
  temperature: number;           // 0.7
  kbTiers?: string;              // JSON: ["tier1", "tier2"]
  version: number;
  isActive: boolean;
}
```

#### `knowledgeBase` - Documentos de Contexto
```typescript
{
  id: string;
  slug: string;
  name: string;
  tier: string;                  // 'tier1' (sempre), 'tier2' (contexto), 'tier3' (demanda)
  category: string;              // 'dna', 'rules', 'examples'
  content: string;               // Conteúdo do documento
  recipeSlug?: string;           // null = global
  isActive: boolean;
}
```

#### `executionBindings` - Wiring de Configurações
```typescript
{
  id: string;
  scope: string;                 // 'global' | 'project'
  projectId?: string;
  recipeId: string;
  stepKey: string;               // 'script', 'tts', 'render', '*'
  slot: string;                  // 'prompt' | 'provider' | 'preset_voice' | 'kb'
  targetId: string;              // ID da entidade vinculada
  priority: number;
  isActive: boolean;
}
```

#### `presetsVoice` - Configurações de Voz Azure
```typescript
{
  id: string;
  slug: string;                  // 'es-mx-dalia-narradora'
  name: string;
  voiceName: string;             // 'es-MX-DaliaNeural'
  language: string;              // 'es-MX'
  rate: number;                  // 0.5 to 2.0
  pitch: string;                 // '-50%' to '+50%'
  volume: string;                // 'default', 'loud', 'soft'
  style?: string;                // 'narration-professional', 'sad'
  styleDegree?: number;          // 0.01 to 2.0
  role?: string;                 // 'Girl', 'Boy'
  isActive: boolean;
}
```

#### `presetsVideo` - Configurações de Renderização
```typescript
{
  id: string;
  slug: string;                  // 'mac-videotoolbox-720p'
  name: string;
  encoder: string;               // 'h264_videotoolbox', 'libx264'
  scale: string;                 // '1920:1080', '1280:720'
  fps: number;                   // 30, 60
  bitrate: string;               // '4M', '8M'
  pixelFormat: string;           // 'yuv420p'
  audioCodec: string;            // 'aac'
  audioBitrate: string;          // '192k'
  isActive: boolean;
}
```

#### `jobs` - Execuções de Vídeo
```typescript
{
  id: string;
  projectId?: string;
  recipeId: string;
  recipeSlug: string;
  recipeVersion: number;
  input: string;                 // JSON: {title, brief, ...}
  manifest?: string;             // JSON completo da execução
  status: string;                // 'pending', 'running', 'completed', 'failed'
  executionMode: string;         // 'auto' | 'wizard'
  state?: string;                // DarkFlow state machine
  currentStep?: string;
  progress: number;              // 0-100
  language?: string;             // 'pt-BR', 'es-ES'
  voicePresetId?: string;
  visualMode?: string;           // 'manual_upload', 'automatic'
  captionsEnabled?: boolean;
  zoomEnabled?: boolean;
  lastError?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  deletedAt?: string;            // Soft delete
}
```

#### `jobSteps` - Estado por Etapa
```typescript
{
  id: string;
  jobId: string;
  stepKey: string;               // 'titulo', 'roteiro', 'tts'
  stepOrder: number;
  inputHash: string;             // Hash para idempotência
  status: string;                // 'pending', 'running', 'success', 'failed'
  outputRefs?: string;           // JSON: {"script": "/path"}
  logs?: string;
  attempts: number;
  lastError?: string;
  durationMs?: number;
  startedAt?: string;
  completedAt?: string;
}
```

#### `artifacts` - Arquivos Gerados
```typescript
{
  id: string;
  jobId: string;
  stepKey: string;
  type: string;                  // 'script', 'audio', 'video', 'manifest'
  path: string;                  // './artifacts/{job}/{step}/file'
  filename: string;
  checksum?: string;             // SHA-256
  sizeBytes?: number;
  version: number;
  isLatest: boolean;
  mimeType?: string;
  metadata?: string;             // JSON extra
  createdAt: string;
}
```

#### `providers` - Configurações de APIs
```typescript
{
  id: string;
  slug: string;                  // 'claude', 'azure-tts'
  name: string;
  type: string;                  // 'llm', 'tts', 'image'
  defaultModel?: string;
  baseUrl?: string;
  config?: string;               // JSON (SEM secrets!)
  isActive: boolean;
}
```

#### `validators` - Regras de Validação
```typescript
{
  id: string;
  slug: string;
  name: string;
  type: string;                  // 'forbidden_patterns', 'min_words', 'max_words'
  config: string;                // JSON: {"patterns": [...]}
  errorMessage: string;
  severity: string;              // 'error', 'warning'
  isActive: boolean;
}
```

---

## 5. Engine de Execução

### Runner Principal (`lib/engine/runner.ts`)

O `runner.ts` é o orquestrador central. Ele:

1. **Carrega a Recipe** do banco
2. **Resolve configurações** via `executionBindings`
3. **Executa steps sequencialmente** (LLM, TTS, Render)
4. **Salva artifacts** em disco
5. **Gera manifest** completo da execução

```typescript
// Fluxo simplificado
async function runJob(jobId: string) {
  const job = await loadJob(jobId);
  const recipe = await loadRecipe(job.recipeId);
  const pipeline = JSON.parse(recipe.pipeline);
  
  for (const stepDef of pipeline) {
    const stepConfig = await resolveStepConfig(stepDef, job.projectId);
    const result = await executeStep(stepDef, stepConfig, previousOutputs);
    previousOutputs[stepDef.key] = result.response?.output;
  }
}
```

### Executores por Tipo

#### LLM Executor (`executeLLM`)
```typescript
// lib/engine/providers.ts
async function executeLLM(request: LLMRequest): Promise<LLMResponse> {
  // 1. Carrega prompt do banco
  // 2. Substitui {{variáveis}} no template
  // 3. Adiciona KB context ao system prompt
  // 4. Chama Claude via fetch
  // 5. Retorna output + usage
}
```

#### TTS Executor (`executeTTS`)
```typescript
// lib/engine/providers.ts
async function executeTTS(request: TTSRequest): Promise<TTSResponse> {
  // 1. Carrega voice preset do banco
  // 2. Constrói SSML com prosody/style
  // 3. Cria batch job no Azure
  // 4. Aguarda conclusão (polling)
  // 5. Baixa e extrai ZIP com MP3
  // 6. Salva artifact
}
```

#### FFmpeg Executor (`renderVideo`)
```typescript
// lib/engine/ffmpeg.ts
async function renderVideo(options: RenderOptions): Promise<RenderResult> {
  // 1. Carrega video preset do banco
  // 2. Configura fluent-ffmpeg
  // 3. Combina audio + imagem de fundo
  // 4. Aplica efeitos (opcional)
  // 5. Salva video final
}
```

### Step Mapper (`lib/engine/step-mapper.ts`)

Mapeia step keys para tipos de executor:

```typescript
const STEP_TYPES = {
  'titulo': 'llm',
  'roteiro': 'llm',
  'script': 'llm',
  'parse_script': 'transform',
  'parse_ssml': 'transform',
  'tts': 'tts',
  'render': 'render',
  'prompts_cenas': 'scene_prompts',
  'gerar_imagens': 'generate_images',
};
```

---

## 6. Providers e Integrações

### Claude (Anthropic)

**Arquivo:** `lib/engine/providers.ts` → `executeLLM()`

```typescript
// Configuração
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.ANTHROPIC_API_KEY,
    "anthropic-version": "2023-06-01",
  },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    temperature: 0.7,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }]
  }),
});
```

### Azure Speech (TTS)

**Arquivo:** `lib/engine/providers.ts` → `executeTTS()`

Usa **Batch Synthesis API**:

```typescript
// 1. Criar batch job
PUT https://{region}.api.cognitive.microsoft.com/texttospeech/batchsyntheses/{jobId}

// 2. Poll status
GET https://{region}.api.cognitive.microsoft.com/texttospeech/batchsyntheses/{jobId}

// 3. Download ZIP com MP3
```

**SSML gerado:**
```xml
<speak version="1.0" xmlns="..." xml:lang="es-MX">
  <voice name="es-MX-DaliaNeural">
    <mstts:express-as style="narration-professional" styledegree="1.2">
      <prosody rate="1.0" pitch="0%">
        {conteúdo}
      </prosody>
    </mstts:express-as>
  </voice>
</speak>
```

### ImageFX (Google)

**Arquivo:** `lib/adapters/imagefx.ts`

⚠️ **Limitação:** ImageFX não tem API pública. Requer cookies de sessão do Google.

```typescript
// Fluxo
1. getAccessToken(cookies)  // Obtém token de sessão
2. POST https://aisandbox-pa.googleapis.com/v1:runImageFx
3. Extrai base64 das imagens
4. Salva como PNG
```

**Sanitização de prompts:**
- Remove nomes próprios brasileiros (podem bloquear)
- Converte idades de menores para "jovem adulto"
- Remove violência gráfica
- Remove uniformes escolares

### FFmpeg

**Arquivo:** `lib/engine/ffmpeg.ts`

```typescript
// Usa fluent-ffmpeg
import ffmpeg from 'fluent-ffmpeg';

// Encoder preferido no Mac: h264_videotoolbox
// Fallback: libx264

// Output options padrão
[
  '-c:v', 'h264_videotoolbox',
  '-pix_fmt', 'yuv420p',
  '-b:v', '4M',
  '-r', '30',
  '-c:a', 'aac',
  '-b:a', '192k',
  '-shortest',
  '-movflags', '+faststart',
]
```

---

## 7. APIs e Server Actions

### Server Actions (App Router)

#### Admin Actions (`app/admin/actions.ts`)

| Função | Descrição |
|--------|-----------|
| `getPrompts(search?, category?)` | Lista prompts com filtros |
| `createPrompt(data)` | Cria novo prompt |
| `updatePrompt(id, data)` | Atualiza prompt |
| `getProviders()` | Lista providers |
| `getRecipes()` | Lista recipes |
| `getKnowledgeBase()` | Lista KB docs |
| `getPresets(type?)` | Lista presets |
| `getProjects()` | Lista projetos |
| `updateProjectBinding()` | Configura binding |

#### Jobs Actions (`app/jobs/actions.ts`)

| Função | Descrição |
|--------|-----------|
| `getJobs(status?, search?, projectId?)` | Lista jobs |
| `getJobById(jobId)` | Detalhes do job |
| `getJobSteps(jobId)` | Lista steps do job |
| `getJobArtifacts(jobId)` | Lista artifacts |
| `createJob(recipeId, projectId, input)` | Cria novo job |
| `startJob(jobId)` | Inicia execução |
| `resumeJob(jobId)` | Resume job pausado/falho |
| `retryStep(jobId, stepKey)` | Retry step específico |
| `retryWithInstruction(jobId, stepKey, hint)` | Retry com instrução |
| `cancelJob(jobId)` | Cancela job |
| `deleteJob(jobId)` | Soft delete |

### API Routes

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/health` | GET | Health check |
| `/api/jobs` | GET/POST | CRUD de jobs |
| `/api/artifacts/[...path]` | GET | Serve arquivos |

---

## 8. Componentes Frontend

### Layout (`components/layout/`)

- **`AppShell.tsx`**: Container principal com sidebar
- **`Sidebar.tsx`**: Navegação lateral
- **`Header.tsx`**: Header com breadcrumbs

### Video Factory (`components/vf/`)

| Componente | Função |
|------------|--------|
| `JobCard.tsx` | Card de job com status |
| `MetricCard.tsx` | Card de métrica |
| `StatusBadge.tsx` | Badge de status colorido |
| `StepPreview.tsx` | Preview de step (script, audio, video) |
| `WizardStepper.tsx` | Stepper do wizard |
| `WizardFooter.tsx` | Botões de ação do wizard |
| `PipelineView.tsx` | Visualização do pipeline |
| `LogsViewer.tsx` | Viewer de logs |
| `ManifestViewer.tsx` | Viewer de manifest JSON |
| `ErrorDetail.tsx` | Detalhes de erro |
| `IterateWithAI.tsx` | Input para retry com instrução |

### UI (`components/ui/`)

Componentes shadcn/ui:
- Button, Input, Label
- Card, Dialog, Tabs
- Select, Slider, Progress
- ScrollArea, Separator

---

## 9. Fluxo de Dados

### Criação de Job

```
1. User submits form (idea/title)
     ↓
2. createJob(recipeId, projectId, input)
   - Enriquece input com timestamp e nomes
   - Insere job no banco (status: pending)
     ↓
3. startJob(jobId)
   - Chama engineRunJob em background
     ↓
4. runJob(jobId)
   - Carrega job e recipe do banco
   - Para cada step do pipeline:
     a. Resolve config via executionBindings
     b. Executa executor apropriado (llm/tts/render)
     c. Salva artifacts
     d. Atualiza job_steps
   - Atualiza job status para completed/failed
```

### Resolução de Configuração

```
getEffectiveConfig(recipeId, stepKey, projectId)
     ↓
1. Buscar binding com scope='project' e projectId
   (Se encontrar, usa esse)
     ↓
2. Buscar binding com scope='global'
   (Fallback)
     ↓
3. Carregar entidade do targetId
   (prompt, provider, preset, etc.)
```

### Diagram de Conexões

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard      Jobs List      Wizard       Admin Panel         │
│      ↓              ↓            ↓              ↓                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Server Actions (app/**/actions.ts)           │   │
│  └──────────────────────────────────────────────────────────┘   │
│      ↓                                                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Database (lib/db/)                       │   │
│  │  SQLite + Drizzle ORM                                    │   │
│  │  Tables: jobs, job_steps, artifacts, prompts, recipes... │   │
│  └──────────────────────────────────────────────────────────┘   │
│      ↓                                                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 Engine (lib/engine/)                      │   │
│  │  runner.ts → providers.ts → ffmpeg.ts                    │   │
│  │       ↓            ↓             ↓                        │   │
│  │   Claude API   Azure TTS    FFmpeg CLI                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│      ↓                                                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                Artifacts (./artifacts/)                   │   │
│  │  {job-id}/{step-key}/output.txt, audio.mp3, video.mp4   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. Configuração e Deploy

### Variáveis de Ambiente

```bash
# .env.local

# AI Providers
ANTHROPIC_API_KEY=sk-ant-...          # Claude API
AZURE_SPEECH_KEY=...                   # Azure Speech
AZURE_SPEECH_REGION=eastus2            # Azure region

# Opcional
IMAGEFX_COOKIES=...                    # Cookies do Google para ImageFX
DATABASE_URL=file:./video-factory.db   # Caminho do SQLite
```

### Instalação

```bash
# 1. Clone o repositório
git clone <repo> video-factory-os
cd video-factory-os

# 2. Instale dependências
npm install

# 3. Configure ambiente
cp .env.example .env.local
# Edite .env.local com suas API keys

# 4. Seed do banco de dados
npm run db:seed

# 5. Inicie o servidor
npm run dev
```

### Scripts NPM

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Inicia servidor de produção |
| `npm run db:seed` | Executa seed do banco |
| `npm run db:backup` | Backup do banco |
| `npm run db:restore` | Restore do banco |
| `npm run db:studio` | Abre Drizzle Studio |
| `npm run vf:e2e` | Teste end-to-end |

---

## 11. Checklist de Replicação

### ✅ Pré-requisitos

- [ ] Node.js 18+ instalado
- [ ] FFmpeg instalado no sistema
- [ ] Conta Anthropic com API key
- [ ] Conta Azure com Speech Services
- [ ] (Opcional) Conta Google para ImageFX

### ✅ Setup Inicial

- [ ] Clonar repositório
- [ ] `npm install`
- [ ] Criar `.env.local` com API keys
- [ ] `npm run db:seed`

### ✅ Verificar Funcionamento

- [ ] `npm run dev` inicia sem erros
- [ ] Dashboard carrega em http://localhost:3000
- [ ] Admin Panel acessível em /admin
- [ ] Criar job de teste
- [ ] Executar job e verificar artifacts

### ✅ Customização

- [ ] Criar novo Project no Admin
- [ ] Criar prompts customizados
- [ ] Configurar voice presets
- [ ] Criar recipe customizada
- [ ] Vincular prompts à recipe via Execution Map
- [ ] Adicionar knowledge base docs

### ✅ Produção

- [ ] `npm run build` sem erros
- [ ] Configurar variáveis de ambiente no host
- [ ] Configurar volume persistente para SQLite
- [ ] Configurar volume para artifacts
- [ ] Setup de backup automático

---

## Arquivos Críticos para Replicação

1. **`lib/db/schema.ts`** - Schema completo do banco
2. **`lib/db/seed.ts`** - Seed com dados iniciais
3. **`lib/engine/runner.ts`** - Orquestrador principal
4. **`lib/engine/providers.ts`** - Executores de API
5. **`lib/engine/ffmpeg.ts`** - Renderização de vídeo
6. **`app/admin/actions.ts`** - CRUD do admin
7. **`app/jobs/actions.ts`** - Gestão de jobs
8. **`package.json`** - Dependências exatas

---

## Contato

Este documento foi gerado automaticamente. Para atualizações, re-execute a análise do código fonte.

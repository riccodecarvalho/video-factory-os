# Video Factory OS - Referência de APIs

> Documentação das APIs, Server Actions e funções principais do sistema.

---

## Índice

1. [Server Actions - Admin](#1-server-actions---admin)
2. [Server Actions - Jobs](#2-server-actions---jobs)
3. [Engine Functions](#3-engine-functions)
4. [Provider Functions](#4-provider-functions)
5. [Database Functions](#5-database-functions)
6. [Utility Functions](#6-utility-functions)

---

## 1. Server Actions - Admin

**Arquivo:** `app/admin/actions.ts`

### Prompts

```typescript
// Lista prompts com filtros opcionais
async function getPrompts(
  search?: string,    // Busca por nome/slug
  category?: string   // 'script', 'title', 'brief', 'all'
): Promise<Prompt[]>

// Cria novo prompt
async function createPrompt(
  data: Partial<PromptInsert>
): Promise<Prompt>

// Atualiza prompt existente
async function updatePrompt(
  id: string,
  data: Partial<PromptInsert>
): Promise<void>

// Retorna contagem por categoria
async function getPromptCategories(): Promise<Record<string, number>>
```

### Providers

```typescript
// Lista providers
async function getProviders(
  search?: string,
  type?: string      // 'llm', 'tts', 'image', 'all'
): Promise<Provider[]>

// Cria provider
async function createProvider(): Promise<Provider>

// Atualiza provider
async function updateProvider(
  id: string,
  data: Partial<ProviderInsert>
): Promise<void>

// Retorna contagem por tipo
async function getProviderTypes(): Promise<Record<string, number>>
```

### Recipes

```typescript
// Lista recipes
async function getRecipes(search?: string): Promise<Recipe[]>

// Cria recipe
async function createRecipe(): Promise<Recipe>

// Atualiza recipe
async function updateRecipe(
  id: string,
  data: Partial<RecipeInsert>
): Promise<void>
```

### Knowledge Base

```typescript
// Lista KB docs
async function getKnowledgeBase(
  search?: string,
  tier?: string      // 'tier1', 'tier2', 'tier3', 'all'
): Promise<KnowledgeBase[]>

// Cria KB doc
async function createKnowledge(): Promise<KnowledgeBase>

// Atualiza KB doc
async function updateKnowledge(
  id: string,
  data: Partial<KnowledgeBaseInsert>
): Promise<void>

// Retorna contagem por tier
async function getKnowledgeTiers(): Promise<Record<string, number>>
```

### Presets

```typescript
// Lista todos os presets
async function getPresets(
  type?: 'voice' | 'video' | 'effects' | 'ssml',
  search?: string
): Promise<Preset[]>

// Presets específicos
async function getVoicePresets(): Promise<VoicePreset[]>
async function getVideoPresets(): Promise<VideoPreset[]>
async function getSsmlPresets(): Promise<SsmlPreset[]>
async function getEffectsPresets(): Promise<EffectsPreset[]>

// CRUD Video Preset
async function createVideoPreset(data: Partial<VideoPresetInsert>): Promise<VideoPreset>
async function updateVideoPreset(id: string, data: Partial<VideoPresetInsert>): Promise<void>
async function deleteVideoPreset(id: string): Promise<void>

// Atualiza preset genérico
async function updatePreset(
  type: 'voice' | 'video' | 'effects' | 'ssml',
  id: string,
  data: Record<string, unknown>
): Promise<void>

// Contagem por tipo
async function getPresetCounts(): Promise<{
  all: number;
  voice: number;
  video: number;
  effects: number;
  ssml: number;
}>
```

### Validators

```typescript
// Lista validators
async function getValidators(
  search?: string,
  type?: string
): Promise<Validator[]>

// Cria validator
async function createValidator(): Promise<Validator>

// Atualiza validator
async function updateValidator(
  id: string,
  data: Partial<ValidatorInsert>
): Promise<void>

// Contagem por tipo
async function getValidatorTypes(): Promise<Record<string, number>>
```

### Projects

```typescript
// Lista projetos
async function getProjects(search?: string): Promise<Project[]>

// Cria projeto
async function createProject(): Promise<Project>

// Atualiza projeto
async function updateProject(
  id: string,
  data: Partial<{
    name: string;
    key: string;
    description: string;
    voiceRate: string;
    voicePitch: string;
    llmTemperature: number;
    llmMaxTokens: number;
    imageStylePrefix: string;
    imageStyleSuffix: string;
  }>
): Promise<void>

// Toggle ativo/inativo
async function toggleProjectActive(
  id: string,
  isActive: boolean
): Promise<void>
```

### Project Bindings

```typescript
type ProjectBindingSlot = 
  | 'provider_llm' 
  | 'provider_tts' 
  | 'preset_voice' 
  | 'preset_video' 
  | 'recipe' 
  | 'kb';

interface ProjectBinding {
  slot: ProjectBindingSlot;
  targetId: string;
  targetName: string;
  targetSlug: string;
  isActive?: boolean;
}

// Obtém bindings de um projeto
async function getProjectBindings(projectId: string): Promise<ProjectBinding[]>

// Atualiza binding
async function updateProjectBinding(
  projectId: string,
  slot: ProjectBindingSlot,
  targetId: string,
  recipeId?: string
): Promise<void>

// Toggle KB binding
async function toggleProjectKbBinding(
  projectId: string,
  kbId: string,
  isActive: boolean
): Promise<void>

// Listas para seleção
async function getAvailableProvidersForProject(): Promise<{
  llm: Array<{id: string; name: string; slug: string; model?: string}>;
  tts: Array<{id: string; name: string; slug: string}>;
}>

async function getAvailablePresetsForProject(): Promise<{
  voice: Array<{id: string; name: string; slug: string; voiceName: string}>;
  video: Array<{id: string; name: string; slug: string; scale: string}>;
}>

async function getAvailableRecipesForProject(): Promise<
  Array<{id: string; name: string; slug: string}>
>
```

---

## 2. Server Actions - Jobs

**Arquivo:** `app/jobs/actions.ts`

### Queries

```typescript
// Lista jobs com filtros
async function getJobs(
  status?: string,    // 'pending', 'running', 'completed', 'failed', 'all'
  search?: string,    // Busca por ID ou título
  projectId?: string  // Filtra por projeto
): Promise<Job[]>

// Contagem por status
async function getJobStatusCounts(): Promise<{
  all: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
}>

// Detalhes do job
async function getJobById(jobId: string): Promise<Job | null>

// Steps do job
async function getJobSteps(jobId: string): Promise<JobStep[]>

// Artifacts do job
async function getJobArtifacts(jobId: string): Promise<Artifact[]>
```

### Mutations

```typescript
// Cria novo job
async function createJob(
  recipeId: string,
  projectId: string,
  input: Record<string, unknown>,  // {idea, title, duracao, ...}
  executionMode?: 'auto' | 'wizard'
): Promise<Job>

// Inicia execução
async function startJob(jobId: string): Promise<{success: boolean}>

// Resume job pausado/falho
async function resumeJob(jobId: string): Promise<{success: boolean}>

// Continua wizard
async function continueWizard(jobId: string): Promise<{success: boolean}>

// Retry step específico
async function retryStep(
  jobId: string,
  stepKey: string
): Promise<{success: boolean; error?: string}>

// Retry a partir de step
async function retryFromStep(
  jobId: string,
  stepKey: string
): Promise<{success: boolean; error?: string}>

// Retry com instrução customizada
async function retryWithInstruction(
  jobId: string,
  stepKey: string,
  instruction: string  // Ex: "Use um tom mais dramático"
): Promise<{success: boolean; error?: string}>

// Cancela job
async function cancelJob(jobId: string): Promise<{success: boolean}>

// Soft delete
async function deleteJob(jobId: string): Promise<{success: boolean}>

// Atualiza input do job
async function updateJobInput(
  jobId: string,
  inputUpdates: Record<string, unknown>
): Promise<{success: boolean}>
```

---

## 3. Engine Functions

**Arquivo:** `lib/engine/runner.ts`

### Orquestração

```typescript
// Executa job completo
async function runJob(jobId: string): Promise<void>
// - Carrega job e recipe
// - Executa pipeline de steps sequencialmente
// - Atualiza status e gera manifest

// Retry step específico
async function retryJobStep(
  jobId: string,
  stepKey: string
): Promise<{success: boolean; error?: string}>

// Cancela job em execução
async function cancelJob(jobId: string): Promise<void>
```

**Arquivo:** `lib/engine/providers.ts`

### Executores

```typescript
interface LLMRequest {
  provider: ProviderConfig;
  prompt: PromptConfig;
  variables: Record<string, unknown>;
  kbContext?: string;
}

interface LLMResponse {
  success: boolean;
  output?: string;
  usage?: {inputTokens: number; outputTokens: number};
  model: string;
  duration_ms: number;
  error?: {code: string; message: string};
}

// Executa chamada LLM (Claude)
async function executeLLM(request: LLMRequest): Promise<LLMResponse>

interface TTSRequest {
  provider: ProviderConfig;
  input: string;  // texto ou SSML
  voicePreset: {
    id: string;
    voiceName: string;
    language: string;
    rate?: number;
    pitch?: string;
    style?: string;
    styleDegree?: number;
  };
  ssmlPreset?: {
    id: string;
    pauseMapping: Record<string, number>;
  };
  outputPath: string;
}

interface TTSResponse {
  success: boolean;
  artifactUri?: string;
  contentType?: string;
  durationSec?: number;
  fileSizeBytes?: number;
  error?: {code: string; message: string};
}

// Executa TTS (Azure Batch)
async function executeTTS(request: TTSRequest): Promise<TTSResponse>

// Executa validators
function executeValidators(
  content: string,
  validators: ValidatorConfig[]
): ValidationResult[]
```

**Arquivo:** `lib/engine/ffmpeg.ts`

### Renderização

```typescript
interface VideoPreset {
  encoder: string;       // 'h264_videotoolbox' | 'libx264'
  scale: string;         // '1920:1080' | '1280:720'
  fps: number;
  bitrate: string;
  pixelFormat: string;
  audioCodec: string;
  audioBitrate: string;
}

interface RenderOptions {
  audioPath: string;
  backgroundImagePath?: string;
  outputPath: string;
  preset: VideoPreset;
}

interface RenderResult {
  success: boolean;
  outputPath?: string;
  durationSec?: number;
  fileSizeBytes?: number;
  error?: {code: string; message: string; stderr?: string};
}

// Renderiza vídeo
async function renderVideo(options: RenderOptions): Promise<RenderResult>

// Obtém duração do áudio
async function getAudioDuration(audioPath: string): Promise<number | null>

// Obtém duração do vídeo
async function getVideoDuration(videoPath: string): Promise<number | null>

// Extrai thumbnail
async function extractThumbnail(
  videoPath: string,
  outputPath: string,
  timePercentage?: number  // default: 50
): Promise<{success: boolean; thumbnailPath?: string; error?: string}>

// Verifica FFmpeg disponível
async function checkFFmpegAvailable(): Promise<boolean>
```

---

## 4. Provider Functions

**Arquivo:** `lib/adapters/imagefx.ts`

### ImageFX (Google)

```typescript
interface ImageFXConfig {
  cookies: string;
  aspect_ratio?: 'LANDSCAPE' | 'PORTRAIT' | 'SQUARE';
  num_images?: number;
  seed?: number;
}

interface ImageFXResult {
  success: boolean;
  images?: Buffer[];
  imagesBase64?: string[];
  error?: string;
  count?: number;
}

// Gera imagem via ImageFX
async function generateImageFX(
  prompt: string,
  config: ImageFXConfig
): Promise<ImageFXResult>

// Sanitiza prompt (remove conteúdo problemático)
function sanitizePrompt(prompt: string): string

// Valida cookies
function validateCookies(cookies: string): boolean

// Obtém cookies do env
function getCookiesFromEnv(): string | null
```

---

## 5. Database Functions

**Arquivo:** `lib/db/index.ts`

```typescript
// Obtém conexão do banco
function getDb(): BetterSqlite3Database

// Fecha conexão
function closeDb(): void
```

**Arquivo:** `lib/db/schema.ts`

### Tabelas Exportadas

```typescript
export const projects;           // Projetos/canais
export const executionBindings;  // Wiring de config
export const prompts;            // Prompts LLM
export const knowledgeBase;      // KB docs
export const presetsVoice;       // Voice presets
export const presetsVideo;       // Video presets
export const presetsEffects;     // Effects presets
export const presetsSsml;        // SSML presets
export const presets;            // Presets unificados
export const validators;         // Validators
export const providers;          // Providers
export const recipes;            // Recipes
export const jobs;               // Jobs
export const jobSteps;           // Job steps
export const artifacts;          // Artifacts
export const auditEvents;        // Audit trail
export const scriptVersions;     // Script versions
export const sceneMarkers;       // Scene markers
export const jobEvents;          // Job events
export const jobTemplates;       // Job templates
```

---

## 6. Utility Functions

**Arquivo:** `lib/engine/step-mapper.ts`

```typescript
// Obtém chave do output anterior
function getPreviousOutputKey(
  previousOutputs: Record<string, unknown>,
  stepKey: string
): unknown

// Normaliza step key
function normalizeStepKey(key: string): string

// Obtém tipo de executor
function getStepExecutorType(stepKey: string): string
```

**Arquivo:** `lib/engine/capabilities.ts`

```typescript
type StepKind = 'llm' | 'tts' | 'render' | 'transform' | 'scene_prompts' | 'generate_images';

// Obtém kind do step
function getStepKind(stepKey: string): StepKind
```

**Arquivo:** `lib/engine/loaders.ts`

```typescript
// Carrega prompt do banco
async function loadPrompt(promptId: string): Promise<PromptConfig | null>

// Carrega provider do banco
async function loadProvider(providerId: string): Promise<ProviderConfig | null>

// Carrega KB docs e retorna como string
async function loadKnowledgeBase(kbIds: string[]): Promise<string>
```

**Arquivo:** `lib/audit/index.ts`

```typescript
// Registra evento de auditoria
async function auditCrud(
  action: 'created' | 'updated' | 'deleted',
  entityType: string,
  entityId: string,
  entityName: string,
  before?: unknown,
  after?: unknown
): Promise<void>
```

---

## Tipos Principais

### Job

```typescript
interface Job {
  id: string;
  projectId?: string;
  recipeId: string;
  recipeSlug: string;
  recipeVersion: number;
  input: string;  // JSON
  manifest?: string;  // JSON
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  executionMode: 'auto' | 'wizard';
  state?: string;
  currentStep?: string;
  progress: number;
  language?: string;
  voicePresetId?: string;
  visualMode?: string;
  captionsEnabled?: boolean;
  zoomEnabled?: boolean;
  lastError?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  deletedAt?: string;
}
```

### JobStep

```typescript
interface JobStep {
  id: string;
  jobId: string;
  stepKey: string;
  stepOrder: number;
  inputHash: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  outputRefs?: string;  // JSON
  logs?: string;
  attempts: number;
  lastError?: string;
  durationMs?: number;
  startedAt?: string;
  completedAt?: string;
}
```

### Prompt

```typescript
interface Prompt {
  id: string;
  slug: string;
  name: string;
  category: string;
  description?: string;
  systemPrompt?: string;
  userTemplate: string;
  model: string;
  maxTokens: number;
  temperature: number;
  kbTiers?: string;  // JSON
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Recipe

```typescript
interface Recipe {
  id: string;
  slug: string;
  name: string;
  description?: string;
  pipeline: string;  // JSON array
  defaultVoicePresetSlug?: string;
  defaultVideoPresetSlug?: string;
  validatorsConfig?: string;  // JSON
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

Esta documentação foi gerada automaticamente a partir da análise do código fonte.

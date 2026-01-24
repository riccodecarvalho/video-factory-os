# Video Factory OS - Schema de Banco de Dados

> **Arquivo fonte:** `lib/db/schema.ts`
> **Banco:** SQLite com Drizzle ORM
> **Gerado em:** 2026-01-24

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Tabelas de Configuração](#tabelas-de-configuração)
3. [Tabelas de Execução](#tabelas-de-execução)
4. [Execution Bindings](#execution-bindings)
5. [Seed Data](#seed-data)
6. [Queries Comuns](#queries-comuns)

---

## VISÃO GERAL

### Princípios

- **Config-First:** Toda configuração vive no banco, zero hardcode
- **Versionamento:** Prompts e recipes têm versão
- **Auditoria:** Todas as mudanças são rastreadas
- **Soft Delete:** Jobs usam `deletedAt` ao invés de DELETE

### Diagrama de Relacionamentos

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│  projects   │─1:N─│execution_bindings│─N:1─│   recipes   │
└─────────────┘     └──────────────────┘     └─────────────┘
                            │                       │
                            │ N:1                   │ 1:N
                            ▼                       ▼
┌─────────────┐     ┌─────────────┐         ┌─────────────┐
│   prompts   │     │  providers  │         │    jobs     │
└─────────────┘     └─────────────┘         └──────┬──────┘
                                                   │ 1:N
┌─────────────┐     ┌─────────────┐         ┌──────┴──────┐
│presets_voice│     │presets_video│         │  job_steps  │
└─────────────┘     └─────────────┘         └──────┬──────┘
                                                   │ 1:N
┌─────────────┐     ┌─────────────┐         ┌──────┴──────┐
│presets_ssml │     │ validators  │         │  artifacts  │
└─────────────┘     └─────────────┘         └─────────────┘
```

---

## TABELAS DE CONFIGURAÇÃO

### projects

Contexto de projeto/canal. Permite configurações específicas por canal.

```typescript
export const projects = sqliteTable('projects', {
    id: text('id').primaryKey(),
    key: text('key').notNull().unique(),        // 'graciela', 'vj', etc
    name: text('name').notNull(),
    description: text('description'),
    
    // Voice config per project
    voiceRate: text('voice_rate').default('0%'),
    voicePitch: text('voice_pitch').default('0%'),
    
    // LLM config per project
    llmTemperature: real('llm_temperature').default(0.7),
    llmMaxTokens: integer('llm_max_tokens').default(4096),
    
    // Image config per project
    imageStylePrefix: text('image_style_prefix'),
    imageStyleSuffix: text('image_style_suffix'),
    
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});
```

**Exemplo:**
```json
{
  "id": "uuid-1",
  "key": "graciela",
  "name": "Verdades de Graciela",
  "description": "Canal de storytime em espanhol mexicano",
  "voiceRate": "0%",
  "llmTemperature": 0.75,
  "isActive": true
}
```

---

### recipes

Define o pipeline de steps para produção de vídeo.

```typescript
export const recipes = sqliteTable('recipes', {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
    
    // Pipeline: JSON array de steps
    pipeline: text('pipeline').notNull(),
    
    // Defaults
    defaultVoicePresetSlug: text('default_voice_preset_slug'),
    defaultVideoPresetSlug: text('default_video_preset_slug'),
    
    // Validators por step
    validatorsConfig: text('validators_config'),
    
    version: integer('version').default(1),
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
    updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});
```

**Formato do pipeline:**
```json
[
  {"key": "title", "name": "Gerar Títulos", "promptSlug": "graciela.title.v1", "required": true},
  {"key": "brief", "name": "Expandir Brief", "promptSlug": "graciela.brief.v1", "required": true},
  {"key": "script", "name": "Gerar Roteiro", "promptSlug": "graciela.script.v1", "required": true},
  {"key": "parse_ssml", "name": "Converter para SSML", "ssmlPresetSlug": "graciela-default", "required": true},
  {"key": "tts", "name": "Gerar Áudio", "providerSlug": "azure-tts", "required": true},
  {"key": "render", "name": "Renderizar Vídeo", "videoPresetSlug": "mac-videotoolbox-720p", "required": true},
  {"key": "export", "name": "Exportar Pacote", "required": true}
]
```

---

### prompts

Templates de prompts com configuração do modelo LLM.

```typescript
export const prompts = sqliteTable('prompts', {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    category: text('category').notNull(),       // 'script', 'title', 'brief', etc
    description: text('description'),
    
    // Conteúdo
    systemPrompt: text('system_prompt'),
    userTemplate: text('user_template').notNull(),  // Template com {{variáveis}}
    
    // LLM config
    model: text('model').default('claude-sonnet-4-20250514'),
    maxTokens: integer('max_tokens').default(4096),
    temperature: real('temperature').default(0.7),
    
    // KB tiers a incluir
    kbTiers: text('kb_tiers'),                  // JSON: ["tier1", "tier2"]
    
    version: integer('version').default(1),
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
    updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});
```

**Variáveis suportadas no template:**
- `{{titulo}}` - Título do vídeo
- `{{brief}}` - Brief/ideia base
- `{{duracao}}` - Duração alvo em minutos
- `{{knowledge}}` - KB injetado automaticamente
- `{{iterationHint}}` - Instrução de iteração (retry)

---

### providers

Configuração de APIs externas (Claude, Azure).

```typescript
export const providers = sqliteTable('providers', {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    type: text('type').notNull(),               // 'llm', 'tts', 'image'
    
    defaultModel: text('default_model'),
    baseUrl: text('base_url'),
    config: text('config'),                     // JSON com outras configs
    
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});
```

**Exemplos:**
```json
// Claude
{
  "slug": "claude",
  "name": "Claude (Anthropic)",
  "type": "llm",
  "defaultModel": "claude-sonnet-4-20250514",
  "config": "{\"maxTokens\": 8192}"
}

// Azure TTS
{
  "slug": "azure-tts",
  "name": "Azure Speech Services",
  "type": "tts",
  "baseUrl": "https://brazilsouth.tts.speech.microsoft.com",
  "config": "{\"outputFormat\": \"audio-48khz-192kbitrate-mono-mp3\"}"
}
```

---

### presets_voice

Configuração de vozes Azure Neural.

```typescript
export const presetsVoice = sqliteTable('presets_voice', {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
    
    // Azure voice
    voiceName: text('voice_name').notNull(),    // 'es-MX-DaliaNeural'
    language: text('language').default('es-MX'),
    
    // Prosody
    rate: real('rate').default(1.0),            // 0.5 to 2.0
    pitch: text('pitch').default('0%'),         // '-50%' to '+50%'
    volume: text('volume').default('default'),
    
    // Style (Azure mstts)
    style: text('style'),                       // 'narration-professional', etc
    styleDegree: real('style_degree').default(1.0),
    role: text('role'),                         // 'Girl', 'Boy', etc
    
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});
```

**Vozes padrão Graciela:**
| Slug | Voice | Style | Uso |
|------|-------|-------|-----|
| es-mx-dalia-narradora | DaliaNeural | narration-professional | Narradora principal |
| es-mx-jorge-antagonista | JorgeNeural | serious | Personagens antagonistas |
| es-mx-candela-otro | CandelaNeural | - | Outros personagens |

---

### presets_video

Configuração de render FFmpeg.

```typescript
export const presetsVideo = sqliteTable('presets_video', {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
    
    encoder: text('encoder').default('h264_videotoolbox'),
    scale: text('scale').default('1280:720'),
    fps: integer('fps').default(30),
    bitrate: text('bitrate').default('4M'),
    pixelFormat: text('pixel_format').default('yuv420p'),
    
    audioCodec: text('audio_codec').default('aac'),
    audioBitrate: text('audio_bitrate').default('192k'),
    
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});
```

**Presets disponíveis:**
| Slug | Encoder | Scale | Uso |
|------|---------|-------|-----|
| mac-videotoolbox-720p | h264_videotoolbox | 1280:720 | Mac (hardware) |
| software-libx264-720p | libx264 | 1280:720 | Fallback (software) |

---

### presets_ssml

Mapeamento de pausas e vozes para SSML.

```typescript
export const presetsSsml = sqliteTable('presets_ssml', {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    
    // Pause mappings
    pauseMappings: text('pause_mappings').notNull(),  // JSON
    
    // Voice mappings (Stage Direction → voicePresetSlug)
    voiceMappings: text('voice_mappings').notNull(),  // JSON
    
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});
```

**Exemplo:**
```json
{
  "pauseMappings": {
    "[PAUSA CORTA]": "300ms",
    "[PAUSA]": "500ms",
    "[PAUSA LARGA]": "1000ms"
  },
  "voiceMappings": {
    "NARRADORA": "es-mx-dalia-narradora",
    "ANTAGONISTA": "es-mx-jorge-antagonista",
    "OTRO": "es-mx-candela-otro"
  }
}
```

---

### validators

Regras de validação configuráveis.

```typescript
export const validators = sqliteTable('validators', {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
    
    type: text('type').notNull(),               // Tipo de validação
    config: text('config').notNull(),           // JSON com parâmetros
    errorMessage: text('error_message').notNull(),
    severity: text('severity').default('error'), // 'error', 'warning'
    
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});
```

**Tipos de validação:**
| Type | Config | Função |
|------|--------|--------|
| `forbidden_patterns` | `{patterns: [...]}` | Bloqueia padrões regex |
| `required_patterns` | `{patterns: [...]}` | Exige padrões regex |
| `min_words` | `{minWords: N}` | Mínimo de palavras |
| `max_words` | `{maxWords: N}` | Máximo de palavras |

---

### knowledge_base

Documentos de conhecimento por tier.

```typescript
export const knowledgeBase = sqliteTable('knowledge_base', {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    tier: text('tier').notNull(),               // 'tier1', 'tier2', 'tier3'
    category: text('category').notNull(),       // 'dna', 'rules', 'examples'
    
    content: text('content').notNull(),
    
    recipeSlug: text('recipe_slug'),            // null = global
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
    updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});
```

**Tiers:**
- **tier1:** Sempre incluído (DNA, personalidade)
- **tier2:** Contexto específico (técnicas, exemplos)
- **tier3:** Sob demanda (referências extensas)

---

## TABELAS DE EXECUÇÃO

### jobs

Execuções de produção de vídeo.

```typescript
export const jobs = sqliteTable('jobs', {
    id: text('id').primaryKey(),
    
    projectId: text('project_id'),
    recipeId: text('recipe_id').notNull(),
    recipeSlug: text('recipe_slug').notNull(),
    recipeVersion: integer('recipe_version').notNull(),
    
    input: text('input').notNull(),             // JSON: {titulo, brief, ...}
    manifest: text('manifest'),                 // JSON completo
    
    status: text('status').default('pending'),  // pending, running, completed, failed
    executionMode: text('execution_mode').default('auto'), // 'auto' | 'wizard'
    
    // DarkFlow State Machine
    state: text('state').default('DRAFT'),
    failedStep: text('failed_step'),
    errorMessage: text('error_message'),
    retryCount: integer('retry_count').default(0),
    
    // Config fields
    language: text('language').default('pt-BR'),
    durationPreset: text('duration_preset').default('medium'),
    voicePresetId: text('voice_preset_id'),
    visualMode: text('visual_mode').default('automatic'),
    
    // Progress
    currentStep: text('current_step'),
    progress: integer('progress').default(0),
    lastError: text('last_error'),
    
    // Timestamps
    createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
    startedAt: text('started_at'),
    completedAt: text('completed_at'),
    updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
    deletedAt: text('deleted_at'),              // Soft delete
});
```

**Status Flow:**
```
pending → running → completed
                  ↘ failed
                  ↘ cancelled
```

---

### job_steps

Estado por etapa do pipeline.

```typescript
export const jobSteps = sqliteTable('job_steps', {
    id: text('id').primaryKey(),
    jobId: text('job_id').notNull(),
    
    stepKey: text('step_key').notNull(),
    stepOrder: integer('step_order').notNull(),
    inputHash: text('input_hash').notNull(),    // Idempotency
    
    status: text('status').default('pending'),  // pending, running, success, failed, skipped
    outputRefs: text('output_refs'),            // JSON: {script: "...", audioPath: "..."}
    logs: text('logs'),
    
    attempts: integer('attempts').default(0),
    lastError: text('last_error'),
    durationMs: integer('duration_ms'),
    
    // Locking
    lockedAt: text('locked_at'),
    lockedBy: text('locked_by'),
    
    startedAt: text('started_at'),
    completedAt: text('completed_at'),
});
```

---

### artifacts

Arquivos gerados durante execução.

```typescript
export const artifacts = sqliteTable('artifacts', {
    id: text('id').primaryKey(),
    jobId: text('job_id').notNull(),
    stepKey: text('step_key').notNull(),
    
    type: text('type').notNull(),               // 'script', 'ssml', 'audio', 'video'
    path: text('path').notNull(),
    filename: text('filename').notNull(),
    
    checksum: text('checksum'),                 // SHA-256
    sizeBytes: integer('size_bytes'),
    
    version: integer('version').default(1),
    isLatest: integer('is_latest', { mode: 'boolean' }).default(true),
    
    metadata: text('metadata'),                 // JSON
    mimeType: text('mime_type'),
    
    createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});
```

---

## EXECUTION BINDINGS

### Sistema de Wiring Config-First

```typescript
export const executionBindings = sqliteTable('execution_bindings', {
    id: text('id').primaryKey(),
    
    scope: text('scope').default('global'),     // 'global' | 'project'
    projectId: text('project_id'),              // null for global
    
    recipeId: text('recipe_id').notNull(),
    stepKey: text('step_key').notNull(),
    
    slot: text('slot').notNull(),               // Tipo de binding
    targetId: text('target_id').notNull(),      // ID da entidade
    
    priority: integer('priority').default(0),
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
    updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});
```

### Slots Disponíveis

| Slot | Target Table | Descrição |
|------|--------------|-----------|
| `prompt` | prompts | Prompt a usar no step |
| `provider` | providers | Provider (Claude/Azure) |
| `preset_voice` | presets_voice | Voz para TTS |
| `preset_video` | presets_video | Config de render |
| `preset_ssml` | presets_ssml | Mapeamento SSML |
| `validators` | validators | Validadores (multi) |
| `kb` | knowledge_base | KB docs (multi) |

### Resolução de Config

```typescript
// Prioridade (maior → menor)
1. Project binding (scope='project', projectId=X, stepKey=Y)
2. Project binding (scope='project', projectId=X, stepKey='*')
3. Global binding (scope='global', projectId=null, stepKey=Y)
4. Global binding (scope='global', projectId=null, stepKey='*')
5. Default da recipe
```

---

## SEED DATA

### Dados Iniciais (lib/db/seed.ts)

O seed cria configuração completa para o canal Graciela:

```bash
npm run db:seed
```

**O que é criado:**

1. **Project:** Graciela
2. **Providers:** Claude, Azure TTS
3. **Voice Presets:** Dalia (narradora), Jorge (antagonista), Candela (outro)
4. **Video Presets:** VideoToolbox 720p, libx264 720p
5. **SSML Preset:** Graciela default (pause + voice mappings)
6. **Validators:** Stage Directions (no SSML, no Markdown, min words, etc)
7. **Prompts:** Title, Brief, Script (v1)
8. **Knowledge Base:** DNA Graciela, Técnicas de Hook
9. **Recipe:** Graciela YouTube Long (pipeline completo)
10. **Execution Bindings:** Wiring de todos os steps

---

## QUERIES COMUNS

### Listar Jobs com Status

```typescript
const jobs = await db.select()
  .from(schema.jobs)
  .where(eq(schema.jobs.status, 'running'))
  .orderBy(desc(schema.jobs.createdAt));
```

### Buscar Config Efetiva para Step

```typescript
// Via app/admin/execution-map/actions.ts
const config = await getEffectiveConfig(recipeId, stepKey, projectId);
// Retorna: {prompt, provider, preset_voice, preset_video, validators, kb}
```

### Criar Job

```typescript
const job = await db.insert(schema.jobs).values({
  id: uuid(),
  projectId,
  recipeId: recipe.id,
  recipeSlug: recipe.slug,
  recipeVersion: recipe.version,
  input: JSON.stringify({titulo, brief}),
  status: 'pending',
  createdAt: new Date().toISOString(),
});
```

### Atualizar Step Status

```typescript
await db.update(schema.jobSteps)
  .set({
    status: 'success',
    outputRefs: JSON.stringify(output),
    completedAt: new Date().toISOString(),
    durationMs: duration,
  })
  .where(eq(schema.jobSteps.id, stepId));
```

---

*Documento gerado pela análise exaustiva do Video Factory OS.*

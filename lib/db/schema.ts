/**
 * Video Factory OS - Database Schema
 * 
 * Config-First: Tudo que pode ser configurado está no DB.
 * Zero hardcoding: prompts, presets, validators, recipes.
 */

import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core';

// ============================================
// PROJECTS - Contexto de projeto (canais)
// ============================================
export const projects = sqliteTable('projects', {
    id: text('id').primaryKey(),
    key: text('key').notNull().unique(), // 'graciela', 'mil-nightmares', etc
    name: text('name').notNull(),
    description: text('description'),

    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

// ============================================
// EXECUTION BINDINGS - Fonte da verdade para wiring
// ============================================
export const executionBindings = sqliteTable('execution_bindings', {
    id: text('id').primaryKey(),

    // Scope: global applies to all, project overrides global
    scope: text('scope').notNull().default('global'), // 'global' | 'project'
    projectId: text('project_id'), // null for global, FK projects for project override

    // Recipe context
    recipeId: text('recipe_id').notNull(),

    // Step context
    stepKey: text('step_key').notNull(), // 'title', 'brief', 'script', 'tts', 'render'

    // Slot type being bound
    slot: text('slot').notNull(), // 'prompt' | 'provider' | 'preset_voice' | 'preset_video' | 'preset_ssml' | 'validators' | 'kb'

    // Target entity ID (references the appropriate table based on slot)
    targetId: text('target_id').notNull(),

    // Priority for multi-value slots (validators, kb)
    priority: integer('priority').default(0),

    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
    updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
});

// ============================================
// PROMPTS - Templates com variáveis e config do modelo
// ============================================
export const prompts = sqliteTable('prompts', {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    category: text('category').notNull(), // 'script', 'title', 'brief', 'ssml', etc.
    description: text('description'),

    // Prompt content
    systemPrompt: text('system_prompt'),
    userTemplate: text('user_template').notNull(), // Template com {{variáveis}}

    // LLM config
    model: text('model').notNull().default('claude-sonnet-4-20250514'),
    maxTokens: integer('max_tokens').notNull().default(4096),
    temperature: real('temperature').notNull().default(0.7),

    // Knowledge base tiers a incluir
    kbTiers: text('kb_tiers'), // JSON array: ["tier1", "tier2"]

    // Versioning
    version: integer('version').notNull().default(1),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),

    // Timestamps
    createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
    updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
});

// ============================================
// KNOWLEDGE BASE - Docs por tier (sempre/contexto/demanda)
// ============================================
export const knowledgeBase = sqliteTable('knowledge_base', {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    tier: text('tier').notNull(), // 'tier1' (sempre), 'tier2' (contexto), 'tier3' (demanda)
    category: text('category').notNull(), // 'dna', 'rules', 'examples', 'schemas'

    content: text('content').notNull(),

    // Filtering
    recipeSlug: text('recipe_slug'), // null = global, else recipe-specific
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),

    createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
    updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
});

// ============================================
// PRESETS - Voice (Azure TTS)
// ============================================
export const presetsVoice = sqliteTable('presets_voice', {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),

    // Azure voice config
    voiceName: text('voice_name').notNull(), // ex: 'es-MX-DaliaNeural'
    language: text('language').notNull().default('es-MX'),

    // Prosody
    rate: real('rate').notNull().default(1.0), // 0.5 to 2.0
    pitch: text('pitch').notNull().default('0%'), // '-50%' to '+50%'
    volume: text('volume').notNull().default('default'),

    // Style (Azure mstts)
    style: text('style'), // 'narration-professional', 'sad', 'angry', etc.
    styleDegree: real('style_degree').default(1.0), // 0.01 to 2.0
    role: text('role'), // 'Girl', 'Boy', 'YoungAdultFemale', etc.

    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

// ============================================
// PRESETS - Video (FFmpeg render)
// ============================================
export const presetsVideo = sqliteTable('presets_video', {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),

    // Encoder
    encoder: text('encoder').notNull().default('h264_videotoolbox'), // 'libx264', 'h264_videotoolbox'

    // Video
    scale: text('scale').notNull().default('1280:720'), // '1920:1080', '1280:720'
    fps: integer('fps').notNull().default(30),
    bitrate: text('bitrate').notNull().default('4M'), // '2M', '4M', '8M'
    pixelFormat: text('pixel_format').notNull().default('yuv420p'),

    // Audio
    audioCodec: text('audio_codec').notNull().default('aac'),
    audioBitrate: text('audio_bitrate').notNull().default('192k'),

    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

// ============================================
// PRESETS - Effects (FFmpeg filtergraph)
// ============================================
export const presetsEffects = sqliteTable('presets_effects', {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),

    // Filtergraph template com {{variáveis}}
    filtergraph: text('filtergraph').notNull(),

    // Order of application
    order: integer('order').notNull().default(0),

    // Feature flag
    enabledByDefault: integer('enabled_by_default', { mode: 'boolean' }).notNull().default(false),

    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

// ============================================
// VALIDATORS - Regras de validação como dados
// ============================================
export const validators = sqliteTable('validators', {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),

    // Tipo de validação
    type: text('type').notNull(), // 'regex', 'min_length', 'max_length', 'min_words', 'forbidden_patterns', 'required_patterns'

    // Configuração (depende do type)
    config: text('config').notNull(), // JSON com os parâmetros

    // Mensagem de erro
    errorMessage: text('error_message').notNull(),

    // Severidade
    severity: text('severity').notNull().default('error'), // 'error', 'warning'

    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

// ============================================
// PROVIDERS - Claude, Azure, etc. (sem secrets)
// ============================================
export const providers = sqliteTable('providers', {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    type: text('type').notNull(), // 'llm', 'tts', 'image'

    // Config pública (secrets vêm do .env)
    defaultModel: text('default_model'),
    baseUrl: text('base_url'),
    config: text('config'), // JSON com outras configs

    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

// ============================================
// RECIPES - Pipeline config por canal
// ============================================
export const recipes = sqliteTable('recipes', {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),

    // Pipeline: JSON array de steps
    // ex: [{"key": "title", "promptSlug": "graciela.title.v1"}, ...]
    pipeline: text('pipeline').notNull(),

    // Defaults: refs para presets
    defaultVoicePresetSlug: text('default_voice_preset_slug'),
    defaultVideoPresetSlug: text('default_video_preset_slug'),

    // Validators a aplicar por step
    validatorsConfig: text('validators_config'), // JSON: {"script": ["stage-directions-no-ssml", ...]}

    // Versioning
    version: integer('version').notNull().default(1),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),

    createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
    updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
});

// ============================================
// JOBS - Execuções de vídeo
// ============================================
export const jobs = sqliteTable('jobs', {
    id: text('id').primaryKey(),

    // Project context
    projectId: text('project_id'), // FK projects, nullable for backwards compat

    // Recipe snapshot
    recipeId: text('recipe_id').notNull(),
    recipeSlug: text('recipe_slug').notNull(),
    recipeVersion: integer('recipe_version').notNull(),

    // Input do usuário
    input: text('input').notNull(), // JSON: {title, brief, ...}

    // Manifest (snapshots de config usados)
    manifest: text('manifest'), // JSON completo

    // Status
    status: text('status').notNull().default('pending'), // 'pending', 'running', 'completed', 'failed'

    // Progress
    currentStep: text('current_step'),
    progress: integer('progress').default(0), // 0-100

    // Error tracking
    lastError: text('last_error'),

    // Timestamps
    createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
    startedAt: text('started_at'),
    completedAt: text('completed_at'),
    updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
});

// ============================================
// JOB_STEPS - Estado por etapa (checkpoints)
// ============================================
export const jobSteps = sqliteTable('job_steps', {
    id: text('id').primaryKey(),
    jobId: text('job_id').notNull(),

    // Step identification
    stepKey: text('step_key').notNull(), // 'title', 'script', 'ssml', 'tts', 'render'
    stepOrder: integer('step_order').notNull(),

    // Idempotency
    inputHash: text('input_hash').notNull(), // Hash de inputs + config

    // Status
    status: text('status').notNull().default('pending'), // 'pending', 'running', 'success', 'failed', 'skipped'

    // Output refs (paths/IDs)
    outputRefs: text('output_refs'), // JSON: {"script": "/path/to/script.md", ...}

    // Logs
    logs: text('logs'),

    // Retry
    attempts: integer('attempts').notNull().default(0),
    lastError: text('last_error'),

    // Duration
    durationMs: integer('duration_ms'),

    // Timestamps
    startedAt: text('started_at'),
    completedAt: text('completed_at'),
});

// ============================================
// ARTIFACTS - Arquivos gerados
// ============================================
export const artifacts = sqliteTable('artifacts', {
    id: text('id').primaryKey(),
    jobId: text('job_id').notNull(),
    stepKey: text('step_key').notNull(),

    // Type & path
    type: text('type').notNull(), // 'script', 'ssml', 'audio', 'video', 'manifest'
    path: text('path').notNull(),
    filename: text('filename').notNull(),

    // Integrity
    checksum: text('checksum'), // SHA-256
    sizeBytes: integer('size_bytes'),

    // Versioning (não sobrescreve)
    version: integer('version').notNull().default(1),

    // Metadata
    metadata: text('metadata'), // JSON: {format, duration, etc}

    createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

// ============================================
// SSML PRESETS - Pause mappings e config
// ============================================
export const presetsSsml = sqliteTable('presets_ssml', {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),

    // Pause mappings como JSON
    // {"[PAUSA CORTA]": "300ms", "[PAUSA]": "500ms", "[PAUSA LARGA]": "1000ms"}
    pauseMappings: text('pause_mappings').notNull(),

    // Voice marker mappings (Stage Direction voz → voicePresetSlug)
    // {"NARRADORA": "es-mx-dalia-narradora", "ANTAGONISTA": "es-mx-jorge-antagonista"}
    voiceMappings: text('voice_mappings').notNull(),

    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

// ============================================
// PRESETS (UNIFICADA) - Voice, Video, SSML, Effects
// ============================================
// Decisão: Unificar em uma tabela com type + config JSON
// Facilita CRUD/admin, mantém flexível sem hardcode
// UI mostra separado por tabs/filtros por type
export const presets = sqliteTable('presets', {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),

    // Discriminator - validado por Zod no código
    type: text('type').notNull(), // 'voice' | 'video' | 'ssml' | 'effects'

    // Config JSON (schema validado por Zod discriminatedUnion)
    config: text('config').notNull(), // JSON específico por type

    // Metadata
    tags: text('tags'), // JSON array: ["graciela", "intense", "default"]
    version: integer('version').notNull().default(1),

    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
    updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
});

// ============================================
// AUDIT EVENTS - Rastreabilidade de mudanças no Admin
// ============================================
export const auditEvents = sqliteTable('audit_events', {
    id: text('id').primaryKey(),
    createdAt: text('created_at').notNull(),

    // Actor (quem fez a mudança)
    actor: text('actor').notNull().default('admin'), // 'admin' | 'system' | 'api'

    // Action (o que foi feito)
    action: text('action').notNull(), // 'created' | 'updated' | 'deleted' | 'binding.set' | 'binding.reset'

    // Entity context
    entityType: text('entity_type').notNull(), // 'prompt' | 'provider' | 'preset' | 'validator' | 'recipe' | 'kb' | 'binding' | 'project'
    entityId: text('entity_id').notNull(),
    entityName: text('entity_name'), // nome legível para facilitar auditoria

    // Scope context (para bindings)
    scope: text('scope'), // 'global' | 'project'
    projectId: text('project_id'),

    // Before/After snapshots
    beforeJson: text('before_json'), // JSON do estado anterior (null para creates)
    afterJson: text('after_json'), // JSON do estado novo (null para deletes)

    // Metadata
    metadata: text('metadata'), // JSON com info extra (ex: step_key, slot, etc)
});

// ============================================
// SCRIPT VERSIONS - Versionamento de roteiros (Script Studio)
// ============================================
export const scriptVersions = sqliteTable('script_versions', {
    id: text('id').primaryKey(),

    // Reference to job
    jobId: text('job_id').notNull(),

    // Version number (1, 2, 3, ...)
    version: integer('version').notNull(),

    // Content
    content: text('content').notNull(),

    // Metrics
    wordCount: integer('word_count'),
    characterCount: integer('character_count'),
    estimatedDurationSec: integer('estimated_duration_sec'), // Based on WPM

    // Source
    createdBy: text('created_by').notNull().default('ai'), // 'ai' | 'human'

    // Notes
    notes: text('notes'),

    // Flags
    isCurrent: integer('is_current', { mode: 'boolean' }).notNull().default(false),
    isApproved: integer('is_approved', { mode: 'boolean' }).notNull().default(false),

    createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

// ============================================
// SCENE MARKERS - Marcadores de cena para roteiros
// ============================================
export const sceneMarkers = sqliteTable('scene_markers', {
    id: text('id').primaryKey(),

    // Reference to script version
    scriptVersionId: text('script_version_id').notNull(),

    // Scene info
    sceneNumber: integer('scene_number').notNull(),
    title: text('title'),

    // Position in content
    startLine: integer('start_line'),
    endLine: integer('end_line'),
    startChar: integer('start_char'),
    endChar: integer('end_char'),

    // Time markers (optional)
    estimatedStartSec: integer('estimated_start_sec'),
    estimatedEndSec: integer('estimated_end_sec'),

    // Notes
    notes: text('notes'),
    color: text('color'), // For UI highlight

    createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

/**
 * Manifest Schema — Video Factory OS
 * 
 * Este schema define o contrato do Render Manifest.
 * O manifest é a fonte da verdade para reprodutibilidade e auditabilidade.
 * 
 * @version 1.0.0
 * @see docs/02-features/02-manifest-contract.md
 */

import { z } from 'zod';

// =============================================================================
// Constants
// =============================================================================

export const MANIFEST_VERSION = '1.0.0' as const;

export const STEP_NAMES = [
    'script',
    'ssml',
    'tts',
    'render',
    'thumb',
    'upload',
] as const;

export const ARTIFACT_TYPES = [
    'script',
    'script_json',
    'ssml',
    'audio',
    'timestamps',
    'video',
    'thumbnail',
] as const;

export const PRESET_TYPES = ['voice', 'video', 'ssml', 'effects'] as const;

// =============================================================================
// Base Schemas
// =============================================================================

export const StepStatusSchema = z.enum([
    'pending',
    'running',
    'completed',
    'failed',
    'skipped',
]);

export const StepNameSchema = z.enum(STEP_NAMES);

export const ArtifactTypeSchema = z.enum(ARTIFACT_TYPES);

export const PresetTypeSchema = z.enum(PRESET_TYPES);

// =============================================================================
// Artifact Reference
// =============================================================================

export const ArtifactRefSchema = z.object({
    id: z.string(),
    type: ArtifactTypeSchema,
    path: z.string(), // Relativo ao job
    hash: z.string(), // SHA256
    size_bytes: z.number().int().positive(),
    created_at: z.string().datetime(),
});

// =============================================================================
// Step Snapshot
// =============================================================================

export const StepSnapshotSchema = z.object({
    step_name: StepNameSchema,
    status: StepStatusSchema,
    attempts: z.number().int().min(0),
    started_at: z.string().datetime().optional(),
    completed_at: z.string().datetime().optional(),
    duration_ms: z.number().int().min(0).optional(),
    error: z.string().optional(),
    artifacts: z.array(ArtifactRefSchema),
});

// =============================================================================
// Config Snapshots (Imutáveis após criação)
// =============================================================================

export const PromptSnapshotSchema = z.object({
    slug: z.string(),
    version: z.number().int().positive(),
    hash: z.string(), // Hash do template usado
});

export const PresetSnapshotSchema = z.object({
    id: z.string(),
    type: PresetTypeSchema,
    version: z.number().int().positive(),
    config_hash: z.string(),
});

export const RecipeSnapshotSchema = z.object({
    slug: z.string(),
    version: z.number().int().positive(),
    pipeline: z.array(StepNameSchema),
});

// =============================================================================
// Costs
// =============================================================================

export const CostBreakdownSchema = z.record(z.string(), z.number());

export const CostSnapshotSchema = z.object({
    total_usd: z.number().min(0),
    breakdown: CostBreakdownSchema,
});

// =============================================================================
// Metrics
// =============================================================================

export const MetricsSchema = z.object({
    total_duration_ms: z.number().int().min(0),
    costs: CostSnapshotSchema.optional(),
    retries_total: z.number().int().min(0),
});

// =============================================================================
// Input
// =============================================================================

export const ManifestInputSchema = z.object({
    title: z.string().min(1),
    brief: z.string().optional(),
    themes: z.array(z.string()).optional(),
});

// =============================================================================
// Snapshots Container
// =============================================================================

export const SnapshotsSchema = z.object({
    recipe: RecipeSnapshotSchema,
    prompts: z.record(z.string(), PromptSnapshotSchema),
    presets: z.record(z.string(), PresetSnapshotSchema),
    providers: z.record(z.string(), z.string()),
    validators: z.array(z.string()),
});

// =============================================================================
// Output
// =============================================================================

export const ManifestOutputSchema = z.object({
    final_video: ArtifactRefSchema.optional(),
    thumbnail: ArtifactRefSchema.optional(),
});

// =============================================================================
// Full Manifest
// =============================================================================

export const ManifestSchema = z.object({
    // Meta
    version: z.literal(MANIFEST_VERSION),
    job_id: z.string(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),

    // Input
    input: ManifestInputSchema,

    // Snapshots (imutável após criação)
    snapshots: SnapshotsSchema,

    // Execution (atualizado durante execução)
    steps: z.array(StepSnapshotSchema),

    // Results
    output: ManifestOutputSchema.optional(),

    // Metrics
    metrics: MetricsSchema.optional(),
});

// =============================================================================
// Types
// =============================================================================

export type Manifest = z.infer<typeof ManifestSchema>;
export type StepSnapshot = z.infer<typeof StepSnapshotSchema>;
export type ArtifactRef = z.infer<typeof ArtifactRefSchema>;
export type StepStatus = z.infer<typeof StepStatusSchema>;
export type StepName = z.infer<typeof StepNameSchema>;
export type PresetType = z.infer<typeof PresetTypeSchema>;
export type ManifestInput = z.infer<typeof ManifestInputSchema>;
export type Snapshots = z.infer<typeof SnapshotsSchema>;

// =============================================================================
// Factory Functions
// =============================================================================

/**
 * Cria um manifest inicial para um novo job
 */
export function createInitialManifest(params: {
    jobId: string;
    input: ManifestInput;
    snapshots: Snapshots;
}): Manifest {
    const now = new Date().toISOString();

    return {
        version: MANIFEST_VERSION,
        job_id: params.jobId,
        created_at: now,
        updated_at: now,
        input: params.input,
        snapshots: params.snapshots,
        steps: params.snapshots.recipe.pipeline.map((stepName) => ({
            step_name: stepName,
            status: 'pending',
            attempts: 0,
            artifacts: [],
        })),
    };
}

/**
 * Valida um manifest e retorna resultado tipado
 */
export function validateManifest(data: unknown): {
    success: boolean;
    data?: Manifest;
    error?: z.ZodError;
} {
    const result = ManifestSchema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, error: result.error };
}

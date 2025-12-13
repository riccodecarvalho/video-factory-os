"use server";

/**
 * Video Factory OS - Engine Runner (Phase 2)
 * 
 * Manifest-first execution com Effective Config:
 * - Cada step resolve bindings via getEffectiveConfig
 * - Manifest registra config snapshot usado
 * - Logs referenciam provider/prompt ids
 */

import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import crypto from "crypto";
import { getStepKind, getStepCapability, StepKind } from "./capabilities";
import { getEffectiveConfig } from "@/app/admin/execution-map/actions";

type JobStatus = "pending" | "running" | "completed" | "failed" | "cancelled";
type StepStatus = "pending" | "running" | "success" | "failed" | "skipped";

interface LogEntry {
    timestamp: string;
    level: "info" | "warn" | "error" | "debug";
    message: string;
    stepKey?: string;
    meta?: Record<string, unknown>;
}

interface StepDefinition {
    key: string;
    name: string;
    kind?: StepKind;
    required: boolean;
}

interface ResolvedConfig {
    prompt?: { id: string; name: string; source: string };
    provider?: { id: string; name: string; source: string };
    preset_voice?: { id: string; name: string; source: string };
    preset_ssml?: { id: string; name: string; source: string };
    validators?: { items: Array<{ id: string; name: string }>; source: string };
    kb?: { items: Array<{ id: string; name: string }>; source: string };
}

// ============================================
// MANIFEST HELPERS
// ============================================

function generateInputHash(input: Record<string, unknown>): string {
    return crypto.createHash("sha256").update(JSON.stringify(input)).digest("hex").slice(0, 16);
}

function createInitialManifest(
    job: typeof schema.jobs.$inferSelect,
    recipe: typeof schema.recipes.$inferSelect,
    projectId?: string | null
) {
    return {
        version: "2.0.0",
        job_id: job.id,
        project_id: projectId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        input: JSON.parse(job.input),
        snapshots: {
            recipe: {
                id: recipe.id,
                slug: recipe.slug,
                version: recipe.version,
            },
            config_by_step: {} as Record<string, ResolvedConfig>,
        },
        steps: [] as Array<{
            key: string;
            kind: StepKind;
            status: string;
            config: ResolvedConfig;
            started_at: string;
            completed_at?: string;
            duration_ms?: number;
            output?: unknown;
        }>,
        output: null,
        metrics: {
            total_duration_ms: 0,
            step_count: 0,
        },
    };
}

// ============================================
// STEP EXECUTORS (Phase 2 - Config-Aware)
// ============================================

async function executeStep(
    stepDef: StepDefinition,
    stepConfig: ResolvedConfig,
    input: Record<string, unknown>,
    _previousOutputs: Record<string, unknown>
): Promise<{ success: boolean; output: unknown; logs: LogEntry[] }> {
    const logs: LogEntry[] = [];
    const now = () => new Date().toISOString();
    const kind = stepDef.kind || getStepKind(stepDef.key);

    // Log config being used
    logs.push({
        timestamp: now(),
        level: "info",
        message: `Step: ${stepDef.name} (kind=${kind})`,
        stepKey: stepDef.key,
        meta: {
            prompt_id: stepConfig.prompt?.id,
            provider_id: stepConfig.provider?.id,
            preset_voice_id: stepConfig.preset_voice?.id,
        }
    });

    // Simular tempo de execução (200-800ms)
    const duration = 200 + Math.random() * 600;
    await new Promise((r) => setTimeout(r, duration));

    // Output baseado em kind + config
    let output: unknown;

    switch (kind) {
        case "llm":
            // Em produção: chamaria Claude aqui
            logs.push({
                timestamp: now(),
                level: "info",
                message: `LLM: usando prompt=${stepConfig.prompt?.name || 'default'}, provider=${stepConfig.provider?.name || 'claude'}`,
                stepKey: stepDef.key
            });

            if (stepDef.key === "title") {
                output = { titles: ["Título gerado 1", "Título gerado 2", "Título gerado 3"] };
            } else if (stepDef.key === "brief") {
                output = { brief: "Brief expandido com personagens e conflito..." };
            } else if (stepDef.key === "script") {
                output = { script: "(voz: NARRADORA)\nQuando mi madre leyó el testamento...", wordCount: 6500 };
            } else {
                output = { result: "llm_output" };
            }
            break;

        case "tts":
            // Em produção: chamaria Azure TTS aqui
            logs.push({
                timestamp: now(),
                level: "info",
                message: `TTS: usando voice=${stepConfig.preset_voice?.name || 'default'}, ssml=${stepConfig.preset_ssml?.name || 'none'}`,
                stepKey: stepDef.key
            });
            output = { audioPath: `/tmp/job-${Date.now()}/audio.mp3`, durationSec: 2400 };
            break;

        case "transform":
            logs.push({ timestamp: now(), level: "info", message: "Transform executado", stepKey: stepDef.key });
            output = { ssmlPath: `/tmp/job-${Date.now()}/audio.ssml` };
            break;

        case "render":
            logs.push({ timestamp: now(), level: "info", message: "Render executado", stepKey: stepDef.key });
            output = { videoPath: `/tmp/job-${Date.now()}/video.mp4`, sizeMb: 450 };
            break;

        case "export":
            logs.push({ timestamp: now(), level: "info", message: "Export executado", stepKey: stepDef.key });
            output = { packagePath: `/tmp/job-${Date.now()}/package.zip` };
            break;

        default:
            output = { result: "ok" };
    }

    logs.push({
        timestamp: now(),
        level: "info",
        message: `Step concluído em ${Math.round(duration)}ms`,
        stepKey: stepDef.key
    });

    return { success: true, output, logs };
}

// ============================================
// MAIN RUNNER (Phase 2)
// ============================================

export async function runJob(jobId: string): Promise<{ success: boolean; error?: string }> {
    const db = getDb();

    // 1. Load job
    const [job] = await db.select().from(schema.jobs).where(eq(schema.jobs.id, jobId));
    if (!job) return { success: false, error: "Job não encontrado" };
    if (job.status === "running") return { success: false, error: "Job já está em execução" };
    if (job.status === "completed") return { success: false, error: "Job já foi concluído" };

    // 2. Load recipe
    const [recipe] = await db.select().from(schema.recipes).where(eq(schema.recipes.id, job.recipeId));
    if (!recipe) return { success: false, error: "Recipe não encontrada" };

    const pipeline: StepDefinition[] = JSON.parse(recipe.pipeline || "[]");
    if (pipeline.length === 0) return { success: false, error: "Pipeline vazia" };

    // 3. Update job status to running
    const startedAt = new Date().toISOString();
    await db.update(schema.jobs).set({
        status: "running",
        startedAt,
        updatedAt: startedAt,
        currentStep: pipeline[0].key,
        progress: 0,
    }).where(eq(schema.jobs.id, jobId));

    // 4. Create initial manifest with project context
    const manifest = createInitialManifest(job, recipe, job.projectId);

    // 5. Resolve effective config for ALL steps upfront (snapshot)
    for (const stepDef of pipeline) {
        const config = await getEffectiveConfig(job.recipeId, stepDef.key, job.projectId || undefined);
        manifest.snapshots.config_by_step[stepDef.key] = config as ResolvedConfig;
    }

    // 6. Create job steps
    const input = JSON.parse(job.input);
    for (let i = 0; i < pipeline.length; i++) {
        const stepDef = pipeline[i];
        await db.insert(schema.jobSteps).values({
            id: uuid(),
            jobId,
            stepKey: stepDef.key,
            stepOrder: i,
            inputHash: generateInputHash({ ...input, stepKey: stepDef.key }),
            status: "pending",
            attempts: 0,
        }).onConflictDoNothing();
    }

    // 7. Execute steps sequentially
    const previousOutputs: Record<string, unknown> = {};
    let lastError: string | null = null;
    let jobFailed = false;

    for (let i = 0; i < pipeline.length; i++) {
        if (jobFailed) break;

        const stepDef = pipeline[i];
        const kind = stepDef.kind || getStepKind(stepDef.key);
        const stepConfig = manifest.snapshots.config_by_step[stepDef.key] || {};
        const progress = Math.round(((i + 1) / pipeline.length) * 100);

        // Get step record
        const steps = await db.select().from(schema.jobSteps)
            .where(eq(schema.jobSteps.jobId, jobId));
        const step = steps.find(s => s.stepKey === stepDef.key);
        if (!step) continue;

        // Check if cancelled
        const [currentJob] = await db.select().from(schema.jobs).where(eq(schema.jobs.id, jobId));
        if (currentJob?.status === "cancelled") {
            break;
        }

        // Update step to running
        const stepStartedAt = new Date().toISOString();
        await db.update(schema.jobSteps).set({
            status: "running",
            startedAt: stepStartedAt,
            attempts: (step.attempts || 0) + 1,
        }).where(eq(schema.jobSteps.id, step.id));

        // Update job current step
        await db.update(schema.jobs).set({
            currentStep: stepDef.key,
            progress,
            updatedAt: new Date().toISOString(),
        }).where(eq(schema.jobs.id, jobId));

        // Execute with effective config
        const result = await executeStep(stepDef, stepConfig, input, previousOutputs);

        // Update step
        const stepCompletedAt = new Date().toISOString();
        const durationMs = new Date(stepCompletedAt).getTime() - new Date(stepStartedAt).getTime();

        if (result.success) {
            previousOutputs[stepDef.key] = result.output;

            await db.update(schema.jobSteps).set({
                status: "success",
                completedAt: stepCompletedAt,
                durationMs,
                outputRefs: JSON.stringify(result.output),
                logs: JSON.stringify(result.logs),
            }).where(eq(schema.jobSteps.id, step.id));

            // Add to manifest with config snapshot
            manifest.steps.push({
                key: stepDef.key,
                kind,
                status: "success",
                config: stepConfig,
                started_at: stepStartedAt,
                completed_at: stepCompletedAt,
                duration_ms: durationMs,
                output: result.output,
            });
        } else {
            lastError = "Step falhou";
            jobFailed = true;
            await db.update(schema.jobSteps).set({
                status: "failed",
                completedAt: stepCompletedAt,
                durationMs,
                lastError,
                logs: JSON.stringify(result.logs),
            }).where(eq(schema.jobSteps.id, step.id));
        }
    }

    // 8. Finalize job
    const completedAt = new Date().toISOString();
    manifest.updated_at = completedAt;
    manifest.metrics.total_duration_ms = new Date(completedAt).getTime() - new Date(startedAt).getTime();
    manifest.metrics.step_count = manifest.steps.length;

    const [finalJob] = await db.select().from(schema.jobs).where(eq(schema.jobs.id, jobId));
    const finalStatus = finalJob?.status === "cancelled" ? "cancelled" : (jobFailed ? "failed" : "completed");

    await db.update(schema.jobs).set({
        status: finalStatus,
        completedAt,
        updatedAt: completedAt,
        manifest: JSON.stringify(manifest),
        progress: 100,
        lastError,
    }).where(eq(schema.jobs.id, jobId));

    return { success: !jobFailed };
}

export async function retryJobStep(jobId: string, stepKey: string): Promise<{ success: boolean; error?: string }> {
    const db = getDb();

    // Reset step to pending
    const steps = await db.select().from(schema.jobSteps).where(eq(schema.jobSteps.jobId, jobId));
    const step = steps.find(s => s.stepKey === stepKey);
    if (!step) return { success: false, error: "Step não encontrado" };

    await db.update(schema.jobSteps).set({
        status: "pending",
        lastError: null,
    }).where(eq(schema.jobSteps.id, step.id));

    // Reset job status
    await db.update(schema.jobs).set({
        status: "pending",
        lastError: null,
        updatedAt: new Date().toISOString(),
    }).where(eq(schema.jobs.id, jobId));

    return { success: true };
}

export async function cancelJob(jobId: string): Promise<{ success: boolean; error?: string }> {
    const db = getDb();

    await db.update(schema.jobs).set({
        status: "cancelled",
        updatedAt: new Date().toISOString(),
    }).where(eq(schema.jobs.id, jobId));

    return { success: true };
}

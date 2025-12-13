"use server";

/**
 * Video Factory OS - Engine Runner
 * 
 * Manifest-first execution: cada job gera manifest versionado.
 * Steps executam sequencialmente, atualizando status e logs.
 */

import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import crypto from "crypto";

type JobStatus = "pending" | "running" | "completed" | "failed" | "cancelled";
type StepStatus = "pending" | "running" | "success" | "failed" | "skipped";

interface LogEntry {
    timestamp: string;
    level: "info" | "warn" | "error" | "debug";
    message: string;
    stepKey?: string;
}

interface StepDefinition {
    key: string;
    name: string;
    promptSlug?: string;
    ssmlPresetSlug?: string;
    providerSlug?: string;
    videoPresetSlug?: string;
    required: boolean;
}

// ============================================
// MANIFEST HELPERS
// ============================================

function generateInputHash(input: Record<string, unknown>): string {
    return crypto.createHash("sha256").update(JSON.stringify(input)).digest("hex").slice(0, 16);
}

function createInitialManifest(job: typeof schema.jobs.$inferSelect, recipe: typeof schema.recipes.$inferSelect) {
    return {
        version: "1.0.0",
        job_id: job.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        input: JSON.parse(job.input),
        snapshots: {
            recipe: {
                slug: recipe.slug,
                version: recipe.version,
                pipeline: JSON.parse(recipe.pipeline || "[]"),
            },
        },
        steps: [],
        output: null,
        metrics: {
            total_duration_ms: 0,
            step_count: 0,
        },
    };
}

// ============================================
// STEP EXECUTORS (Stubbed Phase 1)
// ============================================

async function executeStep(
    stepDef: StepDefinition,
    _input: Record<string, unknown>,
    _snapshots: Record<string, unknown>
): Promise<{ success: boolean; output: unknown; logs: LogEntry[] }> {
    const logs: LogEntry[] = [];
    const now = () => new Date().toISOString();

    logs.push({ timestamp: now(), level: "info", message: `Iniciando step: ${stepDef.name}`, stepKey: stepDef.key });

    // Simular tempo de execução (200-800ms)
    const duration = 200 + Math.random() * 600;
    await new Promise((r) => setTimeout(r, duration));

    // Stubbed output por tipo de step
    let output: unknown;
    switch (stepDef.key) {
        case "title":
            output = { titles: ["Título gerado 1", "Título gerado 2", "Título gerado 3"] };
            logs.push({ timestamp: now(), level: "info", message: "3 títulos gerados", stepKey: stepDef.key });
            break;
        case "brief":
            output = { brief: "Brief expandido com personagens e conflito..." };
            logs.push({ timestamp: now(), level: "info", message: "Brief expandido", stepKey: stepDef.key });
            break;
        case "script":
            output = { script: "(voz: NARRADORA)\nQuando mi madre leyó el testamento...", wordCount: 6500 };
            logs.push({ timestamp: now(), level: "info", message: "Roteiro: 6500 palavras", stepKey: stepDef.key });
            break;
        case "parse_ssml":
            output = { ssmlPath: `/tmp/job-${Date.now()}/audio.ssml` };
            logs.push({ timestamp: now(), level: "info", message: "SSML gerado", stepKey: stepDef.key });
            break;
        case "tts":
            output = { audioPath: `/tmp/job-${Date.now()}/audio.mp3`, durationSec: 2400 };
            logs.push({ timestamp: now(), level: "info", message: "Áudio: 40min gerado", stepKey: stepDef.key });
            break;
        case "render":
            output = { videoPath: `/tmp/job-${Date.now()}/video.mp4`, sizeMb: 450 };
            logs.push({ timestamp: now(), level: "info", message: "Vídeo renderizado: 450MB", stepKey: stepDef.key });
            break;
        case "export":
            output = { packagePath: `/tmp/job-${Date.now()}/package.zip` };
            logs.push({ timestamp: now(), level: "info", message: "Pacote exportado", stepKey: stepDef.key });
            break;
        default:
            output = { result: "ok" };
    }

    logs.push({ timestamp: now(), level: "info", message: `Step concluído em ${Math.round(duration)}ms`, stepKey: stepDef.key });

    return { success: true, output, logs };
}

// ============================================
// MAIN RUNNER
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

    // 4. Create initial manifest
    const manifest = createInitialManifest(job, recipe);

    // 5. Create job steps
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

    // 6. Execute steps sequentially
    const allLogs: LogEntry[] = [];
    let lastError: string | null = null;
    let jobFailed = false;

    for (let i = 0; i < pipeline.length; i++) {
        if (jobFailed) break;

        const stepDef = pipeline[i];
        const progress = Math.round(((i + 1) / pipeline.length) * 100);

        // Get step record
        const steps = await db.select().from(schema.jobSteps)
            .where(eq(schema.jobSteps.jobId, jobId));
        const step = steps.find(s => s.stepKey === stepDef.key);
        if (!step) continue;

        // Check if cancelled
        const [currentJob] = await db.select().from(schema.jobs).where(eq(schema.jobs.id, jobId));
        if (currentJob?.status === "cancelled") {
            allLogs.push({ timestamp: new Date().toISOString(), level: "warn", message: "Job cancelado pelo usuário" });
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

        // Execute
        const result = await executeStep(stepDef, input, manifest.snapshots);
        allLogs.push(...result.logs);

        // Update step
        const stepCompletedAt = new Date().toISOString();
        const durationMs = new Date(stepCompletedAt).getTime() - new Date(stepStartedAt).getTime();

        if (result.success) {
            await db.update(schema.jobSteps).set({
                status: "success",
                completedAt: stepCompletedAt,
                durationMs,
                outputRefs: JSON.stringify(result.output),
                logs: JSON.stringify(result.logs),
            }).where(eq(schema.jobSteps.id, step.id));

            // Add to manifest
            manifest.steps.push({
                key: stepDef.key,
                status: "success",
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

    // 7. Finalize job
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

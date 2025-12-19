"use server";

/**
 * Wizard Runner - Step-by-step execution with user control
 * 
 * Difference from runner.ts:
 * - runJob() executes ALL steps automatically
 * - Wizard runs ONE step at a time, waits for user approval
 */

import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { getStepKind } from "./capabilities";
import { getEffectiveConfig } from "@/app/admin/execution-map/actions";
import { revalidatePath } from "next/cache";

type WizardStepResult = {
    success: boolean;
    stepKey: string;
    output?: unknown;
    error?: string;
    nextStep?: string | null;
    isLastCreativeStep?: boolean;
};

// ============================================
// WIZARD JOB CREATION
// ============================================

/**
 * Create a job in wizard mode
 */
export async function createWizardJob(
    recipeId: string,
    projectId: string,
    input: Record<string, unknown>
): Promise<{ jobId: string; firstStep: string }> {
    const db = getDb();

    // Load recipe
    const [recipe] = await db.select().from(schema.recipes).where(eq(schema.recipes.id, recipeId));
    if (!recipe) throw new Error("Recipe não encontrada");

    // Parse pipeline
    const pipeline = JSON.parse(recipe.pipeline || "[]");
    if (pipeline.length === 0) throw new Error("Pipeline vazia");

    // Create job
    const jobId = uuid();
    await db.insert(schema.jobs).values({
        id: jobId,
        projectId,
        recipeId: recipe.id,
        recipeSlug: recipe.slug,
        recipeVersion: recipe.version,
        input: JSON.stringify(input),
        status: "pending",
        executionMode: "wizard", // <-- KEY DIFFERENCE
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });

    // Create job steps (all pending)
    for (let i = 0; i < pipeline.length; i++) {
        const stepDef = pipeline[i];
        await db.insert(schema.jobSteps).values({
            id: uuid(),
            jobId,
            stepKey: stepDef.key,
            stepOrder: i,
            inputHash: `wizard-${jobId}-${stepDef.key}`,
            status: "pending",
            attempts: 0,
        });
    }

    revalidatePath("/wizard");
    return { jobId, firstStep: pipeline[0].key };
}

// ============================================
// WIZARD STEP EXECUTION
// ============================================

/**
 * Run a single step and return output for user review
 */
export async function runWizardStep(
    jobId: string,
    stepKey: string
): Promise<WizardStepResult> {
    const db = getDb();

    // Get job
    const [job] = await db.select().from(schema.jobs).where(eq(schema.jobs.id, jobId));
    if (!job) return { success: false, stepKey, error: "Job não encontrado" };
    if (job.executionMode !== "wizard") {
        return { success: false, stepKey, error: "Job não está em modo wizard" };
    }

    // Get recipe and pipeline
    const [recipe] = await db.select().from(schema.recipes).where(eq(schema.recipes.id, job.recipeId));
    if (!recipe) return { success: false, stepKey, error: "Recipe não encontrada" };

    const pipeline = JSON.parse(recipe.pipeline || "[]");
    const stepIndex = pipeline.findIndex((s: { key: string }) => s.key === stepKey);
    if (stepIndex === -1) {
        return { success: false, stepKey, error: "Step não encontrado no pipeline" };
    }

    const stepDef = pipeline[stepIndex];
    const kind = stepDef.kind || getStepKind(stepDef.key);

    // Get step record
    const steps = await db.select().from(schema.jobSteps)
        .where(eq(schema.jobSteps.jobId, jobId));
    const step = steps.find(s => s.stepKey === stepKey);

    // Update job status
    await db.update(schema.jobs).set({
        status: "running",
        currentStep: stepKey,
        updatedAt: new Date().toISOString(),
    }).where(eq(schema.jobs.id, jobId));

    // Update step status
    if (step) {
        await db.update(schema.jobSteps).set({
            status: "running",
            startedAt: new Date().toISOString(),
            attempts: (step.attempts || 0) + 1,
        }).where(eq(schema.jobSteps.id, step.id));
    }

    // Load config for this step
    const config = await getEffectiveConfig(job.recipeId, stepKey, job.projectId || undefined);

    // Execute based on step kind
    // For now, return placeholder - full implementation will use executeStepLLM etc.
    try {
        // TODO: Call appropriate executor based on kind
        // const result = await executeStepLLM(stepDef, config, input, previousOutputs, logs, jobId);

        // For creative steps (LLM), return output for user review
        if (kind === "llm") {
            // Placeholder - will use real executor
            return {
                success: true,
                stepKey,
                output: "Generated content will appear here",
                nextStep: stepIndex < pipeline.length - 1 ? pipeline[stepIndex + 1].key : null,
                isLastCreativeStep: false,
            };
        }

        // For technical steps (tts, render), just execute
        return {
            success: true,
            stepKey,
            nextStep: stepIndex < pipeline.length - 1 ? pipeline[stepIndex + 1].key : null,
        };

    } catch (error) {
        if (step) {
            await db.update(schema.jobSteps).set({
                status: "failed",
                lastError: String(error),
                completedAt: new Date().toISOString(),
            }).where(eq(schema.jobSteps.id, step.id));
        }

        return {
            success: false,
            stepKey,
            error: String(error),
        };
    }
}

// ============================================
// WIZARD REGENERATION
// ============================================

/**
 * Regenerate a step with user feedback
 */
export async function regenerateWithFeedback(
    jobId: string,
    stepKey: string,
    feedback: string
): Promise<WizardStepResult> {
    // TODO: Pass feedback to prompt and regenerate
    // For now, just re-run the step
    return runWizardStep(jobId, stepKey);
}

// ============================================
// WIZARD APPROVAL
// ============================================

/**
 * Approve current step and proceed to next
 */
export async function approveStepAndContinue(
    jobId: string,
    stepKey: string,
    selectedOption?: string
): Promise<{ success: boolean; nextStep: string | null }> {
    const db = getDb();

    // Update step as approved/completed
    const steps = await db.select().from(schema.jobSteps)
        .where(eq(schema.jobSteps.jobId, jobId));
    const step = steps.find(s => s.stepKey === stepKey);

    if (step) {
        await db.update(schema.jobSteps).set({
            status: "success",
            completedAt: new Date().toISOString(),
        }).where(eq(schema.jobSteps.id, step.id));
    }

    // Get next step
    const [job] = await db.select().from(schema.jobs).where(eq(schema.jobs.id, jobId));
    if (!job) return { success: false, nextStep: null };

    const [recipe] = await db.select().from(schema.recipes).where(eq(schema.recipes.id, job.recipeId));
    if (!recipe) return { success: false, nextStep: null };

    const pipeline = JSON.parse(recipe.pipeline || "[]");
    const currentIndex = pipeline.findIndex((s: { key: string }) => s.key === stepKey);

    if (currentIndex < pipeline.length - 1) {
        const nextStep = pipeline[currentIndex + 1].key;

        // Update job current step
        await db.update(schema.jobs).set({
            currentStep: nextStep,
            progress: Math.round(((currentIndex + 1) / pipeline.length) * 100),
            updatedAt: new Date().toISOString(),
        }).where(eq(schema.jobs.id, jobId));

        revalidatePath("/wizard");
        return { success: true, nextStep };
    }

    // Pipeline complete
    await db.update(schema.jobs).set({
        status: "completed",
        progress: 100,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }).where(eq(schema.jobs.id, jobId));

    revalidatePath("/wizard");
    return { success: true, nextStep: null };
}

// ============================================
// WIZARD STATE
// ============================================

/**
 * Get current wizard state for a job
 */
export async function getWizardState(jobId: string) {
    const db = getDb();

    const [job] = await db.select().from(schema.jobs).where(eq(schema.jobs.id, jobId));
    if (!job) return null;

    const steps = await db.select().from(schema.jobSteps)
        .where(eq(schema.jobSteps.jobId, jobId));

    const [recipe] = await db.select().from(schema.recipes).where(eq(schema.recipes.id, job.recipeId));

    return {
        job,
        steps: steps.sort((a, b) => a.stepOrder - b.stepOrder),
        pipeline: JSON.parse(recipe?.pipeline || "[]"),
        currentStep: job.currentStep,
        progress: job.progress,
    };
}

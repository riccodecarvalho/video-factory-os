"use server";

/**
 * Jobs Actions - Server Actions para gerenciamento de Jobs
 */

import { getDb, schema } from "@/lib/db";
import { eq, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { v4 as uuid } from "uuid";
import { runJob as engineRunJob, retryJobStep as engineRetryStep, cancelJob as engineCancelJob } from "@/lib/engine";

// ============================================
// QUERIES
// ============================================

export async function getJobs(status?: string, search?: string, projectId?: string) {
    const db = getDb();
    const results = await db.select().from(schema.jobs).orderBy(desc(schema.jobs.createdAt));

    return results.filter(j => {
        const matchesStatus = !status || status === "all" || j.status === status;
        const matchesProject = !projectId || projectId === "all" || j.projectId === projectId;
        const input = JSON.parse(j.input || "{}");
        const matchesSearch = !search ||
            j.id.toLowerCase().includes(search.toLowerCase()) ||
            input.title?.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch && matchesProject;
    });
}

export async function getJobStatusCounts() {
    const db = getDb();
    const jobs = await db.select().from(schema.jobs);

    const counts = jobs.reduce((acc, j) => {
        acc[j.status] = (acc[j.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return {
        all: jobs.length,
        pending: counts.pending || 0,
        running: counts.running || 0,
        completed: counts.completed || 0,
        failed: counts.failed || 0,
        cancelled: counts.cancelled || 0,
    };
}

export async function getJobById(jobId: string) {
    const db = getDb();
    const [job] = await db.select().from(schema.jobs).where(eq(schema.jobs.id, jobId));
    return job || null;
}

export async function getJobSteps(jobId: string) {
    const db = getDb();
    return db.select().from(schema.jobSteps)
        .where(eq(schema.jobSteps.jobId, jobId))
        .orderBy(schema.jobSteps.stepOrder);
}

export async function getJobArtifacts(jobId: string) {
    const db = getDb();
    return db.select().from(schema.artifacts).where(eq(schema.artifacts.jobId, jobId));
}

// ============================================
// MUTATIONS
// ============================================

export async function createJob(recipeId: string, projectId: string, input: Record<string, unknown>) {
    const db = getDb();

    // Load recipe
    const [recipe] = await db.select().from(schema.recipes).where(eq(schema.recipes.id, recipeId));
    if (!recipe) throw new Error("Recipe não encontrada");

    const now = new Date().toISOString();
    const newJob = {
        id: uuid(),
        projectId,
        recipeId: recipe.id,
        recipeSlug: recipe.slug,
        recipeVersion: recipe.version,
        input: JSON.stringify(input),
        status: "pending",
        progress: 0,
        createdAt: now,
        updatedAt: now,
    };

    await db.insert(schema.jobs).values(newJob);
    revalidatePath("/jobs");

    return newJob;
}

export async function startJob(jobId: string) {
    // Run in background (não bloqueia)
    engineRunJob(jobId).catch(console.error);
    revalidatePath("/jobs");
    return { success: true };
}

/**
 * Resume um job que foi cancelado ou falhou
 * Continua de onde parou (steps completos são mantidos)
 */
export async function resumeJob(jobId: string) {
    const db = getDb();

    // Reset job status para pending
    await db.update(schema.jobs).set({
        status: "pending",
        lastError: null,
        updatedAt: new Date().toISOString(),
    }).where(eq(schema.jobs.id, jobId));

    // Reset steps failed/cancelled para pending
    await db.update(schema.jobSteps).set({
        status: "pending",
        lastError: null,
        attempts: 0,
    }).where(eq(schema.jobSteps.jobId, jobId));

    // Re-run (runner vai skip steps já completos)
    engineRunJob(jobId).catch(console.error);
    revalidatePath("/jobs");

    return { success: true };
}

export async function retryStep(jobId: string, stepKey: string) {
    const result = await engineRetryStep(jobId, stepKey);
    if (result.success) {
        // Restart job
        engineRunJob(jobId).catch(console.error);
    }
    revalidatePath("/jobs");
    return result;
}

export async function cancelJob(jobId: string) {
    const db = getDb();

    // Marcar job como cancelled
    await db.update(schema.jobs).set({
        status: "cancelled",
        updatedAt: new Date().toISOString(),
    }).where(eq(schema.jobs.id, jobId));

    // Marcar steps running como cancelled
    const steps = await db.select().from(schema.jobSteps)
        .where(eq(schema.jobSteps.jobId, jobId));

    for (const step of steps) {
        if (step.status === "running" || step.status === "pending") {
            await db.update(schema.jobSteps).set({
                status: step.status === "running" ? "cancelled" : "skipped",
            }).where(eq(schema.jobSteps.id, step.id));
        }
    }

    revalidatePath("/jobs");
    return { success: true };
}

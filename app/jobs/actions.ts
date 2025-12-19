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
        // Filter out soft-deleted jobs
        if (j.deletedAt) return false;

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

    // Filter out deleted jobs for counts
    const activeJobs = jobs.filter(j => !j.deletedAt);

    const counts = activeJobs.reduce((acc, j) => {
        acc[j.status] = (acc[j.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return {
        all: activeJobs.length,
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

export async function createJob(
    recipeId: string,
    projectId: string,
    input: Record<string, unknown>,
    executionMode: "auto" | "wizard" = "auto"
) {
    const db = getDb();

    // Load recipe
    const [recipe] = await db.select().from(schema.recipes).where(eq(schema.recipes.id, recipeId));
    if (!recipe) throw new Error("Recipe não encontrada");

    // Inject timestamp for anti-repetition (used by v3 prompts)
    const timestamp = Date.now();

    // PRE-CALCULATE names based on timestamp (LLM ignores calculation instructions)
    // Names common for 55+ audience in Mexico/LATAM (born 1950-1970)
    const protagonistNames = [
        // Classic Mexican/LATAM names for women 55+
        "Adelaida", "Adela", "Adriana", "Agustina", "Aída", "Alba", "Alejandra", "Alicia", "Amalia", "Amelia",
        "Amparo", "Ana", "Andrea", "Ángela", "Angélica", "Antonia", "Araceli", "Ariadna", "Aurora", "Aurelia",
        "Bárbara", "Beatriz", "Benigna", "Berenice", "Bernardina", "Blanca", "Brígida", "Brunilda", "Candelaria", "Cándida",
        "Caridad", "Carlota", "Carmela", "Carmen", "Carolina", "Catalina", "Cecilia", "Celestina", "Clara", "Claudia",
        "Clementina", "Concepción", "Consuelo", "Cristina", "Dalia", "Daniela", "Delfina", "Diana", "Dolores", "Dominga",
        "Domitila", "Edelmira", "Elena", "Elisa", "Elvira", "Emilia", "Emma", "Enriqueta", "Ernestina", "Esperanza",
        "Estela", "Estefanía", "Eugenia", "Eulalia", "Eva", "Evangelina", "Fabiola", "Felipa", "Fernanda", "Florencia",
        "Florinda", "Francisca", "Gabriela", "Genoveva", "Georgina", "Gertrudis", "Gloria", "Griselda", "Guadalupe", "Guillermina",
        "Helena", "Herminia", "Hilda", "Hortensia", "Ignacia", "Inés", "Irene", "Iris", "Isabel", "Isidora",
        "Jacinta", "Jimena", "Josefa", "Josefina", "Juana", "Julia", "Juliana", "Laura", "Leonor", "Leticia",
        "Lidia", "Lilia", "Lorena", "Lourdes", "Lucía", "Lucinda", "Luisa", "Luz", "Magdalena", "Manuela",
        "Marcela", "Margarita", "María", "Maricela", "Marina", "Marta", "Matilde", "Mercedes", "Micaela", "Milagros",
        "Minerva", "Mónica", "Natividad", "Nélida", "Noemí", "Norma", "Ofelia", "Olga", "Otilia", "Patricia",
        "Paula", "Paulina", "Petra", "Pilar", "Rafaela", "Ramona", "Raquel", "Rebeca", "Remedios", "Rocío",
        "Rosa", "Rosalba", "Rosalía", "Rosario", "Ruth", "Salomé", "Sandra", "Sara", "Silvia", "Socorro",
        "Sofía", "Soledad", "Susana", "Teresa", "Tomasa", "Trinidad", "Valentina", "Verónica", "Victoria", "Yolanda"
    ];

    // SEPARATED by gender - LLM will choose based on story context (nuera vs yerno, etc.)
    // Antagonist names - younger generation names (children/in-laws of 55+ protagonists)
    const antagonistMaleNames = [
        // Classic Mexican male names
        "Alejandro", "Alberto", "Alfonso", "Alfredo", "Antonio", "Armando", "Arturo", "Carlos", "César", "Cristóbal",
        "Daniel", "David", "Diego", "Eduardo", "Emilio", "Enrique", "Ernesto", "Felipe", "Fernando", "Francisco",
        "Gabriel", "Gerardo", "Gilberto", "Gonzalo", "Guillermo", "Gustavo", "Héctor", "Hugo", "Ignacio", "Iván",
        "Jaime", "Javier", "Jesús", "Joaquín", "Jorge", "José", "Juan", "Julio", "Leonardo", "Lorenzo",
        "Luis", "Manuel", "Marcos", "Mario", "Martín", "Miguel", "Nicolás", "Óscar", "Pablo", "Pedro",
        "Rafael", "Ramón", "Raúl", "Ricardo", "Roberto", "Rodrigo", "Rubén", "Salvador", "Samuel", "Sergio",
        "Tomás", "Vicente", "Víctor"
    ];

    const antagonistFemaleNames = [
        // Names for antagonist women (nueras, hijas, etc.) - mix of generations
        "Adriana", "Alejandra", "Alicia", "Ana", "Andrea", "Angélica", "Beatriz", "Camila", "Carolina", "Catalina",
        "Claudia", "Cristina", "Daniela", "Diana", "Elena", "Elizabeth", "Erika", "Fernanda", "Gabriela", "Gloria",
        "Guadalupe", "Isabella", "Jessica", "Karla", "Laura", "Leticia", "Liliana", "Lorena", "Lucía", "Marcela",
        "Margarita", "María", "Mariana", "Marina", "Marta", "Mónica", "Nancy", "Natalia", "Norma", "Patricia",
        "Paula", "Paola", "Pilar", "Rebeca", "Renata", "Rosa", "Sandra", "Silvia", "Sofía", "Susana",
        "Teresa", "Valentina", "Vanessa", "Verónica", "Victoria", "Virginia", "Ximena", "Yolanda"
    ];

    const protagonistIndex = timestamp % protagonistNames.length;
    const antagonistMaleIndex = Math.floor(timestamp / 1000) % antagonistMaleNames.length;
    const antagonistFemaleIndex = Math.floor(timestamp / 100) % antagonistFemaleNames.length;

    const enrichedInput = {
        ...input,
        timestamp: timestamp.toString(),
        duracao: input.duracao || input.duration || "60",
        // PRE-CALCULATED NAMES - LLM chooses based on story context
        nombre_protagonista: protagonistNames[protagonistIndex],
        nombre_antagonista_masculino: antagonistMaleNames[antagonistMaleIndex],
        nombre_antagonista_femenino: antagonistFemaleNames[antagonistFemaleIndex],
    };

    const now = new Date().toISOString();
    const newJob = {
        id: uuid(),
        projectId,
        recipeId: recipe.id,
        recipeSlug: recipe.slug,
        recipeVersion: recipe.version,
        input: JSON.stringify(enrichedInput),
        status: "pending",
        executionMode,
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

/**
 * Refaz o job a partir de um step específico
 * Reseta todos os steps >= stepKey e re-executa
 */
export async function retryFromStep(jobId: string, stepKey: string) {
    const db = getDb();

    // Get all steps for the job
    const steps = await db.select().from(schema.jobSteps)
        .where(eq(schema.jobSteps.jobId, jobId));

    // Find the step order for the target step
    const targetStep = steps.find(s => s.stepKey === stepKey);
    if (!targetStep) {
        return { success: false, error: "Step não encontrado" };
    }

    // Reset all steps >= target step order
    for (const step of steps) {
        if (step.stepOrder >= targetStep.stepOrder) {
            await db.update(schema.jobSteps).set({
                status: "pending",
                lastError: null,
                attempts: 0,
                durationMs: null,
                startedAt: null,
                completedAt: null,
            }).where(eq(schema.jobSteps.id, step.id));
        }
    }

    // Reset job status
    await db.update(schema.jobs).set({
        status: "pending",
        lastError: null,
        updatedAt: new Date().toISOString(),
    }).where(eq(schema.jobs.id, jobId));

    // Re-run the job (runner will skip already completed steps)
    engineRunJob(jobId).catch(console.error);

    revalidatePath("/jobs");
    return { success: true };
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

export async function deleteJob(jobId: string) {
    const db = getDb();

    // Soft delete - just set deletedAt timestamp
    await db.update(schema.jobs).set({
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }).where(eq(schema.jobs.id, jobId));

    revalidatePath("/jobs");
    return { success: true };
}

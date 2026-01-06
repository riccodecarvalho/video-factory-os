'use server';

import { getDb } from '@/lib/db';
import { jobs, jobEvents, jobTemplates, recipes } from '@/lib/db/schema';
import { eq, desc, isNull } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { JobState, BoardColumn } from '@/lib/engine/job-state-machine';
import { getColumnForState, getTargetStepForColumn, canMoveToColumn } from '@/lib/engine/job-state-machine';

const db = getDb();

// ============================================================================
// Types
// ============================================================================

export interface BoardJob {
    id: string;
    title: string;
    state: JobState;
    language: string;
    voicePresetId: string | null;
    storyType: string;
    progress: number;
    etaSeconds: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface BoardData {
    columns: Record<BoardColumn, BoardJob[]>;
    autoVideoEnabled: boolean;
}

// ============================================================================
// Queries
// ============================================================================

/**
 * Obtém todos os jobs agrupados por coluna do board
 */
export async function getJobsBoard(): Promise<BoardData> {
    const allJobs = await db
        .select({
            id: jobs.id,
            title: jobs.input,
            state: jobs.state,
            language: jobs.language,
            voicePresetId: jobs.voicePresetId,
            storyType: jobs.storyType,
            progress: jobs.progress,
            etaSeconds: jobs.etaSeconds,
            createdAt: jobs.createdAt,
            updatedAt: jobs.updatedAt,
        })
        .from(jobs)
        .where(isNull(jobs.deletedAt))
        .orderBy(desc(jobs.updatedAt));

    // Agrupa por coluna
    const columns: Record<BoardColumn, BoardJob[]> = {
        A_FAZER: [],
        ROTEIRO: [],
        NARRACAO: [],
        VIDEO: [],
        CONCLUIDO: [],
    };

    for (const job of allJobs) {
        const state = (job.state || 'DRAFT') as JobState;
        const column = getColumnForState(state);

        // Parse title from input JSON
        let title = 'Sem título';
        try {
            const input = JSON.parse(job.title);
            title = input.title || input.brief?.substring(0, 50) || 'Sem título';
        } catch {
            title = job.title?.substring(0, 50) || 'Sem título';
        }

        columns[column].push({
            id: job.id,
            title,
            state,
            language: job.language || 'pt-BR',
            voicePresetId: job.voicePresetId,
            storyType: job.storyType || 'historia_geral',
            progress: job.progress || 0,
            etaSeconds: job.etaSeconds,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
        });
    }

    return {
        columns,
        autoVideoEnabled: true, // TODO: load from user preferences
    };
}

/**
 * Obtém detalhes de um job específico
 */
export async function getJobDetails(jobId: string) {
    const [job] = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, jobId));

    return job;
}

/**
 * Obtém eventos recentes de um job
 */
export async function getJobEvents(jobId: string, limit = 20) {
    const events = await db
        .select()
        .from(jobEvents)
        .where(eq(jobEvents.jobId, jobId))
        .orderBy(desc(jobEvents.createdAt))
        .limit(limit);

    return events;
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Cria um novo job a partir do board (sem modelo)
 */
export async function createJobFromBoard(input: {
    title: string;
    language: string;
    durationPreset: string;
    storyType: string;
    voicePresetId?: string;
    visualMode: string;
    imagesCount?: number;
    imagesLoop?: boolean;
    captionsEnabled?: boolean;
    zoomEnabled?: boolean;
}) {
    // Busca recipe padrão
    const [defaultRecipe] = await db
        .select()
        .from(recipes)
        .where(eq(recipes.isActive, true))
        .limit(1);

    if (!defaultRecipe) {
        throw new Error('Nenhuma recipe ativa encontrada');
    }

    const jobId = nanoid();
    const now = new Date().toISOString();

    await db.insert(jobs).values({
        id: jobId,
        recipeId: defaultRecipe.id,
        recipeSlug: defaultRecipe.slug,
        recipeVersion: defaultRecipe.version,
        input: JSON.stringify({ title: input.title }),
        state: 'READY',
        status: 'pending',
        language: input.language,
        durationPreset: input.durationPreset,
        storyType: input.storyType,
        voicePresetId: input.voicePresetId,
        visualMode: input.visualMode,
        imagesCount: input.imagesCount ?? 6,
        imagesLoop: input.imagesLoop ?? false,
        captionsEnabled: input.captionsEnabled ?? true,
        zoomEnabled: input.zoomEnabled ?? true,
        createdAt: now,
        updatedAt: now,
    });

    // Emite evento
    await emitJobEvent(jobId, 'step_started', { step: 'created' });

    return { id: jobId };
}

/**
 * Move job para uma coluna (dispara execução)
 */
export async function moveJobToColumn(jobId: string, targetColumn: BoardColumn) {
    const [job] = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, jobId));

    if (!job) {
        throw new Error('Job não encontrado');
    }

    const currentState = (job.state || 'DRAFT') as JobState;

    // Valida transição
    if (!canMoveToColumn(currentState, targetColumn)) {
        throw new Error(`Não é possível mover de ${currentState} para ${targetColumn}`);
    }

    // TODO: Integrar com executeUntil
    const targetStep = getTargetStepForColumn(targetColumn);

    // Por enquanto, apenas atualiza o estado para o início da coluna
    const newState = getStateForColumnStart(targetColumn);

    await db
        .update(jobs)
        .set({
            state: newState,
            updatedAt: new Date().toISOString(),
        })
        .where(eq(jobs.id, jobId));

    // Emite evento
    await emitJobEvent(jobId, 'auto_transition', {
        fromState: currentState,
        toState: newState,
        targetStep,
    });

    return { success: true, newState };
}

/**
 * Atualiza configurações de um job
 */
export async function updateJobConfig(jobId: string, config: Partial<{
    language: string;
    durationPreset: string;
    storyType: string;
    voicePresetId: string;
    visualMode: string;
    imagesCount: number;
    imagesLoop: boolean;
    captionsEnabled: boolean;
    zoomEnabled: boolean;
}>) {
    await db
        .update(jobs)
        .set({
            ...config,
            updatedAt: new Date().toISOString(),
        })
        .where(eq(jobs.id, jobId));

    return { success: true };
}

/**
 * Cancela um job
 */
export async function cancelJob(jobId: string) {
    const [job] = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, jobId));

    if (!job) {
        throw new Error('Job não encontrado');
    }

    await db
        .update(jobs)
        .set({
            state: 'CANCELLED',
            updatedAt: new Date().toISOString(),
        })
        .where(eq(jobs.id, jobId));

    await emitJobEvent(jobId, 'step_failed', {
        reason: 'cancelled_by_user',
    });

    return { success: true };
}

/**
 * Retoma um job cancelado
 */
export async function resumeJob(jobId: string) {
    const [job] = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, jobId));

    if (!job || job.state !== 'CANCELLED') {
        throw new Error('Job não encontrado ou não está cancelado');
    }

    // Volta para READY
    await db
        .update(jobs)
        .set({
            state: 'READY',
            updatedAt: new Date().toISOString(),
        })
        .where(eq(jobs.id, jobId));

    return { success: true };
}

// ============================================================================
// Templates
// ============================================================================

export async function saveAsTemplate(jobId: string, name: string) {
    const [job] = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, jobId));

    if (!job) {
        throw new Error('Job não encontrado');
    }

    const templateId = nanoid();
    const configJson = JSON.stringify({
        language: job.language,
        durationPreset: job.durationPreset,
        storyType: job.storyType,
        voicePresetId: job.voicePresetId,
        visualMode: job.visualMode,
        imagesCount: job.imagesCount,
        imagesLoop: job.imagesLoop,
        captionsEnabled: job.captionsEnabled,
        zoomEnabled: job.zoomEnabled,
    });

    await db.insert(jobTemplates).values({
        id: templateId,
        name,
        recipeId: job.recipeId,
        configJson,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });

    return { id: templateId };
}

export async function getTemplates() {
    return db
        .select()
        .from(jobTemplates)
        .orderBy(desc(jobTemplates.createdAt));
}

// ============================================================================
// Helpers
// ============================================================================

function getStateForColumnStart(column: BoardColumn): JobState {
    const mapping: Record<BoardColumn, JobState> = {
        A_FAZER: 'READY',
        ROTEIRO: 'SCRIPTING',
        NARRACAO: 'TTS_RUNNING',
        VIDEO: 'RENDER_RUNNING',
        CONCLUIDO: 'DONE',
    };
    return mapping[column];
}

async function emitJobEvent(
    jobId: string,
    eventType: string,
    payload: Record<string, unknown>
) {
    await db.insert(jobEvents).values({
        id: nanoid(),
        jobId,
        eventType,
        payload: JSON.stringify(payload),
        createdAt: new Date().toISOString(),
    });
}

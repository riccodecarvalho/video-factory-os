'use server';

import { getDb } from '@/lib/db';
import { jobs, jobEvents, jobTemplates, recipes, artifacts, jobSteps } from '@/lib/db/schema';
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

/**
 * Obtém artifacts de um job filtrados por tipo
 */
export async function getJobArtifacts(jobId: string, type?: string) {
    const query = db
        .select()
        .from(artifacts)
        .where(eq(artifacts.jobId, jobId))
        .orderBy(desc(artifacts.createdAt));

    const allArtifacts = await query;

    if (type) {
        return allArtifacts.filter(a => a.type === type);
    }

    return allArtifacts;
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
 * Move job para uma coluna (dispara execução via executeUntil)
 * 
 * IMPORTANTE: Esta função é um adaptador para executeUntil.
 * NÃO faz update direto de jobs.state.
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

    // Resolve o step target para a coluna
    const targetStep = getTargetStepForColumn(targetColumn);

    // Chama executeUntil (que vai atualizar jobs.state conforme executa)
    const result = await executeUntil(jobId, targetStep);

    return {
        success: result.status === 'completed' || result.status === 'running',
        newState: result.newState,
        status: result.status,
    };
}

// ============================================================================
// Step Locking (anti-concurrency)
// ============================================================================

const LOCK_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Adquire lock em um step específico.
 * Se locked_at expirou (>5min), permite "steal lock".
 * 
 * @returns true se lock adquirido com sucesso
 */
async function acquireStepLock(
    jobId: string,
    stepKey: string,
    lockerId: string
): Promise<boolean> {
    const now = new Date();
    const nowIso = now.toISOString();
    const expirationThreshold = new Date(now.getTime() - LOCK_EXPIRATION_MS).toISOString();

    // Busca step atual
    const steps = await db
        .select()
        .from(jobSteps)
        .where(eq(jobSteps.jobId, jobId));

    const step = steps.find(s => s.stepKey === stepKey);
    if (!step) {
        // Step não existe ainda - será criado pelo runner, retorna true
        return true;
    }

    // Se não está locked, adquire
    if (!step.lockedAt) {
        await db
            .update(jobSteps)
            .set({ lockedAt: nowIso, lockedBy: lockerId })
            .where(eq(jobSteps.id, step.id));
        return true;
    }

    // Se expirou (>5min), permite steal lock
    if (step.lockedAt < expirationThreshold) {
        await db
            .update(jobSteps)
            .set({ lockedAt: nowIso, lockedBy: lockerId })
            .where(eq(jobSteps.id, step.id));

        await emitJobEvent(jobId, 'lock_stolen', {
            stepKey,
            previousLocker: step.lockedBy,
            newLocker: lockerId,
            expiredAt: step.lockedAt,
        });
        return true;
    }

    // Já está locked por outro (e não expirou)
    return false;
}

/**
 * Libera lock de um step
 */
async function releaseStepLock(jobId: string, stepKey: string): Promise<void> {
    const steps = await db
        .select()
        .from(jobSteps)
        .where(eq(jobSteps.jobId, jobId));

    const step = steps.find(s => s.stepKey === stepKey);
    if (step) {
        await db
            .update(jobSteps)
            .set({ lockedAt: null, lockedBy: null })
            .where(eq(jobSteps.id, step.id));
    }
}

// ============================================================================
// Execute Until (Core Execution)
// ============================================================================

/**
 * executeUntil - Executa pipeline até o step especificado
 * 
 * Este é o coração do board. Quando o usuário arrasta um card:
 * 1. Valida estado do job
 * 2. Adquire lock no step (via job_steps.locked_at/locked_by)
 * 3. Verifica idempotência (steps já completos são skipados)
 * 4. Atualiza jobs.state para o estado da coluna
 * 5. Executa via runJob (SÍNCRONO - modo local-only)
 * 
 * ⚠️ MODO LOCAL-ONLY: A execução é síncrona nesta implementação.
 * Para produção/serverless, deve ser substituída por fila/worker.
 * 
 * @see implementation_plan.md §35
 */
async function executeUntil(
    jobId: string,
    targetStepKey: string
): Promise<{ status: string; newState: JobState; lastStep?: string }> {
    const lockerId = `board_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const [job] = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, jobId));

    if (!job) {
        throw new Error('Job não encontrado');
    }

    const currentState = (job.state || 'DRAFT') as JobState;
    const currentStatus = job.status;

    // ================================================================
    // 1. VALIDAÇÃO DE ESTADO
    // ================================================================

    if (currentStatus === 'running') {
        throw new Error('Job já em execução');
    }
    if (currentState === 'CANCELLED') {
        throw new Error('Job cancelado. Use resumeJob() primeiro');
    }
    if (currentState === 'DONE') {
        throw new Error('Job já concluído');
    }

    // ================================================================
    // 2. ADQUIRIR LOCK NO STEP
    // ================================================================

    const lockAcquired = await acquireStepLock(jobId, targetStepKey, lockerId);
    if (!lockAcquired) {
        throw new Error(`Step "${targetStepKey}" está locked por outro processo`);
    }

    try {
        // ================================================================
        // 3. VERIFICAR IDEMPOTÊNCIA (step já completo?)
        // ================================================================

        const existingSteps = await db
            .select()
            .from(jobSteps)
            .where(eq(jobSteps.jobId, jobId));

        const targetStep = existingSteps.find(s => s.stepKey === targetStepKey);

        if (targetStep?.status === 'success') {
            const stepArtifacts = await db
                .select()
                .from(artifacts)
                .where(eq(artifacts.jobId, jobId));

            if (stepArtifacts.length > 0) {
                await emitJobEvent(jobId, 'step_skipped', {
                    step: targetStepKey,
                    reason: 'already_completed',
                });

                const newState = getStateAfterStep(targetStepKey, job.autoVideoEnabled ?? true);
                await releaseStepLock(jobId, targetStepKey);
                return { status: 'completed', newState, lastStep: targetStepKey };
            }
        }

        // ================================================================
        // 4. ATUALIZAR ESTADO DO JOB
        // ================================================================

        const now = new Date().toISOString();
        const newState = getStateForColumnStart(getColumnForTargetStep(targetStepKey));

        await db
            .update(jobs)
            .set({
                state: newState,
                status: 'running' as const,
                currentStep: targetStepKey,
                updatedAt: now,
                startedAt: job.startedAt || now,
            })
            .where(eq(jobs.id, jobId));

        // ================================================================
        // 5. EMITIR EVENTOS
        // ================================================================

        await emitJobEvent(jobId, 'auto_transition', {
            fromState: currentState,
            toState: newState,
            targetStep: targetStepKey,
            reason: 'executeUntil',
            lockerId,
        });

        await emitJobEvent(jobId, 'step_started', { step: targetStepKey });

        // ================================================================
        // 6. EXECUTAR RUNSJOB (SÍNCRONO - LOCAL ONLY)
        // ⚠️ Para produção, substituir por enqueue para worker
        // ================================================================

        const { runJob } = await import('@/lib/engine/runner');

        const result = await runJob(jobId);

        if (!result.success) {
            await emitJobEvent(jobId, 'step_failed', {
                step: targetStepKey,
                error: result.error,
            });

            await releaseStepLock(jobId, targetStepKey);

            // Atualiza estado para FAILED
            const [updatedJob] = await db.select().from(jobs).where(eq(jobs.id, jobId));
            return {
                status: 'failed',
                newState: (updatedJob?.state || 'FAILED') as JobState,
                lastStep: targetStepKey
            };
        }

        await emitJobEvent(jobId, 'job_completed', { lastStep: targetStepKey });

        // ================================================================
        // 7. LIBERAR LOCK E RETORNAR
        // ================================================================

        await releaseStepLock(jobId, targetStepKey);

        const [finalJob] = await db.select().from(jobs).where(eq(jobs.id, jobId));
        return {
            status: 'completed',
            newState: (finalJob?.state || 'DONE') as JobState,
            lastStep: targetStepKey
        };

    } catch (error) {
        // Sempre libera lock em caso de erro
        await releaseStepLock(jobId, targetStepKey);

        await emitJobEvent(jobId, 'step_failed', {
            step: targetStepKey,
            error: error instanceof Error ? error.message : 'Unknown error',
        });

        throw error;
    }
}

/**
 * Deriva o estado após um step completar
 */
function getStateAfterStep(stepKey: string, autoVideoEnabled: boolean): JobState {
    const mapping: Record<string, JobState> = {
        'roteiro': 'SCRIPT_DONE',
        'tts': 'TTS_DONE',
        'export': 'DONE',
    };

    const nextState = mapping[stepKey];
    if (!nextState) return 'READY';

    if (autoVideoEnabled) {
        if (nextState === 'SCRIPT_DONE') return 'TTS_RUNNING';
        if (nextState === 'TTS_DONE') return 'RENDER_RUNNING';
    }

    return nextState;
}

/**
 * Deriva a coluna a partir do step target
 */
function getColumnForTargetStep(stepKey: string): BoardColumn {
    const mapping: Record<string, BoardColumn> = {
        'roteiro': 'ROTEIRO',
        'tts': 'NARRACAO',
        'export': 'VIDEO',
    };
    return mapping[stepKey] || 'A_FAZER';
}

/**
 * Deriva estado inicial para uma coluna
 */
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
            status: 'cancelled' as const,
            updatedAt: new Date().toISOString(),
        })
        .where(eq(jobs.id, jobId));

    await emitJobEvent(jobId, 'step_failed', {
        reason: 'cancelled_by_user',
        previousState: job.state,
    });

    return { success: true };
}

/**
 * Retoma um job cancelado ou falho
 */
export async function resumeJob(jobId: string) {
    const [job] = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, jobId));

    if (!job) {
        throw new Error('Job não encontrado');
    }

    const currentState = (job.state || 'DRAFT') as JobState;

    if (currentState !== 'CANCELLED' && currentState !== 'FAILED') {
        throw new Error('Job não está cancelado ou falho');
    }

    // Incrementa retryCount e volta para READY
    await db
        .update(jobs)
        .set({
            state: 'READY',
            status: 'pending' as const,
            retryCount: (job.retryCount ?? 0) + 1,
            lastError: null,
            updatedAt: new Date().toISOString(),
        })
        .where(eq(jobs.id, jobId));

    await emitJobEvent(jobId, 'auto_transition', {
        fromState: currentState,
        toState: 'READY',
        reason: 'resume',
        retryCount: (job.retryCount ?? 0) + 1,
    });

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

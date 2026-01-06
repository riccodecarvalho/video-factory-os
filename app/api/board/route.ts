import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { jobs } from '@/lib/db/schema';
import { eq, isNull, desc } from 'drizzle-orm';
import {
    type BoardColumn,
    type JobState,
    getColumnForState,
    BADGE_STATES,
} from '@/lib/engine/job-state-machine';

/**
 * GET /api/board
 * 
 * Endpoint dedicado para polling do Kanban Board.
 * Substitui server actions para evitar POST /board spam nos logs.
 */
export async function GET() {
    try {
        const db = getDb();

        const allJobs = await db
            .select()
            .from(jobs)
            .where(isNull(jobs.deletedAt))
            .orderBy(desc(jobs.updatedAt));

        // Group by column
        const columns: Record<BoardColumn, typeof allJobs> = {
            A_FAZER: [],
            ROTEIRO: [],
            NARRACAO: [],
            VIDEO: [],
            CONCLUIDO: [],
        };

        // Auto video global (from most recent job or default)
        let autoVideoEnabled = true;

        for (const job of allJobs) {
            const state = (job.state || 'DRAFT') as JobState;

            // Update auto video from first job
            if (autoVideoEnabled === true && job.autoVideoEnabled !== null) {
                autoVideoEnabled = job.autoVideoEnabled;
            }

            // Skip badge states (FAILED, CANCELLED) - they stay in their last column
            if (BADGE_STATES.includes(state)) {
                // Find last non-badge column based on failedStep or default to A_FAZER
                const column = job.failedStep
                    ? getColumnForState(state)
                    : 'A_FAZER';
                columns[column].push(job);
                continue;
            }

            const column = getColumnForState(state);
            columns[column].push(job);
        }

        // Transform to BoardJob format
        const transformedColumns: Record<BoardColumn, {
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
        }[]> = {
            A_FAZER: [],
            ROTEIRO: [],
            NARRACAO: [],
            VIDEO: [],
            CONCLUIDO: [],
        };

        for (const [column, jobList] of Object.entries(columns)) {
            transformedColumns[column as BoardColumn] = jobList.map(job => {
                // Parse input for title
                let title = 'Sem título';
                try {
                    const input = JSON.parse(job.input);
                    title = input.title || input.tema || 'Sem título';
                } catch {
                    // ignore
                }

                return {
                    id: job.id,
                    title,
                    state: (job.state || 'DRAFT') as JobState,
                    language: job.language || 'pt-BR',
                    voicePresetId: job.voicePresetId,
                    storyType: job.storyType || 'historia_geral',
                    progress: job.progress || 0,
                    etaSeconds: job.etaSeconds,
                    createdAt: job.createdAt,
                    updatedAt: job.updatedAt,
                };
            });
        }

        return NextResponse.json({
            columns: transformedColumns,
            autoVideoEnabled,
        });
    } catch (error) {
        console.error('Error in GET /api/board:', error);
        return NextResponse.json(
            { error: 'Failed to load board' },
            { status: 500 }
        );
    }
}

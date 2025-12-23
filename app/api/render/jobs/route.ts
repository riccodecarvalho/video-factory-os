/**
 * Render Jobs API - List Jobs
 * 
 * GET /api/render/jobs - Lista todos os jobs de render
 * POST /api/render/jobs - Submete novo job de render
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRenderWorker } from '@/lib/engine/render-worker';
import { compileTimeline } from '@/lib/timeline';
import { buildTimelineFromRecipe } from '@/lib/engine/recipe-to-timeline';

// GET - Lista jobs na queue
export async function GET() {
    try {
        const worker = getRenderWorker();
        const status = worker.getStatus();

        return NextResponse.json({
            success: true,
            data: {
                worker: status,
                // Para listar jobs específicos, precisaríamos de uma store externa
                // Por agora, retornamos apenas status do worker
            }
        });
    } catch (error) {
        const err = error as Error;
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}

// POST - Submete novo job de render
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Gerar jobId automaticamente se não fornecido
        const jobId = body.jobId || `job-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

        const {
            recipeSlug = 'graciela',
            format = 'longform',
            audioPath,
            audioDurationSec = 60,
            backgroundPath,
            priority = 0,
            timeline: providedTimeline,
            useTimelineDSL = false,
        } = body;

        // Use provided timeline or build from recipe
        let timeline;

        if (providedTimeline && useTimelineDSL) {
            // Use directly provided timeline (for testing)
            timeline = providedTimeline;
        } else {
            // Build Timeline from recipe context
            timeline = buildTimelineFromRecipe({
                jobId,
                recipe: {
                    recipeSlug,
                    format,
                    backgroundPath,
                },
                previousOutputs: {
                    tts: {
                        audioPath,
                        durationSec: audioDurationSec,
                    },
                },
                input: body,
            });
        }

        // Compile Timeline to RenderPlan
        const outputDir = `${process.cwd()}/jobs/${jobId}/render`;
        const compileResult = compileTimeline(timeline, {
            jobId,
            outputDir,
        });

        if (!compileResult.success || !compileResult.plan) {
            return NextResponse.json(
                { success: false, error: compileResult.errors.join('; ') },
                { status: 400 }
            );
        }

        // Submit to worker
        const worker = getRenderWorker();
        const renderJob = worker.submit(compileResult.plan, priority);

        return NextResponse.json({
            success: true,
            data: {
                jobId: renderJob.id,
                status: renderJob.status,
                priority: renderJob.priority,
                createdAt: renderJob.createdAt,
            }
        });

    } catch (error) {
        const err = error as Error;
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}

/**
 * Render Job Retry API
 * 
 * POST /api/render/jobs/[id]/retry - Resubmete job que falhou
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRenderWorker } from '@/lib/engine/render-worker';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST - Retry de um job
export async function POST(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params;
        const worker = getRenderWorker();
        const job = worker.getJob(id);

        if (!job) {
            return NextResponse.json(
                { success: false, error: 'Job não encontrado' },
                { status: 404 }
            );
        }

        // Only retry failed or cancelled jobs
        if (job.status !== 'failed' && job.status !== 'cancelled') {
            return NextResponse.json(
                { success: false, error: `Não é possível retry job com status ${job.status}` },
                { status: 400 }
            );
        }

        // Re-submit the job's plan
        const body = await request.json().catch(() => ({}));
        const priority = body.priority ?? job.priority;

        const newJob = worker.submit(job.plan, priority);

        return NextResponse.json({
            success: true,
            data: {
                originalJobId: id,
                newJobId: newJob.id,
                status: newJob.status,
                priority: newJob.priority,
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

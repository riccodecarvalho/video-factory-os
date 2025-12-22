/**
 * Render Job API - Single Job Operations
 * 
 * GET /api/render/jobs/[id] - Status do job
 * DELETE /api/render/jobs/[id] - Cancelar job
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRenderWorker } from '@/lib/engine/render-worker';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET - Status de um job específico
export async function GET(
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

        return NextResponse.json({
            success: true,
            data: {
                id: job.id,
                status: job.status,
                priority: job.priority,
                attempt: job.attempt,
                maxAttempts: job.maxAttempts,
                createdAt: job.createdAt,
                error: job.error,
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

// DELETE - Cancelar job
export async function DELETE(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params;
        const worker = getRenderWorker();
        const cancelled = worker.cancel(id);

        if (!cancelled) {
            return NextResponse.json(
                { success: false, error: 'Job não encontrado ou já processado' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: { id, cancelled: true }
        });

    } catch (error) {
        const err = error as Error;
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}

/**
 * Render Worker Status API
 * 
 * GET /api/render/worker/status - Status do worker de render
 */

import { NextResponse } from 'next/server';
import { getRenderWorker } from '@/lib/engine/render-worker';
import { isVideoToolboxAvailable } from '@/lib/engine/preset-registry';
import os from 'os';

// GET - Status completo do worker
export async function GET() {
    try {
        const worker = getRenderWorker();
        const status = worker.getStatus();

        // Check system capabilities
        const hasVideoToolbox = await isVideoToolboxAvailable();

        // System info
        const systemInfo = {
            platform: os.platform(),
            arch: os.arch(),
            cpus: os.cpus().length,
            totalMemory: Math.round(os.totalmem() / 1024 / 1024 / 1024), // GB
            freeMemory: Math.round(os.freemem() / 1024 / 1024 / 1024), // GB
            hostname: os.hostname(),
        };

        return NextResponse.json({
            success: true,
            data: {
                worker: {
                    ...status,
                    hasVideoToolbox,
                },
                system: systemInfo,
                timestamp: new Date().toISOString(),
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

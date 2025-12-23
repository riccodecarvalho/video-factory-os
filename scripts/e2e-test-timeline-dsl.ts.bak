#!/usr/bin/env npx ts-node

/**
 * E2E Test: Timeline DSL Integration
 * 
 * Este script testa o fluxo completo:
 * 1. Verifica servidor rodando
 * 2. Submete job com useTimelineDSL: true
 * 3. Monitora status até completar
 * 4. Valida resultado
 */

const BASE_URL = 'http://localhost:3000';

interface TestResult {
    name: string;
    passed: boolean;
    duration: number;
    details?: string;
    error?: string;
}

const results: TestResult[] = [];

async function log(message: string): Promise<void> {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    console.log(`[${timestamp}] ${message}`);
}

async function runTest(
    name: string,
    fn: () => Promise<{ passed: boolean; details?: string }>
): Promise<boolean> {
    const start = Date.now();
    try {
        log(`🧪 Running: ${name}`);
        const result = await fn();
        const duration = Date.now() - start;
        results.push({ name, ...result, duration });

        if (result.passed) {
            log(`   ✅ PASSED (${duration}ms)${result.details ? `: ${result.details}` : ''}`);
        } else {
            log(`   ❌ FAILED (${duration}ms)${result.details ? `: ${result.details}` : ''}`);
        }
        return result.passed;
    } catch (error) {
        const duration = Date.now() - start;
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.push({ name, passed: false, duration, error: errorMessage });
        log(`   ❌ ERROR (${duration}ms): ${errorMessage}`);
        return false;
    }
}

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================
// TESTS
// ============================================================

async function testServerHealth(): Promise<{ passed: boolean; details?: string }> {
    try {
        const response = await fetch(`${BASE_URL}/api/render/worker/status`);
        const data = await response.json();

        if (response.ok && data.success && data.data?.worker) {
            const worker = data.data.worker;
            return {
                passed: true,
                details: `Worker status: ${worker.status}, VideoToolbox: ${worker.hasVideoToolbox ? 'YES' : 'NO'}`
            };
        }
        return { passed: false, details: `Response: ${JSON.stringify(data).slice(0, 100)}` };
    } catch (error) {
        return { passed: false, details: `Server not responding: ${error}` };
    }
}

async function testListJobsEmpty(): Promise<{ passed: boolean; details?: string }> {
    const response = await fetch(`${BASE_URL}/api/render/jobs`);
    const data = await response.json();

    // API returns { success: true, data: { worker: {...} } }
    const workerData = data.data?.worker;
    return {
        passed: response.ok && data.success,
        details: workerData
            ? `Queue: ${workerData.activeJobs || 0} active, ${workerData.queuedJobs || 0} queued`
            : `Response: ${JSON.stringify(data).slice(0, 80)}`
    };
}

async function testSubmitJobWithTimelineDSL(): Promise<{ passed: boolean; details?: string }> {
    // Criar um job com timeline no formato correto do schema
    const testTimeline = {
        version: '1.0.0',
        settings: {
            width: 1920,
            height: 1080,
            fps: 30,
            backgroundColor: '#1a1a2e'
        },
        scenes: [
            {
                id: 'scene-1',
                start: 0,
                duration: 5,
                elements: [
                    {
                        id: 'text-1',
                        type: 'text',
                        layer: 1,
                        start: 0,
                        duration: 5,
                        props: {
                            content: 'Timeline DSL E2E Test',
                            fontSize: 72,
                            font: 'Arial',
                            color: '#ffffff',
                            position: { x: 960, y: 540 }
                        }
                    }
                ]
            }
        ]
    };

    const response = await fetch(`${BASE_URL}/api/render/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            timeline: testTimeline,
            useTimelineDSL: true,
            priority: 10
        })
    });

    const data = await response.json();

    // API returns { success: true, data: { jobId, status, ... } }
    if (response.ok && data.success && data.data?.jobId) {
        // Store jobId for subsequent tests
        (global as any).__testJobId = data.data.jobId;
        return {
            passed: true,
            details: `Job submitted: ${data.data.jobId}`
        };
    }

    return {
        passed: false,
        details: `Failed to submit: ${JSON.stringify(data)}`
    };
}

async function testGetJobStatus(): Promise<{ passed: boolean; details?: string }> {
    const jobId = (global as any).__testJobId;
    if (!jobId) {
        return { passed: false, details: 'No job ID from previous test' };
    }

    const response = await fetch(`${BASE_URL}/api/render/jobs/${jobId}`);
    const data = await response.json();

    // API returns { success: true, data: { id, status, ... } }
    if (response.ok && data.success && data.data) {
        const job = data.data;
        return {
            passed: true,
            details: `Job ${jobId}: status=${job.status}, attempt=${job.attempt}/${job.maxAttempts}`
        };
    }

    return {
        passed: false,
        details: `Failed to get job: ${JSON.stringify(data).slice(0, 100)}`
    };
}

async function testWaitForJobCompletion(): Promise<{ passed: boolean; details?: string }> {
    const jobId = (global as any).__testJobId;
    if (!jobId) {
        return { passed: false, details: 'No job ID from previous test' };
    }

    const maxWaitTime = 60000; // 60 seconds max
    const pollInterval = 2000; // Poll every 2 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
        const response = await fetch(`${BASE_URL}/api/render/jobs/${jobId}`);
        const data = await response.json();

        // API returns { success: true, data: { id, status, ... } }
        if (data.success && data.data) {
            const job = data.data;
            const status = job.status;
            log(`   📊 Job status: ${status}, attempt: ${job.attempt}/${job.maxAttempts}`);

            if (status === 'completed') {
                return {
                    passed: true,
                    details: `Job completed in ${Math.round((Date.now() - startTime) / 1000)}s`
                };
            }

            if (status === 'failed') {
                return {
                    passed: false,
                    details: `Job failed: ${job.error || 'Unknown error'}`
                };
            }

            if (status === 'cancelled') {
                return {
                    passed: false,
                    details: 'Job was cancelled'
                };
            }
        }

        await sleep(pollInterval);
    }

    return {
        passed: false,
        details: `Timeout after ${maxWaitTime / 1000}s`
    };
}

async function testWorkerCapabilities(): Promise<{ passed: boolean; details?: string }> {
    const response = await fetch(`${BASE_URL}/api/render/worker/status`);
    const data = await response.json();

    // API returns { success: true, data: { worker: {...}, system: {...} } }
    if (response.ok && data.success && data.data) {
        const { worker, system } = data.data;
        const features: string[] = [];

        if (worker?.hasVideoToolbox) features.push('VideoToolbox');
        if (system?.cpus) features.push(`${system.cpus} CPUs`);
        if (system?.totalMemory) features.push(`${system.totalMemory}GB RAM`);

        return {
            passed: true,
            details: `${features.join(', ')} | Platform: ${system?.platform || 'unknown'}`
        };
    }

    return {
        passed: false,
        details: 'Could not get worker capabilities'
    };
}

async function testQueueStats(): Promise<{ passed: boolean; details?: string }> {
    const response = await fetch(`${BASE_URL}/api/render/worker/status`);
    const data = await response.json();

    // API returns { success: true, data: { worker: {...} } }
    if (response.ok && data.success && data.data?.worker) {
        const worker = data.data.worker;
        return {
            passed: true,
            details: `Queue: ${worker.queuedJobs || 0} queued, ${worker.activeJobs || 0} active, ${worker.completedJobs || 0} completed`
        };
    }

    return {
        passed: true, // Queue stats optional
        details: 'Queue stats not available (optional)'
    };
}

// ============================================================
// MAIN
// ============================================================

async function main(): Promise<void> {
    console.log('\n' + '='.repeat(60));
    console.log('🎬 E2E TEST: Timeline DSL Integration');
    console.log('='.repeat(60) + '\n');

    log('Starting E2E tests against ' + BASE_URL);
    console.log('');

    // Run tests in sequence
    await runTest('1. Server Health Check', testServerHealth);
    await runTest('2. Worker Capabilities', testWorkerCapabilities);
    await runTest('3. List Jobs (initial)', testListJobsEmpty);
    await runTest('4. Submit Job with Timeline DSL', testSubmitJobWithTimelineDSL);
    await runTest('5. Get Job Status', testGetJobStatus);
    await runTest('6. Queue Statistics', testQueueStats);

    // Optional: wait for completion (only if job was submitted)
    if ((global as any).__testJobId) {
        log('\n📦 Waiting for job completion (max 60s)...\n');
        await runTest('7. Wait for Job Completion', testWaitForJobCompletion);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const totalTime = results.reduce((acc, r) => acc + r.duration, 0);

    console.log(`\n   Total:  ${results.length}`);
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   ⏱️  Time:   ${totalTime}ms`);

    if (failed > 0) {
        console.log('\n   Failed tests:');
        results.filter(r => !r.passed).forEach(r => {
            console.log(`   - ${r.name}: ${r.error || r.details}`);
        });
    }

    console.log('\n' + '='.repeat(60));

    // Exit with appropriate code
    process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);

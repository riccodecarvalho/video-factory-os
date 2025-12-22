#!/usr/bin/env npx tsx
/**
 * Test Script: Full Pipeline
 * 
 * Testa o pipeline completo de render (Timeline DSL → RenderPlan → Output).
 * Este é um teste de integração que valida toda a arquitetura.
 * 
 * Uso: npx tsx scripts/test-full-pipeline.ts
 */

import { buildTimelineFromRecipe } from '../lib/engine/recipe-to-timeline';
import { compileTimeline, validateTimeline, createEmptyTimeline, FORMAT_PRESETS } from '../lib/timeline';
import { getPresetForFormat, getBestPreset, isVideoToolboxAvailable, listPresets } from '../lib/engine/preset-registry';
import { getRenderWorker } from '../lib/engine/render-worker';
import { getRenderLogger, createJobLogger } from '../lib/engine/render-logger';
import { getArtifactCache } from '../lib/engine/artifact-cache';
import { getStorage } from '../lib/engine/artifact-storage';
import path from 'path';

interface TestResult {
    name: string;
    passed: boolean;
    details?: string;
    duration?: number;
}

async function runTest(name: string, fn: () => Promise<string | void>): Promise<TestResult> {
    const start = Date.now();
    try {
        const details = await fn();
        return {
            name,
            passed: true,
            details: details || undefined,
            duration: Date.now() - start,
        };
    } catch (err) {
        return {
            name,
            passed: false,
            details: (err as Error).message,
            duration: Date.now() - start,
        };
    }
}

async function main() {
    console.log('='.repeat(70));
    console.log('TEST: Full Render Pipeline Integration');
    console.log('='.repeat(70));
    console.log('');

    const results: TestResult[] = [];
    const jobId = `test-pipeline-${Date.now()}`;

    // ==========================================
    // SECTION 1: Core Timeline DSL
    // ==========================================
    console.log('▶ SECTION 1: Timeline DSL');
    console.log('-'.repeat(40));

    results.push(await runTest('Create empty timeline (longform)', async () => {
        const timeline = createEmptyTimeline('longform');
        if (timeline.settings.width !== 1920) throw new Error('Wrong width');
        return `${timeline.settings.width}x${timeline.settings.height}`;
    }));

    results.push(await runTest('Create empty timeline (shorts)', async () => {
        const timeline = createEmptyTimeline('shorts');
        if (timeline.settings.width !== 1080) throw new Error('Wrong width');
        return `${timeline.settings.width}x${timeline.settings.height}`;
    }));

    results.push(await runTest('Build timeline from recipe context', async () => {
        const timeline = buildTimelineFromRecipe({
            jobId,
            recipe: { recipeSlug: 'graciela', format: 'longform' },
            previousOutputs: { tts: { audioPath: '/tmp/test.mp3', durationSec: 30 } },
            input: {},
        });
        return `${timeline.scenes.length} scenes, ${timeline.scenes[0]?.elements.length || 0} elements`;
    }));

    results.push(await runTest('Validate timeline', async () => {
        const timeline = buildTimelineFromRecipe({
            jobId,
            recipe: { recipeSlug: 'graciela', format: 'longform' },
            previousOutputs: { tts: { audioPath: '/tmp/test.mp3', durationSec: 30 } },
            input: {},
        });
        const validation = validateTimeline(timeline);
        if (!validation.valid && validation.errors.some(e => e.code !== 'MISSING_SRC')) {
            throw new Error(validation.errors.map(e => e.message).join('; '));
        }
        return `${validation.errors.length} errors, ${validation.warnings.length} warnings`;
    }));

    console.log('');

    // ==========================================
    // SECTION 2: Compiler
    // ==========================================
    console.log('▶ SECTION 2: Compiler');
    console.log('-'.repeat(40));

    results.push(await runTest('Compile timeline to RenderPlan', async () => {
        const timeline = buildTimelineFromRecipe({
            jobId,
            recipe: { recipeSlug: 'graciela', format: 'longform' },
            previousOutputs: { tts: { audioPath: '/tmp/test.mp3', durationSec: 30 } },
            input: {},
        });

        const outputDir = path.join(process.cwd(), 'tmp', jobId);
        const result = compileTimeline(timeline, { jobId, outputDir });

        if (!result.success || !result.plan) {
            throw new Error(result.errors.join('; '));
        }

        return `${result.plan.steps.length} steps, final: ${result.plan.finalOutput}`;
    }));

    console.log('');

    // ==========================================
    // SECTION 3: Presets & System
    // ==========================================
    console.log('▶ SECTION 3: Presets & System');
    console.log('-'.repeat(40));

    results.push(await runTest('Check VideoToolbox availability', async () => {
        const available = await isVideoToolboxAvailable();
        return available ? 'Available' : 'Not available (software fallback)';
    }));

    results.push(await runTest('Get best preset for longform', async () => {
        const preset = await getBestPreset('longform');
        return `${preset.name} (${preset.encoder})`;
    }));

    results.push(await runTest('Get best preset for shorts', async () => {
        const preset = await getBestPreset('shorts');
        return `${preset.name} (${preset.encoder})`;
    }));

    results.push(await runTest('List all presets', async () => {
        const presets = listPresets();
        return `${presets.length} presets`;
    }));

    console.log('');

    // ==========================================
    // SECTION 4: Worker & Queue
    // ==========================================
    console.log('▶ SECTION 4: Worker & Queue');
    console.log('-'.repeat(40));

    results.push(await runTest('Get render worker instance', async () => {
        const worker = getRenderWorker();
        const status = worker.getStatus();
        return `running: ${status.isRunning}, queue: ${status.queueLength}`;
    }));

    results.push(await runTest('Worker start/stop', async () => {
        const worker = getRenderWorker();
        worker.start();
        const started = worker.getStatus().isRunning;
        worker.stop();
        const stopped = !worker.getStatus().isRunning;
        if (!started) throw new Error('Worker did not start');
        return `started: ${started}, stopped: ${stopped}`;
    }));

    console.log('');

    // ==========================================
    // SECTION 5: Logging
    // ==========================================
    console.log('▶ SECTION 5: Logging');
    console.log('-'.repeat(40));

    results.push(await runTest('Create job logger', async () => {
        const logger = createJobLogger(jobId);
        logger.info('Test message');
        return 'Logger created and used';
    }));

    results.push(await runTest('Global render logger', async () => {
        const logger = getRenderLogger();
        logger.startJob(jobId + '-test');
        logger.info(jobId + '-test', 'Test log entry');
        const summary = logger.endJob(jobId + '-test', 'completed');
        return `${summary?.entries.length || 0} entries logged`;
    }));

    console.log('');

    // ==========================================
    // SECTION 6: Cache & Storage
    // ==========================================
    console.log('▶ SECTION 6: Cache & Storage');
    console.log('-'.repeat(40));

    results.push(await runTest('Artifact cache hash', async () => {
        const cache = getArtifactCache();
        const hash1 = cache.hash({ a: 1, b: 2 });
        const hash2 = cache.hash({ b: 2, a: 1 }); // Same content, different order
        if (hash1 !== hash2) throw new Error('Hash should be consistent regardless of key order');
        return `hash: ${hash1}`;
    }));

    results.push(await runTest('Cache stats', async () => {
        const cache = getArtifactCache();
        const stats = cache.getStats();
        return `entries: ${stats.totalEntries}, hit rate: ${(stats.hitRate * 100).toFixed(1)}%`;
    }));

    results.push(await runTest('Storage instance', async () => {
        const storage = getStorage();
        const stats = await storage.getStats();
        return `artifacts: ${stats.totalArtifacts}`;
    }));

    console.log('');

    // ==========================================
    // SUMMARY
    // ==========================================
    console.log('='.repeat(70));
    console.log('RESULTS');
    console.log('='.repeat(70));

    let passed = 0;
    let failed = 0;

    for (const result of results) {
        const status = result.passed ? '✅' : '❌';
        const duration = result.duration ? ` (${result.duration}ms)` : '';
        const details = result.details ? ` → ${result.details}` : '';
        console.log(`${status} ${result.name}${duration}${details}`);

        if (result.passed) passed++;
        else failed++;
    }

    console.log('');
    console.log('-'.repeat(70));
    console.log(`Total: ${passed} passed, ${failed} failed`);
    console.log('');

    if (failed === 0) {
        console.log('🎉 Full render pipeline integration is working correctly!');
        console.log('');
        console.log('Next step: Run with real files');
        console.log('  npm run dev');
        console.log('  Then create a job with useTimelineDSL: true');
    } else {
        console.log('⚠️  Some tests failed. Check output above.');
        process.exit(1);
    }
}

main().catch((err) => {
    console.error('Error:', err);
    process.exit(1);
});

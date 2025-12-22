#!/usr/bin/env npx tsx
/**
 * Test Script: Timeline DSL Integration
 * 
 * Testa a integração Timeline DSL sem precisar rodar o job completo.
 * 
 * Uso: npx tsx scripts/test-timeline-executor.ts
 */

import { buildTimelineFromRecipe } from '../lib/engine/recipe-to-timeline';
import { executeRenderPlan, getExecutionSummary } from '../lib/engine/timeline-executor';
import { compileTimeline, validateTimeline } from '../lib/timeline';
import { existsSync } from 'fs';
import path from 'path';

async function main() {
    console.log('='.repeat(60));
    console.log('TEST: Timeline DSL Integration');
    console.log('='.repeat(60));

    const jobId = `test-${Date.now()}`;
    const outputDir = path.join(process.cwd(), 'jobs', jobId, 'render');

    // Simular TTS output (usar um arquivo de áudio existente se houver)
    const testAudioPaths = [
        path.join(process.cwd(), 'public', 'assets', 'test-audio.mp3'),
        path.join(process.cwd(), 'recipes', 'graciela', 'assets', 'test.mp3'),
    ];

    const audioPath = testAudioPaths.find(p => existsSync(p));

    if (!audioPath) {
        console.log('\n⚠️  ATENÇÃO: Nenhum arquivo de áudio de teste encontrado.');
        console.log('   Criando timeline de demonstração sem áudio real.\n');
    }

    // Step 1: Build Timeline from recipe context
    console.log('\n[1] Building Timeline from recipe context...');
    const timeline = buildTimelineFromRecipe({
        jobId,
        recipe: {
            recipeSlug: 'graciela',
            format: 'longform',
        },
        previousOutputs: {
            tts: {
                audioPath: audioPath || '/tmp/test-audio.mp3',
                durationSec: 10, // 10 segundos de teste
            },
        },
        input: {},
    });

    console.log(`   ✓ Timeline version: ${timeline.version}`);
    console.log(`   ✓ Settings: ${timeline.settings.width}x${timeline.settings.height} @ ${timeline.settings.fps}fps`);
    console.log(`   ✓ Scenes: ${timeline.scenes.length}`);
    timeline.scenes.forEach((scene, i) => {
        console.log(`     - Scene ${i + 1}: ${scene.elements.length} elements, duration ${scene.duration}s`);
    });

    // Step 2: Validate Timeline
    console.log('\n[2] Validating Timeline...');
    const validation = validateTimeline(timeline);
    if (!validation.valid) {
        console.log(`   ✗ Validation failed:`);
        validation.errors.forEach(err => console.log(`     - ${err.message}`));
        process.exit(1);
    }
    console.log(`   ✓ Timeline is valid`);
    if (validation.warnings.length > 0) {
        validation.warnings.forEach(w => console.log(`   ⚠ Warning: ${w.message}`));
    }

    // Step 3: Compile Timeline to RenderPlan
    console.log('\n[3] Compiling Timeline to RenderPlan...');
    const compileResult = compileTimeline(timeline, {
        jobId,
        outputDir,
        dryRun: true, // Não executar realmente, só gerar o plano
    });

    if (!compileResult.success || !compileResult.plan) {
        console.log(`   ✗ Compilation failed:`);
        compileResult.errors.forEach(err => console.log(`     - ${err}`));
        process.exit(1);
    }

    const plan = compileResult.plan;
    console.log(`   ✓ RenderPlan created: ${plan.steps.length} steps`);
    console.log(`   ✓ Final output: ${plan.finalOutput}`);

    plan.steps.forEach((step, i) => {
        console.log(`     [${i + 1}] ${step.type}: ${step.metadata.description}`);
        console.log(`         Command: ${step.command.slice(0, 80)}...`);
    });

    // Step 4: Execute RenderPlan (dry run)
    console.log('\n[4] Executing RenderPlan (dry run)...');
    const execution = await executeRenderPlan(plan, {
        dryRun: true, // Apenas simular
        onLog: (stepId, msg) => console.log(`   [${stepId}] ${msg}`),
    });

    console.log(`\n   ${getExecutionSummary(execution)}`);

    // Summary
    console.log('\n' + '='.repeat(60));
    if (execution.status === 'completed') {
        console.log('✅ TEST PASSED: Timeline DSL integration works correctly!');
        console.log('\nPara testar com render real:');
        console.log('1. Crie um job com input: { "useTimelineDSL": true }');
        console.log('2. Execute o job normalmente');
    } else {
        console.log('❌ TEST FAILED: Check errors above');
        process.exit(1);
    }
    console.log('='.repeat(60));
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});

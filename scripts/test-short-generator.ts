#!/usr/bin/env npx tsx
/**
 * Test Script: Short Generator
 * 
 * Testa o pipeline de geração de shorts (sem arquivos reais).
 * 
 * Uso: npx tsx scripts/test-short-generator.ts
 */

import {
    parseSrt,
    convertSrtToAss,
    listSubtitleStyles,
    getSubtitleStyleForPlatform
} from '../lib/engine/subtitle-generator';
import {
    segmentsForShorts,
    segmentsFromChapters,
    formatDuration
} from '../lib/engine/clip-extractor';
import { getPresetForPlatform, listPresets } from '../lib/engine/preset-registry';
import { getArtifactCache } from '../lib/engine/artifact-cache';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';

async function main() {
    console.log('='.repeat(60));
    console.log('TEST: Short Generator Components');
    console.log('='.repeat(60));
    console.log('');

    let passed = 0;
    let failed = 0;

    // Test 1: SRT Parser
    console.log('[1] Testing SRT Parser...');
    const srtContent = `1
00:00:01,000 --> 00:00:03,500
Este é o primeiro segmento.

2
00:00:04,000 --> 00:00:07,000
Segundo segmento com mais texto
que ocupa duas linhas.

3
00:00:08,000 --> 00:00:10,500
Terceiro e último segmento.`;

    const entries = parseSrt(srtContent);
    if (entries.length === 3 && entries[0].text === 'Este é o primeiro segmento.') {
        console.log('   ✅ Parser: 3 entries parsed correctly');
        passed++;
    } else {
        console.log(`   ❌ Parser: Expected 3 entries, got ${entries.length}`);
        failed++;
    }

    // Test 2: SRT to ASS Conversion
    console.log('[2] Testing SRT to ASS Conversion...');
    const testDir = path.join(process.cwd(), 'tmp', 'test-shorts');
    if (!existsSync(testDir)) {
        mkdirSync(testDir, { recursive: true });
    }

    const srtPath = path.join(testDir, 'test.srt');
    const assPath = path.join(testDir, 'test.ass');
    writeFileSync(srtPath, srtContent);

    const conversionResult = convertSrtToAss({
        inputPath: srtPath,
        outputPath: assPath,
        style: 'shorts-tiktok',
        videoWidth: 1080,
        videoHeight: 1920,
    });

    if (conversionResult.success && existsSync(assPath)) {
        console.log(`   ✅ Conversion: ASS file created at ${assPath}`);
        passed++;
    } else {
        console.log(`   ❌ Conversion failed: ${conversionResult.error}`);
        failed++;
    }

    // Test 3: Subtitle Styles
    console.log('[3] Testing Subtitle Styles...');
    const styles = listSubtitleStyles();
    if (styles.length >= 6) {
        console.log(`   ✅ Styles: ${styles.length} styles available`);
        styles.forEach(s => console.log(`      - ${s.name}: ${s.config.fontName} ${s.config.fontSize}px`));
        passed++;
    } else {
        console.log(`   ❌ Expected at least 6 styles, got ${styles.length}`);
        failed++;
    }

    // Test 4: Platform Style Mapping
    console.log('[4] Testing Platform Style Mapping...');
    const tiktokStyle = getSubtitleStyleForPlatform('tiktok');
    const youtubeStyle = getSubtitleStyleForPlatform('youtube-shorts');
    if (tiktokStyle === 'shorts-tiktok' && youtubeStyle === 'shorts-youtube') {
        console.log('   ✅ Platform mapping: TikTok -> shorts-tiktok, YouTube -> shorts-youtube');
        passed++;
    } else {
        console.log(`   ❌ Platform mapping incorrect`);
        failed++;
    }

    // Test 5: Segment Generation
    console.log('[5] Testing Segment Generation...');
    const segments = segmentsForShorts(300, { targetCount: 5, minDuration: 30, maxDuration: 60 });
    if (segments.length <= 5 && segments.every(s => s.duration >= 30 && s.duration <= 60)) {
        console.log(`   ✅ Segments: Generated ${segments.length} segments`);
        segments.forEach(s => console.log(`      - ${s.id}: ${formatDuration(s.startTime)} - ${formatDuration(s.endTime)} (${formatDuration(s.duration)})`));
        passed++;
    } else {
        console.log(`   ❌ Segment generation failed`);
        failed++;
    }

    // Test 6: Chapter Segments
    console.log('[6] Testing Chapter Segments...');
    const chapters = [
        { title: 'Intro', startTime: 0 },
        { title: 'Main Content', startTime: 60 },
        { title: 'Conclusion', startTime: 180 },
    ];
    const chapterSegments = segmentsFromChapters(chapters, 240);
    if (chapterSegments.length === 3 && chapterSegments[0].title === 'Intro') {
        console.log(`   ✅ Chapters: ${chapterSegments.length} segments from chapters`);
        passed++;
    } else {
        console.log(`   ❌ Chapter parsing failed`);
        failed++;
    }

    // Test 7: Platform Presets
    console.log('[7] Testing Platform Presets...');
    const tiktokPreset = getPresetForPlatform('tiktok');
    const reelsPreset = getPresetForPlatform('instagram-reels');
    if (tiktokPreset && reelsPreset) {
        console.log(`   ✅ Presets: TikTok (${tiktokPreset.scale}), Reels (${reelsPreset.scale})`);
        passed++;
    } else {
        console.log(`   ❌ Platform presets not found`);
        failed++;
    }

    // Test 8: All Presets
    console.log('[8] Testing Preset Registry...');
    const allPresets = listPresets();
    if (allPresets.length >= 10) {
        console.log(`   ✅ Registry: ${allPresets.length} presets available`);
        passed++;
    } else {
        console.log(`   ❌ Expected at least 10 presets, got ${allPresets.length}`);
        failed++;
    }

    // Test 9: Artifact Cache
    console.log('[9] Testing Artifact Cache...');
    const cache = getArtifactCache({ enabled: true });
    const testHash = cache.hash({ test: 'data', number: 123 });
    if (testHash && testHash.length === 16) {
        console.log(`   ✅ Cache: Hash generated (${testHash})`);
        passed++;
    } else {
        console.log(`   ❌ Cache hash generation failed`);
        failed++;
    }

    // Summary
    console.log('');
    console.log('='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log('');

    if (failed === 0) {
        console.log('🎉 All short generator components working correctly!');
    } else {
        console.log('⚠️  Some tests failed. Check output above.');
        process.exit(1);
    }
}

main().catch((err) => {
    console.error('Error:', err);
    process.exit(1);
});

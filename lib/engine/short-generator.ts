/**
 * Short Generator
 * 
 * Pipeline completo para geração de shorts a partir de longform.
 * Combina clip extraction, subtitle generation, e render.
 * 
 * Fase 2: Short-form Pipeline
 */

import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { ClipSegment, extractClips, segmentsForShorts } from './clip-extractor';
import { convertSrtToAss, getSubtitleStyleForPlatform, SubtitleStylePreset } from './subtitle-generator';
import { compileTimeline, Timeline, createScene, createVideoElement, createAudioElement, createSubtitleElement, FORMAT_PRESETS } from '@/lib/timeline';
import { executeRenderPlan } from './timeline-executor';
import { getPresetForPlatform } from './preset-registry';

// ===========================================
// TYPES
// ===========================================

export type ShortsPlatform = 'youtube-shorts' | 'tiktok' | 'instagram-reels';

export interface ShortConfig {
    /** Short ID */
    id: string;
    /** Title for the short */
    title: string;
    /** Description */
    description?: string;
    /** Tags/hashtags */
    tags?: string[];
    /** Target platform */
    platform: ShortsPlatform;
    /** Clip segment */
    segment: ClipSegment;
    /** Custom hook text (first 2-3 seconds) */
    hookText?: string;
}

export interface GenerateShortOptions {
    /** Job ID */
    jobId: string;
    /** Base output directory */
    outputDir: string;
    /** Short configuration */
    short: ShortConfig;
    /** Source video path (longform) */
    sourceVideoPath: string;
    /** Source SRT path (optional) */
    sourceSrtPath?: string;
    /** Background audio path (optional music) */
    backgroundAudioPath?: string;
    /** Dry run (don't actually render) */
    dryRun?: boolean;
}

export interface GenerateShortsFromLongformOptions {
    /** Job ID */
    jobId: string;
    /** Longform video path */
    videoPath: string;
    /** Longform SRT path */
    srtPath?: string;
    /** Output directory */
    outputDir: string;
    /** Target platforms */
    platforms: ShortsPlatform[];
    /** Segments (auto-generate if not provided) */
    segments?: ClipSegment[];
    /** Number of shorts to generate (if auto-generating segments) */
    targetCount?: number;
}

export interface ShortResult {
    id: string;
    success: boolean;
    platform: ShortsPlatform;
    videoPath?: string;
    thumbnailPath?: string;
    error?: string;
    durationSec?: number;
}

export interface BatchShortsResult {
    success: boolean;
    shorts: ShortResult[];
    errors: string[];
}

// ===========================================
// SINGLE SHORT GENERATOR
// ===========================================

/**
 * Generate a single short
 */
export async function generateShort(options: GenerateShortOptions): Promise<ShortResult> {
    const {
        jobId,
        outputDir,
        short,
        sourceVideoPath,
        sourceSrtPath,
        backgroundAudioPath,
        dryRun = false,
    } = options;

    const shortOutputDir = path.join(outputDir, short.id);

    // Ensure output directory
    if (!existsSync(shortOutputDir)) {
        mkdirSync(shortOutputDir, { recursive: true });
    }

    try {
        // 1. Extract clip from longform
        const clipPath = path.join(shortOutputDir, 'clip.mp4');

        if (!dryRun) {
            const { exec } = require('child_process');
            const extractCmd = buildClipExtractCommand(
                sourceVideoPath,
                clipPath,
                short.segment
            );

            await new Promise<void>((resolve, reject) => {
                exec(extractCmd, { timeout: 5 * 60 * 1000 }, (error: Error | null) => {
                    if (error) reject(error);
                    else resolve();
                });
            });
        }

        // 2. Generate styled subtitles if SRT provided
        let assPath: string | undefined;
        if (sourceSrtPath && existsSync(sourceSrtPath)) {
            assPath = path.join(shortOutputDir, 'subtitles.ass');
            const subtitleStyle = getSubtitleStyleForPlatform(short.platform);

            const subtitleResult = convertSrtToAss({
                inputPath: sourceSrtPath,
                outputPath: assPath,
                style: subtitleStyle,
                videoWidth: 1080,
                videoHeight: 1920,
            });

            if (!subtitleResult.success) {
                console.warn(`Warning: Failed to convert subtitles: ${subtitleResult.error}`);
                assPath = undefined;
            }
        }

        // 3. Build Timeline for short
        const timeline = buildShortTimeline({
            shortId: short.id,
            platform: short.platform,
            clipPath,
            audioDuration: short.segment.duration,
            assPath,
            backgroundAudioPath,
        });

        // 4. Compile and render
        const finalOutputPath = path.join(shortOutputDir, `${short.id}-${short.platform}.mp4`);

        if (dryRun) {
            return {
                id: short.id,
                success: true,
                platform: short.platform,
                videoPath: finalOutputPath,
                durationSec: short.segment.duration,
            };
        }

        const compileResult = compileTimeline(timeline, {
            jobId: `${jobId}-${short.id}`,
            outputDir: shortOutputDir,
            encodePreset: getPresetForPlatform(short.platform),
        });

        if (!compileResult.success || !compileResult.plan) {
            return {
                id: short.id,
                success: false,
                platform: short.platform,
                error: compileResult.errors.join('; '),
            };
        }

        const execution = await executeRenderPlan(compileResult.plan);

        if (execution.status !== 'completed') {
            const failedStep = execution.stepResults.find(r => r.status === 'failed');
            return {
                id: short.id,
                success: false,
                platform: short.platform,
                error: failedStep?.error?.message || 'Render failed',
            };
        }

        // 5. Generate thumbnail
        const thumbnailPath = path.join(shortOutputDir, `${short.id}-thumb.jpg`);
        await generateThumbnail(execution.finalOutputPath || clipPath, thumbnailPath);

        return {
            id: short.id,
            success: true,
            platform: short.platform,
            videoPath: execution.finalOutputPath,
            thumbnailPath,
            durationSec: short.segment.duration,
        };

    } catch (err) {
        const error = err as Error;
        return {
            id: short.id,
            success: false,
            platform: short.platform,
            error: error.message,
        };
    }
}

// ===========================================
// BATCH GENERATOR
// ===========================================

/**
 * Generate multiple shorts from a longform video
 */
export async function generateShortsFromLongform(
    options: GenerateShortsFromLongformOptions
): Promise<BatchShortsResult> {
    const {
        jobId,
        videoPath,
        srtPath,
        outputDir,
        platforms,
        segments,
        targetCount = 5,
    } = options;

    const errors: string[] = [];
    const shorts: ShortResult[] = [];

    // Check input exists
    if (!existsSync(videoPath)) {
        return { success: false, shorts: [], errors: [`Video not found: ${videoPath}`] };
    }

    // Generate segments if not provided
    const totalDuration = await getVideoDuration(videoPath);
    const clipSegments = segments || segmentsForShorts(totalDuration, { targetCount });

    // Generate shorts for each platform
    for (const platform of platforms) {
        for (const segment of clipSegments) {
            const short: ShortConfig = {
                id: `${segment.id}-${platform}`,
                title: segment.title || `Short ${segment.id}`,
                platform,
                segment,
            };

            const result = await generateShort({
                jobId,
                outputDir,
                short,
                sourceVideoPath: videoPath,
                sourceSrtPath: srtPath,
            });

            shorts.push(result);

            if (!result.success && result.error) {
                errors.push(`${short.id}: ${result.error}`);
            }
        }
    }

    return {
        success: errors.length === 0,
        shorts,
        errors,
    };
}

// ===========================================
// HELPERS
// ===========================================

/**
 * Build FFmpeg command for clip extraction (vertical crop)
 */
function buildClipExtractCommand(
    inputPath: string,
    outputPath: string,
    segment: ClipSegment
): string {
    // Extract and crop to 9:16 from center
    const filters = [
        'scale=1920:-1',                    // Scale to 1920 width
        'crop=1080:1920:(iw-1080)/2:0',     // Crop center for 9:16
    ].join(',');

    return `ffmpeg -y -ss ${segment.startTime} -i "${inputPath}" -t ${segment.duration} -vf "${filters}" -c:v h264_videotoolbox -b:v 6M -c:a aac -b:a 192k "${outputPath}"`;
}

/**
 * Build Timeline for short video
 */
function buildShortTimeline(options: {
    shortId: string;
    platform: ShortsPlatform;
    clipPath: string;
    audioDuration: number;
    assPath?: string;
    backgroundAudioPath?: string;
}): Timeline {
    const { shortId, clipPath, audioDuration, assPath, backgroundAudioPath } = options;

    const elements = [];
    let layerIndex = 0;

    // Video layer
    elements.push(createVideoElement(
        `video-${shortId}`,
        clipPath,
        audioDuration,
        { layer: layerIndex++, start: 0, props: { scale: 1 } }
    ));

    // Background audio if provided
    if (backgroundAudioPath && existsSync(backgroundAudioPath)) {
        elements.push(createAudioElement(
            `bgm-${shortId}`,
            backgroundAudioPath,
            audioDuration,
            { layer: layerIndex++, start: 0, props: { volume: 0.3 } }
        ));
    }

    // Subtitles if available
    if (assPath && existsSync(assPath)) {
        elements.push(createSubtitleElement(
            `subs-${shortId}`,
            assPath,
            audioDuration,
            'shorts'
        ));
    }

    const scene = createScene('main', 0, audioDuration, elements);

    return {
        version: '1.0.0',
        settings: FORMAT_PRESETS['shorts'],
        scenes: [scene],
    };
}

/**
 * Generate thumbnail from video
 */
async function generateThumbnail(videoPath: string, outputPath: string): Promise<boolean> {
    if (!existsSync(videoPath)) return false;

    try {
        const { exec } = require('child_process');
        await new Promise<void>((resolve, reject) => {
            exec(
                `ffmpeg -y -i "${videoPath}" -ss 1 -vframes 1 -q:v 2 "${outputPath}"`,
                { timeout: 30000 },
                (error: Error | null) => {
                    if (error) reject(error);
                    else resolve();
                }
            );
        });
        return true;
    } catch {
        return false;
    }
}

/**
 * Get video duration in seconds
 */
async function getVideoDuration(videoPath: string): Promise<number> {
    try {
        const { exec } = require('child_process');
        return new Promise((resolve) => {
            exec(
                `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`,
                { timeout: 10000 },
                (error: Error | null, stdout: string) => {
                    if (error) resolve(60); // Default fallback
                    else resolve(parseFloat(stdout) || 60);
                }
            );
        });
    } catch {
        return 60;
    }
}

/**
 * Clip Extractor
 * 
 * Extrai clips de um vídeo longform para geração de shorts.
 * Suporta extração por timestamps, capítulos, ou detecção automática.
 * 
 * Fase 2: Short-form Pipeline
 */

import { existsSync, mkdirSync } from 'fs';
import path from 'path';

// ===========================================
// TYPES
// ===========================================

export interface ClipSegment {
    id: string;
    startTime: number;      // Segundos
    endTime: number;
    duration: number;
    title?: string;
    description?: string;
    tags?: string[];
    score?: number;         // Relevância/qualidade (0-100)
}

export interface ExtractionResult {
    success: boolean;
    clips: ExtractedClip[];
    errors: string[];
}

export interface ExtractedClip {
    id: string;
    segment: ClipSegment;
    videoPath?: string;
    audioPath?: string;
    thumbnailPath?: string;
}

export interface ExtractionOptions {
    /** Input video path */
    inputPath: string;
    /** Output directory for clips */
    outputDir: string;
    /** Segments to extract */
    segments: ClipSegment[];
    /** Extract video */
    extractVideo?: boolean;
    /** Extract audio separately */
    extractAudio?: boolean;
    /** Generate thumbnails */
    generateThumbnails?: boolean;
    /** Video preset for clips */
    videoPreset?: 'draft' | 'standard' | 'high';
}

// ===========================================
// SEGMENT GENERATORS
// ===========================================

/**
 * Generate segments from chapter markers
 */
export function segmentsFromChapters(
    chapters: Array<{ title: string; startTime: number; endTime?: number }>,
    totalDuration: number
): ClipSegment[] {
    return chapters.map((chapter, index) => {
        const nextStart = chapters[index + 1]?.startTime ?? totalDuration;
        const endTime = chapter.endTime ?? nextStart;

        return {
            id: `chapter-${index + 1}`,
            startTime: chapter.startTime,
            endTime,
            duration: endTime - chapter.startTime,
            title: chapter.title,
        };
    });
}

/**
 * Generate segments from timestamps (simples)
 */
export function segmentsFromTimestamps(
    timestamps: Array<{ start: number; end: number; title?: string }>
): ClipSegment[] {
    return timestamps.map((ts, index) => ({
        id: `clip-${index + 1}`,
        startTime: ts.start,
        endTime: ts.end,
        duration: ts.end - ts.start,
        title: ts.title,
    }));
}

/**
 * Generate fixed-length segments
 */
export function segmentsFixedLength(
    totalDuration: number,
    segmentDuration: number = 60,
    overlap: number = 0
): ClipSegment[] {
    const segments: ClipSegment[] = [];
    let start = 0;
    let index = 1;

    while (start < totalDuration) {
        const end = Math.min(start + segmentDuration, totalDuration);

        segments.push({
            id: `segment-${index}`,
            startTime: start,
            endTime: end,
            duration: end - start,
        });

        start = end - overlap;
        if (start >= totalDuration - 1) break;
        index++;
    }

    return segments;
}

/**
 * Generate shorts-friendly segments (15-60 seconds)
 */
export function segmentsForShorts(
    totalDuration: number,
    options: {
        minDuration?: number;
        maxDuration?: number;
        targetCount?: number;
    } = {}
): ClipSegment[] {
    const {
        minDuration = 15,
        maxDuration = 60,
        targetCount = Math.floor(totalDuration / 60), // 1 short per minute
    } = options;

    const segments: ClipSegment[] = [];
    const avgDuration = Math.min(maxDuration, Math.max(minDuration, totalDuration / targetCount));

    let currentTime = 0;
    let index = 1;

    while (currentTime < totalDuration && segments.length < targetCount) {
        // Vary duration slightly for natural feel
        const variance = Math.random() * 10 - 5;
        const duration = Math.min(
            Math.max(minDuration, avgDuration + variance),
            maxDuration,
            totalDuration - currentTime
        );

        if (duration < minDuration) break;

        segments.push({
            id: `short-${index}`,
            startTime: currentTime,
            endTime: currentTime + duration,
            duration,
            score: Math.floor(Math.random() * 30 + 70), // Placeholder score
        });

        currentTime += duration;
        index++;
    }

    return segments;
}

// ===========================================
// EXTRACTOR
// ===========================================

/**
 * Build FFmpeg command for clip extraction
 */
function buildExtractCommand(
    inputPath: string,
    outputPath: string,
    segment: ClipSegment,
    options: { video?: boolean; audio?: boolean; preset?: string }
): string {
    const { video = true, audio = false, preset = 'standard' } = options;

    const startTime = segment.startTime;
    const duration = segment.duration;

    const presetArgs: Record<string, string> = {
        'draft': '-c:v libx264 -preset ultrafast -crf 28 -c:a aac -b:a 128k',
        'standard': '-c:v h264_videotoolbox -b:v 4M -c:a aac -b:a 192k',
        'high': '-c:v h264_videotoolbox -b:v 8M -c:a aac -b:a 256k',
    };

    if (audio && !video) {
        // Audio only
        return `ffmpeg -y -ss ${startTime} -i "${inputPath}" -t ${duration} -vn -c:a aac -b:a 192k "${outputPath}"`;
    }

    // Video (with or without audio)
    return `ffmpeg -y -ss ${startTime} -i "${inputPath}" -t ${duration} ${presetArgs[preset]} "${outputPath}"`;
}

/**
 * Build FFmpeg command for thumbnail extraction
 */
function buildThumbnailCommand(
    inputPath: string,
    outputPath: string,
    segment: ClipSegment
): string {
    // Take thumbnail from middle of segment
    const thumbnailTime = segment.startTime + (segment.duration / 2);
    return `ffmpeg -y -ss ${thumbnailTime} -i "${inputPath}" -vframes 1 -q:v 2 "${outputPath}"`;
}

/**
 * Extract clips from video
 */
export async function extractClips(options: ExtractionOptions): Promise<ExtractionResult> {
    const {
        inputPath,
        outputDir,
        segments,
        extractVideo = true,
        extractAudio = false,
        generateThumbnails = true,
        videoPreset = 'standard',
    } = options;

    const errors: string[] = [];
    const clips: ExtractedClip[] = [];

    // Check input exists
    if (!existsSync(inputPath)) {
        return { success: false, clips: [], errors: [`Input file not found: ${inputPath}`] };
    }

    // Ensure output directory
    if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
    }

    // Process each segment
    for (const segment of segments) {
        const clip: ExtractedClip = {
            id: segment.id,
            segment,
        };

        try {
            // Extract video
            if (extractVideo) {
                const videoPath = path.join(outputDir, `${segment.id}.mp4`);
                const videoCmd = buildExtractCommand(inputPath, videoPath, segment, {
                    video: true,
                    preset: videoPreset
                });

                const { exec } = require('child_process');
                await new Promise<void>((resolve, reject) => {
                    exec(videoCmd, { timeout: 5 * 60 * 1000 }, (error: Error | null) => {
                        if (error) reject(error);
                        else resolve();
                    });
                });

                clip.videoPath = videoPath;
            }

            // Extract audio
            if (extractAudio) {
                const audioPath = path.join(outputDir, `${segment.id}.mp3`);
                const audioCmd = buildExtractCommand(inputPath, audioPath, segment, {
                    video: false,
                    audio: true
                });

                const { exec } = require('child_process');
                await new Promise<void>((resolve, reject) => {
                    exec(audioCmd, { timeout: 2 * 60 * 1000 }, (error: Error | null) => {
                        if (error) reject(error);
                        else resolve();
                    });
                });

                clip.audioPath = audioPath;
            }

            // Generate thumbnail
            if (generateThumbnails) {
                const thumbnailPath = path.join(outputDir, `${segment.id}-thumb.jpg`);
                const thumbCmd = buildThumbnailCommand(inputPath, thumbnailPath, segment);

                const { exec } = require('child_process');
                await new Promise<void>((resolve, reject) => {
                    exec(thumbCmd, { timeout: 30 * 1000 }, (error: Error | null) => {
                        if (error) reject(error);
                        else resolve();
                    });
                });

                clip.thumbnailPath = thumbnailPath;
            }

            clips.push(clip);

        } catch (err) {
            const error = err as Error;
            errors.push(`Failed to extract ${segment.id}: ${error.message}`);
        }
    }

    return {
        success: errors.length === 0,
        clips,
        errors,
    };
}

/**
 * Get clip duration in human-readable format
 */
export function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

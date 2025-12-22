/**
 * Subtitle Generator
 * 
 * Converte SRT para ASS com estilos customizados para shorts.
 * Suporta diferentes estilos por plataforma (TikTok, YouTube Shorts, Reels).
 * 
 * Fase 2: Short-form Pipeline
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';

// ===========================================
// TYPES
// ===========================================

export interface SubtitleStyle {
    name: string;
    fontName: string;
    fontSize: number;
    primaryColor: string;    // ASS color format: &HAABBGGRR
    outlineColor: string;
    backColor: string;
    bold: boolean;
    outline: number;
    shadow: number;
    alignment: number;       // 1-9 numpad position
    marginV: number;         // Vertical margin from bottom
    marginL: number;
    marginR: number;
}

export interface SrtEntry {
    index: number;
    startTime: string;       // "00:00:01,234"
    endTime: string;
    text: string;
}

export interface ConvertOptions {
    inputPath: string;
    outputPath: string;
    style: SubtitleStylePreset;
    videoWidth?: number;
    videoHeight?: number;
}

export type SubtitleStylePreset =
    | 'default'
    | 'shorts-tiktok'
    | 'shorts-youtube'
    | 'shorts-reels'
    | 'longform-minimal'
    | 'longform-bold';

// ===========================================
// STYLE PRESETS
// ===========================================

const STYLE_PRESETS: Record<SubtitleStylePreset, SubtitleStyle> = {
    'default': {
        name: 'Default',
        fontName: 'Arial',
        fontSize: 20,
        primaryColor: '&H00FFFFFF',  // White
        outlineColor: '&H00000000',  // Black
        backColor: '&H80000000',     // Semi-transparent black
        bold: false,
        outline: 2,
        shadow: 1,
        alignment: 2,                // Bottom center
        marginV: 30,
        marginL: 20,
        marginR: 20,
    },
    'shorts-tiktok': {
        name: 'TikTok',
        fontName: 'Arial Black',
        fontSize: 42,
        primaryColor: '&H00FFFFFF',  // White
        outlineColor: '&H00000000',  // Black
        backColor: '&H00000000',
        bold: true,
        outline: 4,
        shadow: 0,
        alignment: 5,                // Center
        marginV: 200,                // Higher to avoid TikTok UI
        marginL: 40,
        marginR: 40,
    },
    'shorts-youtube': {
        name: 'YouTubeShorts',
        fontName: 'Arial',
        fontSize: 38,
        primaryColor: '&H00FFFFFF',
        outlineColor: '&H00000000',
        backColor: '&H80000000',
        bold: true,
        outline: 3,
        shadow: 1,
        alignment: 2,
        marginV: 180,
        marginL: 30,
        marginR: 30,
    },
    'shorts-reels': {
        name: 'InstagramReels',
        fontName: 'Helvetica',
        fontSize: 36,
        primaryColor: '&H00FFFFFF',
        outlineColor: '&H00000000',
        backColor: '&H00000000',
        bold: true,
        outline: 3,
        shadow: 0,
        alignment: 5,
        marginV: 190,
        marginL: 35,
        marginR: 35,
    },
    'longform-minimal': {
        name: 'LongformMinimal',
        fontName: 'Arial',
        fontSize: 22,
        primaryColor: '&H00FFFFFF',
        outlineColor: '&H00000000',
        backColor: '&H00000000',
        bold: false,
        outline: 2,
        shadow: 1,
        alignment: 2,
        marginV: 40,
        marginL: 100,
        marginR: 100,
    },
    'longform-bold': {
        name: 'LongformBold',
        fontName: 'Arial Black',
        fontSize: 26,
        primaryColor: '&H0000FFFF',  // Yellow
        outlineColor: '&H00000000',
        backColor: '&H80000000',
        bold: true,
        outline: 3,
        shadow: 2,
        alignment: 2,
        marginV: 50,
        marginL: 80,
        marginR: 80,
    },
};

// ===========================================
// PARSER
// ===========================================

/**
 * Parse SRT file content
 */
export function parseSrt(content: string): SrtEntry[] {
    const entries: SrtEntry[] = [];
    const blocks = content.trim().split(/\n\n+/);

    for (const block of blocks) {
        const lines = block.split('\n');
        if (lines.length < 3) continue;

        const index = parseInt(lines[0], 10);
        const timeLine = lines[1];
        const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);

        if (!timeMatch) continue;

        const text = lines.slice(2).join('\n').trim();

        entries.push({
            index,
            startTime: timeMatch[1],
            endTime: timeMatch[2],
            text,
        });
    }

    return entries;
}

/**
 * Convert SRT time to ASS time format
 * SRT: "00:01:23,456" -> ASS: "0:01:23.46"
 */
function srtTimeToAss(srtTime: string): string {
    const [hours, minutes, rest] = srtTime.split(':');
    const [seconds, ms] = rest.split(',');
    const centiseconds = Math.floor(parseInt(ms, 10) / 10);

    return `${parseInt(hours, 10)}:${minutes}:${seconds}.${centiseconds.toString().padStart(2, '0')}`;
}

// ===========================================
// GENERATOR
// ===========================================

/**
 * Generate ASS header
 */
function generateAssHeader(
    style: SubtitleStyle,
    videoWidth: number,
    videoHeight: number
): string {
    return `[Script Info]
Title: Generated Subtitles
ScriptType: v4.00+
PlayResX: ${videoWidth}
PlayResY: ${videoHeight}
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: ${style.name},${style.fontName},${style.fontSize},${style.primaryColor},&H00FFFFFF,${style.outlineColor},${style.backColor},${style.bold ? -1 : 0},0,0,0,100,100,0,0,1,${style.outline},${style.shadow},${style.alignment},${style.marginL},${style.marginR},${style.marginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
}

/**
 * Generate ASS dialogue line
 */
function generateAssDialogue(entry: SrtEntry, styleName: string): string {
    const start = srtTimeToAss(entry.startTime);
    const end = srtTimeToAss(entry.endTime);
    // Replace SRT line breaks with ASS line breaks
    const text = entry.text.replace(/\n/g, '\\N');

    return `Dialogue: 0,${start},${end},${styleName},,0,0,0,,${text}`;
}

/**
 * Convert SRT to ASS
 */
export function convertSrtToAss(options: ConvertOptions): {
    success: boolean;
    outputPath?: string;
    error?: string;
} {
    const {
        inputPath,
        outputPath,
        style,
        videoWidth = 1080,
        videoHeight = 1920,
    } = options;

    // Check input exists
    if (!existsSync(inputPath)) {
        return { success: false, error: `Input file not found: ${inputPath}` };
    }

    try {
        // Read and parse SRT
        const srtContent = readFileSync(inputPath, 'utf-8');
        const entries = parseSrt(srtContent);

        if (entries.length === 0) {
            return { success: false, error: 'No subtitle entries found in SRT' };
        }

        // Get style preset
        const styleConfig = STYLE_PRESETS[style] || STYLE_PRESETS['default'];

        // Generate ASS content
        const header = generateAssHeader(styleConfig, videoWidth, videoHeight);
        const dialogues = entries.map(e => generateAssDialogue(e, styleConfig.name));
        const assContent = header + dialogues.join('\n') + '\n';

        // Ensure output directory exists
        const outputDir = path.dirname(outputPath);
        if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true });
        }

        // Write ASS file
        writeFileSync(outputPath, assContent, 'utf-8');

        return { success: true, outputPath };

    } catch (err) {
        const error = err as Error;
        return { success: false, error: error.message };
    }
}

/**
 * Get style for platform
 */
export function getSubtitleStyleForPlatform(
    platform: 'youtube' | 'youtube-shorts' | 'tiktok' | 'instagram-reels'
): SubtitleStylePreset {
    const mapping: Record<string, SubtitleStylePreset> = {
        'youtube': 'longform-minimal',
        'youtube-shorts': 'shorts-youtube',
        'tiktok': 'shorts-tiktok',
        'instagram-reels': 'shorts-reels',
    };

    return mapping[platform] || 'default';
}

/**
 * List available styles
 */
export function listSubtitleStyles(): Array<{ name: SubtitleStylePreset; config: SubtitleStyle }> {
    return Object.entries(STYLE_PRESETS).map(([name, config]) => ({
        name: name as SubtitleStylePreset,
        config,
    }));
}

"use server";

import { getStepKind } from "../capabilities";
import { ensureArtifactDir } from "../providers";
import { getPreviousOutputKey } from "../step-mapper";
import { renderVideo } from "../ffmpeg";
import { loadVideoPreset } from "../loaders";
import { StepDefinition, ResolvedConfig, LogEntry, StepManifest } from "../types";
import { VideoPreset } from "../ffmpeg"; // Type import

// Default preset for fallback when no preset configured
const DEFAULT_VIDEO_PRESET: VideoPreset = {
    encoder: 'h264_videotoolbox',
    scale: '1280:720',
    fps: 30,
    bitrate: '4M',
    pixelFormat: 'yuv420p',
    audioCodec: 'aac',
    audioBitrate: '192k',
};

export async function executeStepRender(
    stepDef: StepDefinition,
    stepConfig: ResolvedConfig,
    input: Record<string, unknown>,
    previousOutputs: Record<string, unknown>,
    logs: LogEntry[],
    jobId: string
): Promise<StepManifest> {
    const now = () => new Date().toISOString();
    const startedAt = now();
    const kind = stepDef.kind || getStepKind(stepDef.key);

    logs.push({ timestamp: now(), level: "info", message: `Step Render: ${stepDef.name}`, stepKey: stepDef.key });

    // Get audio from previous TTS step
    const ttsOutput = getPreviousOutputKey(previousOutputs, 'tts') as { audioPath?: string } | undefined;
    const audioPath = ttsOutput?.audioPath;

    if (!audioPath) {
        logs.push({ timestamp: now(), level: "error", message: "Nenhum áudio encontrado do step TTS", stepKey: stepDef.key });
        return {
            key: stepDef.key,
            kind,
            status: "failed",
            config: stepConfig,
            started_at: startedAt,
            completed_at: now(),
            error: { code: "NO_AUDIO", message: "Nenhum áudio encontrado do step TTS" },
        };
    }

    // Create output directory
    const artifactDir = await ensureArtifactDir(jobId, stepDef.key);
    const outputPath = `${artifactDir}/video.mp4`;

    // Load video preset from config or use defaults
    const presetId = stepConfig.preset_video?.id;
    let videoPreset = presetId ? await loadVideoPreset(presetId) : null;

    if (!videoPreset) {
        logs.push({ timestamp: now(), level: "warn", message: "Nenhum preset de vídeo configurado. Usando defaults (h264_videotoolbox 720p).", stepKey: stepDef.key });
        videoPreset = DEFAULT_VIDEO_PRESET;
    }

    // Execute Render (FFmpeg)
    logs.push({
        timestamp: now(),
        level: "info",
        message: `Iniciando renderização: ${videoPreset.encoder}, ${videoPreset.scale}`,
        stepKey: stepDef.key
    });

    const result = await renderVideo({
        audioPath,
        outputPath,
        preset: videoPreset,
    });

    if (!result.success) {
        return {
            key: stepDef.key,
            kind,
            status: "failed",
            config: stepConfig,
            started_at: startedAt,
            completed_at: now(),
            error: { code: "RENDER_FAILED", message: result.error?.message || "Erro desconhecido no FFmpeg" },
        };
    }

    logs.push({
        timestamp: now(),
        level: "info",
        message: `Vídeo renderizado com sucesso: ${Math.round((result.fileSizeBytes || 0) / 1024 / 1024)}MB`,
        stepKey: stepDef.key
    });

    return {
        key: stepDef.key,
        kind,
        status: "success",
        config: stepConfig,
        started_at: startedAt,
        completed_at: now(),
        duration_ms: Date.now() - new Date(startedAt).getTime(),
        artifacts: [{
            uri: result.outputPath!,
            content_type: "video/mp4",
            size_bytes: result.fileSizeBytes,
            duration_sec: result.durationSec,
        }],
        response: {
            output: { videoPath: result.outputPath, durationSec: result.durationSec },
        },
    };
}

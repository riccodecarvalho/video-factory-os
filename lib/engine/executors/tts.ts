"use server";

import { getStepKind } from "../capabilities";
import { executeTTS, ensureArtifactDir } from "../providers";
import { loadVoicePreset, loadSsmlPreset, loadProvider } from "../loaders";
import { StepDefinition, ResolvedConfig, LogEntry, StepManifest } from "../types";

export async function executeStepTTS(
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

    const stepManifest: StepManifest = {
        key: stepDef.key,
        kind,
        status: "running",
        config: stepConfig,
        started_at: startedAt,
    };

    logs.push({
        timestamp: now(),
        level: "info",
        message: `Step TTS: ${stepDef.name}`,
        stepKey: stepDef.key,
        meta: { voice_preset_id: stepConfig.preset_voice?.id }
    });

    // Get input text from previous step (can be string or object)
    // Try multiple keys: script (Graciela), roteiro (VJ), parse_ssml
    const scriptOutput = previousOutputs.script || previousOutputs.roteiro;
    const ssmlOutput = previousOutputs.parse_ssml;

    let textInput = "";

    // Try script/roteiro output (string or object)
    if (typeof scriptOutput === "string" && scriptOutput.length > 0) {
        textInput = scriptOutput;
    } else if (scriptOutput && typeof scriptOutput === "object") {
        textInput = (scriptOutput as { script?: string; roteiro?: string; output?: string }).script
            || (scriptOutput as { script?: string; roteiro?: string; output?: string }).roteiro
            || (scriptOutput as { script?: string; roteiro?: string; output?: string }).output
            || String(scriptOutput);
    }

    // Try parse_ssml output (string or object)
    if (!textInput) {
        if (typeof ssmlOutput === "string" && ssmlOutput.length > 0) {
            textInput = ssmlOutput;
        } else if (ssmlOutput && typeof ssmlOutput === "object") {
            textInput = (ssmlOutput as { ssml?: string; output?: string }).ssml
                || (ssmlOutput as { ssml?: string; output?: string }).output
                || String(ssmlOutput);
        }
    }

    // Fallback to input
    if (!textInput) {
        textInput = String(input.text || input.script || input.roteiro || "");
    }

    if (!textInput) {
        stepManifest.status = "failed";
        stepManifest.completed_at = now();
        stepManifest.error = { code: "NO_INPUT", message: "Nenhum texto/SSML para sintetizar" };
        return stepManifest;
    }

    // Load voice preset
    if (!stepConfig.preset_voice?.id) {
        stepManifest.status = "failed";
        stepManifest.completed_at = now();
        stepManifest.error = { code: "NO_VOICE_PRESET", message: "Nenhum preset de voz configurado" };
        return stepManifest;
    }

    const voicePreset = await loadVoicePreset(stepConfig.preset_voice.id);
    if (!voicePreset) {
        stepManifest.status = "failed";
        stepManifest.completed_at = now();
        stepManifest.error = { code: "VOICE_PRESET_NOT_FOUND", message: "Voice preset não encontrado" };
        return stepManifest;
    }

    // Load SSML preset if configured
    const ssmlPreset = stepConfig.preset_ssml?.id ? await loadSsmlPreset(stepConfig.preset_ssml.id) : null;

    // Load provider
    const provider = stepConfig.provider?.id ? await loadProvider(stepConfig.provider.id) : null;

    // Prepare output path
    const artifactDir = await ensureArtifactDir(jobId, stepDef.key);
    const outputPath = `${artifactDir}/audio.mp3`;

    logs.push({
        timestamp: now(),
        level: "info",
        message: `Chamando Azure TTS: voice=${voicePreset.voiceName}`,
        stepKey: stepDef.key
    });

    // Execute TTS
    const ttsResult = await executeTTS({
        provider: provider || { id: "", slug: "azure", name: "Azure TTS", type: "tts", config: {} },
        input: textInput,
        voicePreset: {
            id: voicePreset.id,
            voiceName: voicePreset.voiceName,
            language: voicePreset.language,
            rate: voicePreset.rate || undefined,
            pitch: voicePreset.pitch || undefined,
            style: voicePreset.style || undefined,
            styleDegree: voicePreset.styleDegree || undefined,
        },
        ssmlPreset: ssmlPreset ? {
            id: ssmlPreset.id,
            pauseMapping: JSON.parse(ssmlPreset.pauseMappings || "{}"),
        } : undefined,
        outputPath,
    });

    if (!ttsResult.success) {
        stepManifest.status = "failed";
        stepManifest.completed_at = now();
        stepManifest.error = ttsResult.error;
        logs.push({ timestamp: now(), level: "error", message: `TTS falhou: ${ttsResult.error?.message}`, stepKey: stepDef.key });
        return stepManifest;
    }

    logs.push({
        timestamp: now(),
        level: "info",
        message: `Áudio gerado: ${ttsResult.durationSec}s, ${Math.round((ttsResult.fileSizeBytes || 0) / 1024)}KB`,
        stepKey: stepDef.key
    });

    stepManifest.artifacts = [{
        uri: ttsResult.artifactUri!,
        content_type: ttsResult.contentType || "audio/mpeg",
        size_bytes: ttsResult.fileSizeBytes,
        duration_sec: ttsResult.durationSec,
    }];

    stepManifest.status = "success";
    stepManifest.completed_at = now();
    stepManifest.response = {
        output: { audioPath: ttsResult.artifactUri, durationSec: ttsResult.durationSec },
    };

    return stepManifest;
}

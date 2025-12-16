"use server";

/**
 * Video Factory OS - Engine Runner (Phase 3: Real Providers)
 * 
 * Manifest-first execution com Real Providers:
 * - Claude para steps LLM
 * - Azure TTS para steps TTS
 * - Validators reais
 * - Artifact storage
 */

import { getDb, schema } from "@/lib/db";
import { eq, inArray } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import crypto from "crypto";
import { getStepKind, StepKind } from "./capabilities";
import { getEffectiveConfig } from "@/app/admin/execution-map/actions";
import {
    executeLLM,
    executeTTS,
    executeValidators,
    getArtifactPath,
    ensureArtifactDir,
    type ProviderConfig,
    type PromptConfig,
    type ValidatorConfig,
    type ValidationResult,
} from "./providers";
import { renderVideo, VideoPreset } from "./ffmpeg";
import { getPreviousOutputKey, normalizeStepKey, getStepExecutorType } from "./step-mapper";
import { exportJob } from "./export";

type JobStatus = "pending" | "running" | "completed" | "failed" | "cancelled";
type StepStatus = "pending" | "running" | "success" | "failed" | "skipped";

interface LogEntry {
    timestamp: string;
    level: "info" | "warn" | "error" | "debug";
    message: string;
    stepKey?: string;
    meta?: Record<string, unknown>;
}

interface StepDefinition {
    key: string;
    name: string;
    kind?: StepKind;
    required: boolean;
}

interface ResolvedConfig {
    prompt?: {
        id: string;
        name: string;
        source: string;
        // Expanded fields for visibility
        model?: string;
        maxTokens?: number;
        temperature?: number;
        systemPromptPreview?: string; // First 300 chars
        systemPromptHash?: string; // SHA256 hash for change detection
    };
    provider?: {
        id: string;
        name: string;
        source: string;
        // Expanded fields for visibility
        type?: string;
        defaultModel?: string;
        // Note: NO apiKey or secrets here
    };
    preset_voice?: {
        id: string;
        name: string;
        source: string;
        // Expanded fields
        voiceName?: string;
        outputFormat?: string;
        speakingRate?: number;
    };
    preset_ssml?: {
        id: string;
        name: string;
        source: string;
        // Expanded fields
        pauseMappings?: Record<string, number>;
    };
    preset_video?: {
        id: string;
        name: string;
        source: string;
        // Expanded fields
        encoder?: string;
        scale?: string;
        fps?: number;
        bitrate?: string;
    };
    validators?: {
        items: Array<{
            id: string;
            name: string;
            type?: string;
            config?: Record<string, unknown>;
        }>;
        source: string;
    };
    kb?: {
        items: Array<{
            id: string;
            name: string;
            tier?: string;
            contentPreview?: string; // First 200 chars
            contentHash?: string;
        }>;
        source: string;
    };
}

interface StepManifest {
    key: string;
    kind: StepKind;
    status: string;
    config: ResolvedConfig;
    started_at: string;
    completed_at?: string;
    duration_ms?: number;
    request?: {
        prompt_id?: string;
        prompt_version?: number;
        provider_id?: string;
        model?: string;
        max_tokens?: number;
        temperature?: number;
    };
    response?: {
        output?: unknown;
        usage?: { inputTokens: number; outputTokens: number };
    };
    artifacts?: Array<{
        uri: string;
        content_type: string;
        size_bytes?: number;
        duration_sec?: number;
    }>;
    validations?: ValidationResult[];
    error?: {
        code: string;
        message: string;
        // Diagnostic fields for UI debugging
        statusCode?: number;
        provider?: string;
        payloadSizeBytes?: number;
        stack?: string;
    };
}

// ============================================
// MANIFEST HELPERS
// ============================================

function generateInputHash(input: Record<string, unknown>): string {
    return crypto.createHash("sha256").update(JSON.stringify(input)).digest("hex").slice(0, 16);
}

function createInitialManifest(
    job: typeof schema.jobs.$inferSelect,
    recipe: typeof schema.recipes.$inferSelect,
    projectId?: string | null
) {
    return {
        version: "3.0.0",
        job_id: job.id,
        project_id: projectId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        input: JSON.parse(job.input),
        snapshots: {
            recipe: {
                id: recipe.id,
                slug: recipe.slug,
                version: recipe.version,
            },
            config_by_step: {} as Record<string, ResolvedConfig>,
        },
        steps: [] as StepManifest[],
        artifacts: [] as Array<{ step_key: string; uri: string; content_type: string }>,
        output: null as unknown,
        metrics: {
            total_duration_ms: 0,
            step_count: 0,
            llm_tokens_used: 0,
            tts_duration_sec: 0,
        },
    };
}

// ============================================
// DATABASE LOADERS
// ============================================

async function loadPrompt(promptId: string): Promise<PromptConfig | null> {
    const db = getDb();
    const [prompt] = await db.select().from(schema.prompts).where(eq(schema.prompts.id, promptId));
    if (!prompt) return null;

    return {
        id: prompt.id,
        name: prompt.name,
        version: prompt.version,
        systemPrompt: prompt.systemPrompt || "",
        userTemplate: prompt.userTemplate || "",
        model: prompt.model,
        maxTokens: prompt.maxTokens,
        temperature: prompt.temperature,
    };
}

async function loadProvider(providerId: string): Promise<ProviderConfig | null> {
    const db = getDb();
    const [provider] = await db.select().from(schema.providers).where(eq(schema.providers.id, providerId));
    if (!provider) return null;

    return {
        id: provider.id,
        slug: provider.slug,
        name: provider.name,
        type: provider.type,
        baseUrl: provider.baseUrl || undefined,
        defaultModel: provider.defaultModel || undefined,
        config: JSON.parse(provider.config || "{}"),
    };
}

async function loadVoicePreset(presetId: string) {
    const db = getDb();
    const [preset] = await db.select().from(schema.presetsVoice).where(eq(schema.presetsVoice.id, presetId));
    return preset;
}

async function loadSsmlPreset(presetId: string) {
    const db = getDb();
    const [preset] = await db.select().from(schema.presetsSsml).where(eq(schema.presetsSsml.id, presetId));
    return preset;
}

async function loadVideoPreset(presetId: string): Promise<VideoPreset | null> {
    const db = getDb();
    const [preset] = await db.select().from(schema.presetsVideo).where(eq(schema.presetsVideo.id, presetId));

    if (!preset) return null;

    return {
        encoder: preset.encoder,
        scale: preset.scale,
        fps: preset.fps,
        bitrate: preset.bitrate,
        pixelFormat: preset.pixelFormat,
        audioCodec: preset.audioCodec,
        audioBitrate: preset.audioBitrate,
    };
}

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

async function loadValidators(validatorIds: string[]): Promise<ValidatorConfig[]> {
    if (validatorIds.length === 0) return [];
    const db = getDb();
    const validators = await db.select().from(schema.validators).where(inArray(schema.validators.id, validatorIds));

    return validators.map(v => ({
        id: v.id,
        name: v.name,
        type: v.type,
        config: JSON.parse(v.config || "{}"),
        errorMessage: v.errorMessage,
    }));
}

async function loadKnowledgeBase(kbIds: string[]): Promise<string> {
    if (kbIds.length === 0) return "";
    const db = getDb();
    const kbs = await db.select().from(schema.knowledgeBase).where(inArray(schema.knowledgeBase.id, kbIds));

    return kbs.map(kb => `[${kb.name}]\n${kb.content}`).join("\n\n---\n\n");
}

// ============================================
// STEP EXECUTORS (Real Providers)
// ============================================

async function executeStepLLM(
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
        message: `Step LLM: ${stepDef.name}`,
        stepKey: stepDef.key,
        meta: { prompt_id: stepConfig.prompt?.id, provider_id: stepConfig.provider?.id }
    });

    // Load prompt
    if (!stepConfig.prompt?.id) {
        stepManifest.status = "failed";
        stepManifest.completed_at = now();
        stepManifest.error = { code: "NO_PROMPT", message: "Nenhum prompt configurado para este step" };
        logs.push({ timestamp: now(), level: "error", message: "Nenhum prompt configurado", stepKey: stepDef.key });
        return stepManifest;
    }

    const prompt = await loadPrompt(stepConfig.prompt.id);
    if (!prompt) {
        stepManifest.status = "failed";
        stepManifest.completed_at = now();
        stepManifest.error = { code: "PROMPT_NOT_FOUND", message: "Prompt não encontrado" };
        return stepManifest;
    }

    // Load provider
    const provider = stepConfig.provider?.id ? await loadProvider(stepConfig.provider.id) : null;
    if (!provider) {
        stepManifest.status = "failed";
        stepManifest.completed_at = now();
        stepManifest.error = { code: "PROVIDER_NOT_FOUND", message: "Provider não encontrado" };
        return stepManifest;
    }

    // Load KB context
    const kbIds = stepConfig.kb?.items?.map(k => k.id) || [];
    const kbContext = await loadKnowledgeBase(kbIds);

    // Load validators
    const validatorIds = stepConfig.validators?.items?.map(v => v.id) || [];
    const validators = await loadValidators(validatorIds);

    // Build variables with aliasing for pt/es compatibility
    // Flatten previousOutputs: extract actual output strings from step results
    const flattenedOutputs: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(previousOutputs)) {
        if (typeof value === "string") {
            flattenedOutputs[key] = value;
        } else if (value && typeof value === "object" && "output" in value) {
            flattenedOutputs[key] = (value as { output: unknown }).output;
        } else if (value && typeof value === "object") {
            // Try common output field names
            const obj = value as Record<string, unknown>;
            flattenedOutputs[key] = obj.output || obj.text || obj.script || obj.ssml || JSON.stringify(value);
        }
    }

    // Apply aliases for pt/es variable names (input base takes precedence over aliases)
    const inputAliases: Record<string, unknown> = {
        // titulo = input.titulo || input.title (Portuguese/Spanish)
        titulo: input.titulo || input.title,
        // idea = input.idea || input.brief
        idea: input.idea || input.brief,
        // duracao = input.duracao || input.duration || "40" (default 40 min)
        duracao: input.duracao || input.duration || "40",
    };

    // Build final variables: input base → aliases → flattened outputs (input takes precedence)
    const variables = {
        ...inputAliases,
        ...flattenedOutputs,
        ...input, // Input overrides everything if explicitly provided
    };

    // Record request metadata
    stepManifest.request = {
        prompt_id: prompt.id,
        prompt_version: prompt.version,
        provider_id: provider.id,
        model: prompt.model,
        max_tokens: prompt.maxTokens,
        temperature: prompt.temperature,
    };

    logs.push({
        timestamp: now(),
        level: "info",
        message: `Chamando Claude: model=${prompt.model}, max_tokens=${prompt.maxTokens}`,
        stepKey: stepDef.key,
        meta: { model: prompt.model }
    });

    // Execute LLM
    const llmResult = await executeLLM({
        provider,
        prompt,
        variables,
        kbContext: kbContext || undefined,
    });

    if (!llmResult.success) {
        stepManifest.status = "failed";
        stepManifest.completed_at = now();
        stepManifest.duration_ms = llmResult.duration_ms;
        stepManifest.error = llmResult.error;

        // Build detailed error message for logs and UI
        const errorDetails = [
            `LLM falhou: ${llmResult.error?.message}`,
            llmResult.error?.code ? `Code: ${llmResult.error.code}` : null,
            llmResult.error?.statusCode ? `HTTP: ${llmResult.error.statusCode}` : null,
            llmResult.error?.provider ? `Provider: ${llmResult.error.provider}` : null,
            llmResult.error?.payloadSizeBytes ? `Payload: ${Math.round(llmResult.error.payloadSizeBytes / 1024)}KB` : null,
            `Model: ${llmResult.model}`,
        ].filter(Boolean).join(" | ");

        logs.push({
            timestamp: now(),
            level: "error",
            message: errorDetails,
            stepKey: stepDef.key,
            meta: {
                code: llmResult.error?.code,
                statusCode: llmResult.error?.statusCode,
                provider: llmResult.error?.provider,
                payloadSizeBytes: llmResult.error?.payloadSizeBytes,
                stack: llmResult.error?.stack,
            }
        });
        return stepManifest;
    }

    logs.push({
        timestamp: now(),
        level: "info",
        message: `Claude respondeu: ${llmResult.usage?.outputTokens} tokens em ${llmResult.duration_ms}ms`,
        stepKey: stepDef.key
    });

    // Run validators
    if (validators.length > 0 && llmResult.output) {
        const validationResults = executeValidators(llmResult.output, validators);
        stepManifest.validations = validationResults;

        const failed = validationResults.filter(v => !v.passed);
        if (failed.length > 0) {
            stepManifest.status = "failed";
            stepManifest.completed_at = now();
            stepManifest.duration_ms = llmResult.duration_ms;
            stepManifest.error = {
                code: "VALIDATION_FAILED",
                message: failed[0].errorMessage || "Validação falhou"
            };
            logs.push({
                timestamp: now(),
                level: "error",
                message: `Validação falhou: ${failed[0].errorMessage}`,
                stepKey: stepDef.key
            });
            return stepManifest;
        }

        logs.push({
            timestamp: now(),
            level: "info",
            message: `${validators.length} validadores passaram`,
            stepKey: stepDef.key
        });
    }

    // Save artifact (output text)
    const artifactDir = await ensureArtifactDir(jobId, stepDef.key);
    const fs = await import("fs/promises");
    const outputPath = `${artifactDir}/output.txt`;
    await fs.writeFile(outputPath, llmResult.output || "");

    stepManifest.artifacts = [{
        uri: outputPath,
        content_type: "text/plain",
        size_bytes: (llmResult.output || "").length,
    }];

    stepManifest.status = "success";
    stepManifest.completed_at = now();
    stepManifest.duration_ms = llmResult.duration_ms;
    stepManifest.response = {
        output: llmResult.output,
        usage: llmResult.usage,
    };

    return stepManifest;
}

async function executeStepTTS(
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
    const scriptOutput = previousOutputs.script;
    const ssmlOutput = previousOutputs.parse_ssml;

    let textInput = "";

    // Try script output (string or object)
    if (typeof scriptOutput === "string" && scriptOutput.length > 0) {
        textInput = scriptOutput;
    } else if (scriptOutput && typeof scriptOutput === "object") {
        textInput = (scriptOutput as { script?: string; output?: string }).script
            || (scriptOutput as { script?: string; output?: string }).output
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
        textInput = String(input.text || input.script || "");
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

async function executeStepTransform(
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

    logs.push({ timestamp: now(), level: "info", message: `Step Transform: ${stepDef.name}`, stepKey: stepDef.key });

    // Get script from previousOutputs (roteiro or script)
    // Uses getPreviousOutputKey for PT-BR/EN alias support
    let rawScript = "";
    const scriptOutput = getPreviousOutputKey(previousOutputs, 'roteiro') ||
        previousOutputs.roteiro ||
        previousOutputs.script;
    if (typeof scriptOutput === "string") {
        rawScript = scriptOutput;
    } else if (scriptOutput && typeof scriptOutput === "object" && "output" in scriptOutput) {
        rawScript = String((scriptOutput as Record<string, unknown>).output || "");
    }

    if (!rawScript) {
        logs.push({ timestamp: now(), level: "error", message: "No script found in previousOutputs (checked roteiro and script)", stepKey: stepDef.key });
        return {
            key: stepDef.key,
            kind,
            status: "failed",
            config: stepConfig,
            started_at: startedAt,
            completed_at: now(),
            duration_ms: 0,
            response: { output: null },
            error: { code: "MISSING_SCRIPT", message: "Roteiro não encontrado nos outputs anteriores" },
        };
    }

    // =============================================
    // CLEAN SCRIPT (mirroring n8n Parse Guión logic)
    // =============================================
    let cleanScript = rawScript
        // Remove voice tags: (voz: NARRADORA), (voz: ANTAGONISTA), (voz: OTRO), etc.
        .replace(/\(voz:\s*[^)]+\)/gi, "")
        // Remove pause markers: [PAUSA], [PAUSA CORTA], [PAUSA LARGA]
        .replace(/\[PAUSA[^\]]*\]/gi, "")
        // Remove Markdown headers: # ## ### 
        .replace(/^#{1,6}\s+/gm, "")
        // Remove bold/italic: ** __ * _
        .replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1")
        .replace(/_{1,2}([^_]+)_{1,2}/g, "$1")
        // Remove SSML tags (voice, break, speak, prosody)
        .replace(/<voice[^>]*>/gi, "")
        .replace(/<\/voice>/gi, "")
        .replace(/<break[^>]*\/?>/gi, "")
        .replace(/<speak[^>]*>/gi, "")
        .replace(/<\/speak>/gi, "")
        .replace(/<prosody[^>]*>/gi, "")
        .replace(/<\/prosody>/gi, "")
        // Remove any remaining XML tags
        .replace(/<[^>]+>/g, "")
        // Clean special characters
        .replace(/&/g, " y ")
        .replace(/</g, "")
        .replace(/>/g, "")
        // Clean whitespace
        .replace(/[ \t]+$/gm, "")
        .replace(/ {2,}/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    const wordCount = cleanScript.split(/\s+/).filter(w => w.length > 0).length;
    logs.push({
        timestamp: now(),
        level: "info",
        message: `Cleaned script: ${wordCount} words, ${cleanScript.length} chars`,
        stepKey: stepDef.key
    });

    // Save cleaned script as artifact
    const artifactDir = await ensureArtifactDir(jobId, stepDef.key);
    const outputPath = `${artifactDir}/output.txt`;
    const fs = await import("fs/promises");
    await fs.writeFile(outputPath, cleanScript, "utf-8");

    return {
        key: stepDef.key,
        kind,
        status: "success",
        config: stepConfig,
        started_at: startedAt,
        completed_at: now(),
        duration_ms: Date.now() - new Date(startedAt).getTime(),
        artifacts: [{ uri: outputPath, content_type: "text/plain" }],
        response: { output: cleanScript },
    };
}

async function executeStepRender(
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
    const videoPresetId = stepConfig.preset_video?.id;
    const loadedPreset = videoPresetId ? await loadVideoPreset(videoPresetId) : null;
    const preset: VideoPreset = loadedPreset || DEFAULT_VIDEO_PRESET;

    logs.push({
        timestamp: now(),
        level: "info",
        message: `Renderizando vídeo: encoder=${preset.encoder}, scale=${preset.scale}${loadedPreset ? ' (from DB)' : ' (fallback)'}`,
        stepKey: stepDef.key
    });

    // Execute FFmpeg render
    const renderResult = await renderVideo({
        audioPath,
        outputPath,
        preset,
    });

    if (!renderResult.success) {
        logs.push({ timestamp: now(), level: "error", message: `Render falhou: ${renderResult.error?.message}`, stepKey: stepDef.key });
        return {
            key: stepDef.key,
            kind,
            status: "failed",
            config: stepConfig,
            started_at: startedAt,
            completed_at: now(),
            error: renderResult.error,
        };
    }

    logs.push({
        timestamp: now(),
        level: "info",
        message: `Vídeo renderizado: ${Math.round((renderResult.fileSizeBytes || 0) / 1024 / 1024)}MB, ${Math.round(renderResult.durationSec || 0)}s`,
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
            uri: outputPath,
            content_type: "video/mp4",
            size_bytes: renderResult.fileSizeBytes,
            duration_sec: renderResult.durationSec,
        }],
        response: { output: { videoPath: outputPath, durationSec: renderResult.durationSec } },
    };
}

async function executeStepExport(
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

    logs.push({ timestamp: now(), level: "info", message: `Step Export: ${stepDef.name}`, stepKey: stepDef.key });

    // Get artifacts directory
    const baseArtifactPath = getArtifactPath(jobId, stepDef.key, '');

    // Execute export
    const exportResult = await exportJob({
        jobId,
        artifactsDir: baseArtifactPath,
        previousOutputs,
        manifest: {}, // Will be populated by caller
    });

    if (!exportResult.success) {
        logs.push({ timestamp: now(), level: "error", message: `Export falhou: ${exportResult.error?.message}`, stepKey: stepDef.key });
        return {
            key: stepDef.key,
            kind,
            status: "failed",
            config: stepConfig,
            started_at: startedAt,
            completed_at: now(),
            error: exportResult.error,
        };
    }

    logs.push({
        timestamp: now(),
        level: "info",
        message: `Export concluído: ${Math.round((exportResult.totalSizeBytes || 0) / 1024 / 1024)}MB total`,
        stepKey: stepDef.key
    });

    const artifacts = [];
    if (exportResult.manifestPath) {
        artifacts.push({ uri: exportResult.manifestPath, content_type: "application/json" });
    }
    if (exportResult.thumbnailPath) {
        artifacts.push({ uri: exportResult.thumbnailPath, content_type: "image/jpeg" });
    }

    return {
        key: stepDef.key,
        kind,
        status: "success",
        config: stepConfig,
        started_at: startedAt,
        completed_at: now(),
        duration_ms: Date.now() - new Date(startedAt).getTime(),
        artifacts,
        response: {
            output: {
                exported: true,
                exportPath: exportResult.exportPath,
                thumbnailPath: exportResult.thumbnailPath,
                manifestPath: exportResult.manifestPath,
            }
        },
    };
}

// ============================================
// MAIN RUNNER (Phase 3)
// ============================================

export async function runJob(jobId: string): Promise<{ success: boolean; error?: string }> {
    const db = getDb();

    // 1. Load job
    const [job] = await db.select().from(schema.jobs).where(eq(schema.jobs.id, jobId));
    if (!job) return { success: false, error: "Job não encontrado" };
    if (job.status === "running") return { success: false, error: "Job já está em execução" };
    if (job.status === "completed") return { success: false, error: "Job já foi concluído" };

    // 2. Load recipe
    const [recipe] = await db.select().from(schema.recipes).where(eq(schema.recipes.id, job.recipeId));
    if (!recipe) return { success: false, error: "Recipe não encontrada" };

    const pipeline: StepDefinition[] = JSON.parse(recipe.pipeline || "[]");
    if (pipeline.length === 0) return { success: false, error: "Pipeline vazia" };

    // 3. Update job status to running
    const startedAt = new Date().toISOString();
    await db.update(schema.jobs).set({
        status: "running",
        startedAt,
        updatedAt: startedAt,
        currentStep: pipeline[0].key,
        progress: 0,
    }).where(eq(schema.jobs.id, jobId));

    // 4. Create initial manifest with project context
    const manifest = createInitialManifest(job, recipe, job.projectId);

    // 5. Resolve effective config for ALL steps upfront (snapshot)
    for (const stepDef of pipeline) {
        const config = await getEffectiveConfig(job.recipeId, stepDef.key, job.projectId || undefined);
        manifest.snapshots.config_by_step[stepDef.key] = config as ResolvedConfig;
    }

    // 6. Create job steps (only if they don't exist - prevents duplicates on retry)
    const input = JSON.parse(job.input);
    const existingSteps = await db.select().from(schema.jobSteps)
        .where(eq(schema.jobSteps.jobId, jobId));
    const existingStepKeys = new Set(existingSteps.map(s => s.stepKey));

    for (let i = 0; i < pipeline.length; i++) {
        const stepDef = pipeline[i];

        // Skip if step already exists
        if (existingStepKeys.has(stepDef.key)) {
            continue;
        }

        await db.insert(schema.jobSteps).values({
            id: uuid(),
            jobId,
            stepKey: stepDef.key,
            stepOrder: i,
            inputHash: generateInputHash({ ...input, stepKey: stepDef.key }),
            status: "pending",
            attempts: 0,
        });
    }

    // 7. Execute steps sequentially
    const allLogs: LogEntry[] = [];
    const previousOutputs: Record<string, unknown> = {};
    let lastError: string | null = null;
    let jobFailed = false;

    for (let i = 0; i < pipeline.length; i++) {
        if (jobFailed) break;

        const stepDef = pipeline[i];
        const kind = stepDef.kind || getStepKind(stepDef.key);
        const stepConfig = manifest.snapshots.config_by_step[stepDef.key] || {};
        const progress = Math.round(((i + 1) / pipeline.length) * 100);

        // Get step record
        const steps = await db.select().from(schema.jobSteps)
            .where(eq(schema.jobSteps.jobId, jobId));
        const step = steps.find(s => s.stepKey === stepDef.key);
        if (!step) continue;

        // Check if cancelled
        const [currentJob] = await db.select().from(schema.jobs).where(eq(schema.jobs.id, jobId));
        if (currentJob?.status === "cancelled") {
            break;
        }

        // Update step to running
        const stepStartedAt = new Date().toISOString();
        await db.update(schema.jobSteps).set({
            status: "running",
            startedAt: stepStartedAt,
            attempts: (step.attempts || 0) + 1,
        }).where(eq(schema.jobSteps.id, step.id));

        // Update job current step
        await db.update(schema.jobs).set({
            currentStep: stepDef.key,
            progress,
            updatedAt: new Date().toISOString(),
        }).where(eq(schema.jobs.id, jobId));

        // Execute based on kind
        let stepManifest: StepManifest;

        switch (kind) {
            case "llm":
                stepManifest = await executeStepLLM(stepDef, stepConfig, input, previousOutputs, allLogs, jobId);
                break;
            case "tts":
                stepManifest = await executeStepTTS(stepDef, stepConfig, input, previousOutputs, allLogs, jobId);
                break;
            case "transform":
                stepManifest = await executeStepTransform(stepDef, stepConfig, input, previousOutputs, allLogs, jobId);
                break;
            case "render":
                stepManifest = await executeStepRender(stepDef, stepConfig, input, previousOutputs, allLogs, jobId);
                break;
            case "export":
                stepManifest = await executeStepExport(stepDef, stepConfig, input, previousOutputs, allLogs, jobId);
                break;
            default:
                stepManifest = await executeStepTransform(stepDef, stepConfig, input, previousOutputs, allLogs, jobId);
        }

        // Update step record
        const stepCompletedAt = new Date().toISOString();
        const durationMs = stepManifest.duration_ms || 0;

        if (stepManifest.status === "success") {
            previousOutputs[stepDef.key] = stepManifest.response?.output;

            await db.update(schema.jobSteps).set({
                status: "success",
                completedAt: stepCompletedAt,
                durationMs,
                outputRefs: JSON.stringify(stepManifest.response?.output || {}),
                logs: JSON.stringify(allLogs.filter(l => l.stepKey === stepDef.key)),
            }).where(eq(schema.jobSteps.id, step.id));

            // Add artifacts to manifest
            if (stepManifest.artifacts) {
                for (const artifact of stepManifest.artifacts) {
                    manifest.artifacts.push({
                        step_key: stepDef.key,
                        uri: artifact.uri,
                        content_type: artifact.content_type,
                    });
                }
            }

            // Update metrics
            if (stepManifest.response?.usage) {
                manifest.metrics.llm_tokens_used += (stepManifest.response.usage.inputTokens || 0) + (stepManifest.response.usage.outputTokens || 0);
            }

        } else {
            lastError = stepManifest.error?.message || "Step falhou";
            jobFailed = true;
            await db.update(schema.jobSteps).set({
                status: "failed",
                completedAt: stepCompletedAt,
                durationMs,
                lastError,
                logs: JSON.stringify(allLogs.filter(l => l.stepKey === stepDef.key)),
            }).where(eq(schema.jobSteps.id, step.id));
        }

        manifest.steps.push(stepManifest);
    }

    // 8. Finalize job
    const completedAt = new Date().toISOString();
    manifest.updated_at = completedAt;
    manifest.metrics.total_duration_ms = new Date(completedAt).getTime() - new Date(startedAt).getTime();
    manifest.metrics.step_count = manifest.steps.length;

    const [finalJob] = await db.select().from(schema.jobs).where(eq(schema.jobs.id, jobId));
    const finalStatus = finalJob?.status === "cancelled" ? "cancelled" : (jobFailed ? "failed" : "completed");

    await db.update(schema.jobs).set({
        status: finalStatus,
        completedAt,
        updatedAt: completedAt,
        manifest: JSON.stringify(manifest),
        progress: 100,
        lastError,
    }).where(eq(schema.jobs.id, jobId));

    return { success: !jobFailed };
}

export async function retryJobStep(jobId: string, stepKey: string): Promise<{ success: boolean; error?: string }> {
    const db = getDb();

    // Reset step to pending
    const steps = await db.select().from(schema.jobSteps).where(eq(schema.jobSteps.jobId, jobId));
    const step = steps.find(s => s.stepKey === stepKey);
    if (!step) return { success: false, error: "Step não encontrado" };

    await db.update(schema.jobSteps).set({
        status: "pending",
        lastError: null,
    }).where(eq(schema.jobSteps.id, step.id));

    // Reset job status
    await db.update(schema.jobs).set({
        status: "pending",
        lastError: null,
        updatedAt: new Date().toISOString(),
    }).where(eq(schema.jobs.id, jobId));

    return { success: true };
}

export async function cancelJob(jobId: string): Promise<{ success: boolean; error?: string }> {
    const db = getDb();

    await db.update(schema.jobs).set({
        status: "cancelled",
        updatedAt: new Date().toISOString(),
    }).where(eq(schema.jobs.id, jobId));

    return { success: true };
}

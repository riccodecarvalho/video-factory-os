"use server";

/**
 * Wizard Runner - Step-by-step execution with user control
 * 
 * This is the complete implementation with real LLM/TTS execution.
 * Difference from runner.ts:
 * - runJob() executes ALL steps automatically
 * - Wizard runs ONE step at a time, waits for user approval
 */

import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { getStepKind } from "./capabilities";
import { getEffectiveConfig } from "@/app/admin/execution-map/actions";
import { revalidatePath } from "next/cache";
import {
    executeLLM,
    executeTTS,
    getArtifactPath,
    ensureArtifactDir,
    type ProviderConfig,
    type PromptConfig,
    type TTSRequest,
} from "./providers";
import { renderVideo, type RenderOptions, type VideoPreset } from "./ffmpeg";
import { exportJob, type ExportOptions } from "./export";
import fs from "fs/promises";

type WizardStepResult = {
    success: boolean;
    stepKey: string;
    output?: string;
    options?: string[];
    error?: string;
    nextStep?: string | null;
    isComplete?: boolean;
};

// ============================================
// HELPER FUNCTIONS
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
        userTemplate: prompt.userTemplate,
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

async function loadKnowledgeBase(kbIds: string[]): Promise<string> {
    if (kbIds.length === 0) return "";
    const db = getDb();
    const kbs = await db.select().from(schema.knowledgeBase);
    return kbs
        .filter(kb => kbIds.includes(kb.id))
        .map(kb => `## ${kb.name}\n${kb.content}`)
        .join("\n\n");
}

async function loadPresetVoice(presetId: string) {
    const db = getDb();
    const [preset] = await db.select().from(schema.presets).where(eq(schema.presets.id, presetId));
    if (!preset) return null;
    return {
        ...preset,
        config: JSON.parse(preset.config || "{}"),
    };
}

async function getPreviousOutputs(jobId: string): Promise<Record<string, unknown>> {
    const db = getDb();
    const steps = await db.select().from(schema.jobSteps).where(eq(schema.jobSteps.jobId, jobId));

    const outputs: Record<string, unknown> = {};
    for (const step of steps) {
        if (step.status === "success" && step.outputRefs) {
            try {
                const refs = JSON.parse(step.outputRefs);
                outputs[step.stepKey] = refs.output || refs;
            } catch { /* ignore */ }
        }
    }
    return outputs;
}

// ============================================
// WIZARD JOB CREATION
// ============================================

export async function createWizardJob(
    recipeId: string,
    projectId: string,
    input: Record<string, unknown>
): Promise<{ jobId: string; firstStep: string }> {
    const db = getDb();

    const [recipe] = await db.select().from(schema.recipes).where(eq(schema.recipes.id, recipeId));
    if (!recipe) throw new Error("Recipe não encontrada");

    const pipeline = JSON.parse(recipe.pipeline || "[]");
    if (pipeline.length === 0) throw new Error("Pipeline vazia");

    const jobId = uuid();
    await db.insert(schema.jobs).values({
        id: jobId,
        projectId,
        recipeId: recipe.id,
        recipeSlug: recipe.slug,
        recipeVersion: recipe.version,
        input: JSON.stringify(input),
        status: "pending",
        executionMode: "wizard",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });

    for (let i = 0; i < pipeline.length; i++) {
        const stepDef = pipeline[i];
        await db.insert(schema.jobSteps).values({
            id: uuid(),
            jobId,
            stepKey: stepDef.key,
            stepOrder: i,
            inputHash: `wizard-${jobId}-${stepDef.key}`,
            status: "pending",
            attempts: 0,
        });
    }

    revalidatePath("/wizard");
    return { jobId, firstStep: pipeline[0].key };
}

// ============================================
// WIZARD STEP EXECUTION
// ============================================

export async function runWizardStep(
    jobId: string,
    stepKey: string
): Promise<WizardStepResult> {
    const db = getDb();

    const [job] = await db.select().from(schema.jobs).where(eq(schema.jobs.id, jobId));
    if (!job) return { success: false, stepKey, error: "Job não encontrado" };

    const [recipe] = await db.select().from(schema.recipes).where(eq(schema.recipes.id, job.recipeId));
    if (!recipe) return { success: false, stepKey, error: "Recipe não encontrada" };

    const pipeline = JSON.parse(recipe.pipeline || "[]");
    const stepIndex = pipeline.findIndex((s: { key: string }) => s.key === stepKey);
    if (stepIndex === -1) return { success: false, stepKey, error: "Step não encontrado" };

    const stepDef = pipeline[stepIndex];
    const kind = stepDef.kind || getStepKind(stepDef.key);

    const steps = await db.select().from(schema.jobSteps).where(eq(schema.jobSteps.jobId, jobId));
    const step = steps.find(s => s.stepKey === stepKey);
    if (!step) return { success: false, stepKey, error: "Step record não encontrado" };

    await db.update(schema.jobs).set({
        status: "running",
        currentStep: stepKey,
        updatedAt: new Date().toISOString(),
    }).where(eq(schema.jobs.id, jobId));

    await db.update(schema.jobSteps).set({
        status: "running",
        startedAt: new Date().toISOString(),
        attempts: (step.attempts || 0) + 1,
    }).where(eq(schema.jobSteps.id, step.id));

    const config = await getEffectiveConfig(job.recipeId, stepKey, job.projectId || undefined);
    const input = JSON.parse(job.input || "{}");
    const previousOutputs = await getPreviousOutputs(jobId);

    try {
        let result: WizardStepResult;

        switch (kind) {
            case "llm":
                result = await executeLLMStep(jobId, stepDef, config, input, previousOutputs, step.id);
                break;
            case "tts":
                result = await executeTTSStep(jobId, stepDef, config, previousOutputs, step.id);
                break;
            case "render":
                result = await executeRenderStep(jobId, stepDef, config, previousOutputs, step.id);
                break;
            case "export":
                result = await executeExportStep(jobId, previousOutputs, step.id);
                break;
            default:
                result = { success: false, stepKey, error: `Unknown step kind: ${kind}` };
        }

        result.nextStep = stepIndex < pipeline.length - 1 ? pipeline[stepIndex + 1].key : null;
        result.isComplete = !result.nextStep;

        return result;
    } catch (error) {
        await db.update(schema.jobSteps).set({
            status: "failed",
            lastError: String(error),
            completedAt: new Date().toISOString(),
        }).where(eq(schema.jobSteps.id, step.id));

        return { success: false, stepKey, error: String(error) };
    }
}

// ============================================
// STEP EXECUTORS
// ============================================

async function executeLLMStep(
    jobId: string,
    stepDef: { key: string },
    config: Record<string, unknown>,
    input: Record<string, unknown>,
    previousOutputs: Record<string, unknown>,
    stepId: string
): Promise<WizardStepResult> {
    const db = getDb();
    const stepKey = stepDef.key;

    const promptConfig = config.prompt as { id?: string } | undefined;
    const providerConfig = config.provider as { id?: string } | undefined;

    if (!promptConfig?.id) return { success: false, stepKey, error: "Prompt não configurado" };
    if (!providerConfig?.id) return { success: false, stepKey, error: "Provider não configurado" };

    const prompt = await loadPrompt(promptConfig.id);
    const provider = await loadProvider(providerConfig.id);

    if (!prompt) return { success: false, stepKey, error: "Prompt não encontrado" };
    if (!provider) return { success: false, stepKey, error: "Provider não encontrado" };

    const kbConfig = config.kb as { items?: Array<{ id: string }> } | undefined;
    const kbIds = kbConfig?.items?.map(k => k.id) || [];
    const kbContext = await loadKnowledgeBase(kbIds);

    // Flatten previous outputs
    const flattenedOutputs: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(previousOutputs)) {
        if (typeof value === "string") {
            flattenedOutputs[key] = value;
        } else if (value && typeof value === "object" && "output" in value) {
            flattenedOutputs[key] = (value as { output: unknown }).output;
        }
    }

    const variables = {
        ...flattenedOutputs,
        ...input,
        titulo: input.titulo || input.title,
        tema: input.tema || input.theme,
        duracao: input.duracao || input.duration || "40",
    };

    const llmResult = await executeLLM({
        provider,
        prompt,
        variables,
        kbContext: kbContext || undefined,
    });

    if (!llmResult.success) {
        await db.update(schema.jobSteps).set({
            status: "failed",
            lastError: llmResult.error?.message,
            completedAt: new Date().toISOString(),
        }).where(eq(schema.jobSteps.id, stepId));

        return { success: false, stepKey, error: llmResult.error?.message };
    }

    await ensureArtifactDir(jobId, stepKey);
    const artifactPath = getArtifactPath(jobId, stepKey, "output.txt");
    await fs.writeFile(artifactPath, llmResult.output || "");

    await db.update(schema.jobSteps).set({
        status: "success",
        outputRefs: JSON.stringify({ output: llmResult.output }),
        completedAt: new Date().toISOString(),
        durationMs: llmResult.duration_ms,
    }).where(eq(schema.jobSteps.id, stepId));

    // For title step, parse multiple options
    let options: string[] | undefined;
    if (stepKey === "titulo" && llmResult.output) {
        options = llmResult.output.split("\n")
            .filter((l: string) => l.trim())
            .map((l: string) => l.replace(/^\d+[\.\)]\s*/, "").trim())
            .filter((l: string) => l.length > 0);
    }

    return { success: true, stepKey, output: llmResult.output, options };
}

async function executeTTSStep(
    jobId: string,
    stepDef: { key: string },
    config: Record<string, unknown>,
    previousOutputs: Record<string, unknown>,
    stepId: string
): Promise<WizardStepResult> {
    const db = getDb();
    const stepKey = stepDef.key;

    // Get text from roteiro
    const roteiroOutput = previousOutputs.roteiro;
    let textInput = "";

    if (typeof roteiroOutput === "string") {
        textInput = roteiroOutput;
    } else if (roteiroOutput && typeof roteiroOutput === "object") {
        textInput = (roteiroOutput as { output?: string }).output || "";
    }

    if (!textInput) return { success: false, stepKey, error: "Nenhum texto para sintetizar" };

    // Load voice preset
    const voiceConfig = config.preset_voice as { id?: string } | undefined;
    if (!voiceConfig?.id) return { success: false, stepKey, error: "Voice preset não configurado" };

    const voicePreset = await loadPresetVoice(voiceConfig.id);
    if (!voicePreset) return { success: false, stepKey, error: "Voice preset não encontrado" };

    const voiceParams = voicePreset.config as {
        voiceName?: string;
        language?: string;
        rate?: number;
        pitch?: string;
        style?: string;
        styleDegree?: number;
    };

    // Load provider (for TTS request)
    const providerConfig = config.provider as { id?: string } | undefined;
    const provider = providerConfig?.id ? await loadProvider(providerConfig.id) : null;

    if (!provider) return { success: false, stepKey, error: "TTS provider não configurado" };

    await ensureArtifactDir(jobId, stepKey);
    const audioPath = getArtifactPath(jobId, stepKey, "audio.mp3");

    const ttsRequest: TTSRequest = {
        provider,
        input: textInput,
        voicePreset: {
            id: voicePreset.id,
            voiceName: voiceParams.voiceName || "es-MX-DaliaNeural",
            language: voiceParams.language || "es-MX",
            rate: voiceParams.rate,
            pitch: voiceParams.pitch,
            style: voiceParams.style,
            styleDegree: voiceParams.styleDegree,
        },
        outputPath: audioPath,
    };

    const ttsResult = await executeTTS(ttsRequest);

    if (!ttsResult.success) {
        await db.update(schema.jobSteps).set({
            status: "failed",
            lastError: ttsResult.error?.message,
            completedAt: new Date().toISOString(),
        }).where(eq(schema.jobSteps.id, stepId));

        return { success: false, stepKey, error: ttsResult.error?.message };
    }

    await db.update(schema.jobSteps).set({
        status: "success",
        outputRefs: JSON.stringify({ audioPath }),
        completedAt: new Date().toISOString(),
        durationMs: (ttsResult.durationSec || 0) * 1000,
    }).where(eq(schema.jobSteps.id, stepId));

    return { success: true, stepKey, output: `Áudio gerado: ${audioPath}` };
}

async function executeRenderStep(
    jobId: string,
    stepDef: { key: string },
    config: Record<string, unknown>,
    previousOutputs: Record<string, unknown>,
    stepId: string
): Promise<WizardStepResult> {
    const db = getDb();
    const stepKey = stepDef.key;

    // Get audio from TTS
    const ttsOutput = previousOutputs.tts as { audioPath?: string } | undefined;
    const audioPath = ttsOutput?.audioPath;

    if (!audioPath) return { success: false, stepKey, error: "Nenhum áudio encontrado do TTS" };

    // Get video preset
    const videoConfig = config.preset_video as { id?: string } | undefined;
    let videoPreset: VideoPreset = {
        encoder: "libx264",
        scale: "1280:720",
        fps: 30,
        bitrate: "4M",
        pixelFormat: "yuv420p",
        audioCodec: "aac",
        audioBitrate: "192k",
    };

    if (videoConfig?.id) {
        const [preset] = await db.select().from(schema.presets).where(eq(schema.presets.id, videoConfig.id));
        if (preset) {
            const presetConfig = JSON.parse(preset.config || "{}");
            videoPreset = { ...videoPreset, ...presetConfig };
        }
    }

    await ensureArtifactDir(jobId, stepKey);
    const outputPath = getArtifactPath(jobId, stepKey, "video.mp4");

    const renderOptions: RenderOptions = {
        audioPath,
        outputPath,
        preset: videoPreset,
    };

    const renderResult = await renderVideo(renderOptions);

    if (!renderResult.success) {
        await db.update(schema.jobSteps).set({
            status: "failed",
            lastError: renderResult.error?.message,
            completedAt: new Date().toISOString(),
        }).where(eq(schema.jobSteps.id, stepId));

        return { success: false, stepKey, error: renderResult.error?.message };
    }

    await db.update(schema.jobSteps).set({
        status: "success",
        outputRefs: JSON.stringify({ videoPath: outputPath }),
        completedAt: new Date().toISOString(),
        durationMs: (renderResult.durationSec || 0) * 1000,
    }).where(eq(schema.jobSteps.id, stepId));

    return { success: true, stepKey, output: `Vídeo renderizado: ${outputPath}` };
}

async function executeExportStep(
    jobId: string,
    previousOutputs: Record<string, unknown>,
    stepId: string
): Promise<WizardStepResult> {
    const db = getDb();

    // Build export options
    const artifactsDir = `./artifacts/${jobId}`;
    const exportOptions: ExportOptions = {
        jobId,
        artifactsDir,
        previousOutputs,
        manifest: { wizard: true, exportedAt: new Date().toISOString() },
    };

    const exportResult = await exportJob(exportOptions);

    if (!exportResult.success) {
        await db.update(schema.jobSteps).set({
            status: "failed",
            lastError: exportResult.error?.message,
            completedAt: new Date().toISOString(),
        }).where(eq(schema.jobSteps.id, stepId));

        return { success: false, stepKey: "exportacao", error: exportResult.error?.message };
    }

    await db.update(schema.jobSteps).set({
        status: "success",
        outputRefs: JSON.stringify({ exportPath: exportResult.exportPath }),
        completedAt: new Date().toISOString(),
    }).where(eq(schema.jobSteps.id, stepId));

    return { success: true, stepKey: "exportacao", output: `Exportado: ${exportResult.exportPath}` };
}

// ============================================
// WIZARD ACTIONS
// ============================================

export async function regenerateWithFeedback(
    jobId: string,
    stepKey: string,
    feedback: string
): Promise<WizardStepResult> {
    const db = getDb();

    const steps = await db.select().from(schema.jobSteps).where(eq(schema.jobSteps.jobId, jobId));
    const step = steps.find(s => s.stepKey === stepKey);
    if (step) {
        await db.update(schema.jobSteps).set({
            status: "pending",
            attempts: 0,
        }).where(eq(schema.jobSteps.id, step.id));
    }

    const [job] = await db.select().from(schema.jobs).where(eq(schema.jobs.id, jobId));
    if (job) {
        const input = JSON.parse(job.input || "{}");
        input[`feedback_${stepKey}`] = feedback;
        await db.update(schema.jobs).set({
            input: JSON.stringify(input),
        }).where(eq(schema.jobs.id, jobId));
    }

    return runWizardStep(jobId, stepKey);
}

export async function approveStepAndContinue(
    jobId: string,
    stepKey: string,
    selectedOption?: string
): Promise<{ success: boolean; nextStep: string | null }> {
    const db = getDb();

    if (selectedOption) {
        const [job] = await db.select().from(schema.jobs).where(eq(schema.jobs.id, jobId));
        if (job) {
            const input = JSON.parse(job.input || "{}");
            input[`selected_${stepKey}`] = selectedOption;
            await db.update(schema.jobs).set({
                input: JSON.stringify(input),
            }).where(eq(schema.jobs.id, jobId));
        }
    }

    const [job] = await db.select().from(schema.jobs).where(eq(schema.jobs.id, jobId));
    if (!job) return { success: false, nextStep: null };

    const [recipe] = await db.select().from(schema.recipes).where(eq(schema.recipes.id, job.recipeId));
    if (!recipe) return { success: false, nextStep: null };

    const pipeline = JSON.parse(recipe.pipeline || "[]");
    const currentIndex = pipeline.findIndex((s: { key: string }) => s.key === stepKey);

    if (currentIndex < pipeline.length - 1) {
        const nextStep = pipeline[currentIndex + 1].key;

        await db.update(schema.jobs).set({
            currentStep: nextStep,
            progress: Math.round(((currentIndex + 1) / pipeline.length) * 100),
            updatedAt: new Date().toISOString(),
        }).where(eq(schema.jobs.id, jobId));

        revalidatePath("/wizard");
        return { success: true, nextStep };
    }

    await db.update(schema.jobs).set({
        status: "completed",
        progress: 100,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }).where(eq(schema.jobs.id, jobId));

    revalidatePath("/wizard");
    return { success: true, nextStep: null };
}

export async function getWizardState(jobId: string) {
    const db = getDb();

    const [job] = await db.select().from(schema.jobs).where(eq(schema.jobs.id, jobId));
    if (!job) return null;

    const steps = await db.select().from(schema.jobSteps).where(eq(schema.jobSteps.jobId, jobId));
    const [recipe] = await db.select().from(schema.recipes).where(eq(schema.recipes.id, job.recipeId));

    const outputs: Record<string, unknown> = {};
    for (const step of steps) {
        if (step.status === "success" && step.outputRefs) {
            try {
                outputs[step.stepKey] = JSON.parse(step.outputRefs);
            } catch { /* ignore */ }
        }
    }

    return {
        job,
        steps: steps.sort((a, b) => a.stepOrder - b.stepOrder),
        pipeline: JSON.parse(recipe?.pipeline || "[]"),
        currentStep: job.currentStep,
        progress: job.progress,
        outputs,
    };
}

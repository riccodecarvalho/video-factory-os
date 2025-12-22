"use server";

import { getStepKind } from "../capabilities";
import { executeLLM, executeValidators, ensureArtifactDir } from "../providers";
import { loadPrompt, loadProvider, loadKnowledgeBase, loadValidators } from "../loaders";
import { StepDefinition, ResolvedConfig, LogEntry, StepManifest } from "../types";

export async function executeStepLLM(
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
            llmResult.error?.payloadSizeBytes ? `Payload: ${Math.round(llmResult.error.payloadSizeBytes || 0 / 1024)}KB` : null,
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

    // Check for leaking placeholders (Config-First Logic Fix)
    const leakingPlaceholders = (llmResult.output || "").match(/\{\{[^}]+\}\}/g);
    if (leakingPlaceholders) {
        stepManifest.status = "failed";
        stepManifest.completed_at = now();
        stepManifest.duration_ms = llmResult.duration_ms;
        stepManifest.error = {
            code: "PLACEHOLDER_LEAK",
            message: `Output contém placeholders não preenchidos: ${leakingPlaceholders.slice(0, 3).join(", ")}${leakingPlaceholders.length > 3 ? "..." : ""}`,
            provider: provider?.name,
            stack: "Validation Check in executeStepLLM"
        };
        logs.push({
            timestamp: now(),
            level: "error",
            message: `Placeholders vazaram no output: ${leakingPlaceholders.length} encontrados`,
            stepKey: stepDef.key
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

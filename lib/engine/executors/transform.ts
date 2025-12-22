"use server";

import { getStepKind } from "../capabilities";
import { ensureArtifactDir } from "../providers";
import { getPreviousOutputKey } from "../step-mapper";
import { normalizeScriptToSingleVoice } from "@/lib/transformers/script-normalizer";
import { StepDefinition, ResolvedConfig, LogEntry, StepManifest } from "../types";

export async function executeStepTransform(
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
    // CLEAN SCRIPT (Single Voice Normalization)
    // =============================================

    // Use centralized normalizer to ensure Ximena-compatibility (Audit Fix)
    const cleanScript = normalizeScriptToSingleVoice(rawScript);

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

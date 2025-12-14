/**
 * Video Factory OS - Provider Executors
 * 
 * Real provider implementations que recebem config do DB
 * e executam chamadas reais (Claude, Azure TTS).
 */

import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

// ============================================
// TYPES
// ============================================

export interface ProviderConfig {
    id: string;
    slug: string;
    name: string;
    type: string;
    baseUrl?: string;
    defaultModel?: string;
    config: Record<string, unknown>;
}

export interface PromptConfig {
    id: string;
    name: string;
    version: number;
    systemPrompt: string;
    userTemplate: string;
    model: string;
    maxTokens: number;
    temperature: number;
}

export interface LLMRequest {
    provider: ProviderConfig;
    prompt: PromptConfig;
    variables: Record<string, unknown>;
    kbContext?: string;
}

export interface LLMResponse {
    success: boolean;
    output?: string;
    usage?: {
        inputTokens: number;
        outputTokens: number;
    };
    model: string;
    duration_ms: number;
    error?: {
        code: string;
        message: string;
        // Diagnostic fields for debugging
        statusCode?: number;
        provider?: string;
        payloadSizeBytes?: number;
        stack?: string;
    };
}

export interface TTSRequest {
    provider: ProviderConfig;
    input: string; // text or SSML
    voicePreset: {
        id: string;
        voiceName: string;
        language: string;
        rate?: number;
        pitch?: string;
        style?: string;
        styleDegree?: number;
    };
    ssmlPreset?: {
        id: string;
        pauseMapping: Record<string, number>;
    };
    outputPath: string;
}

export interface TTSResponse {
    success: boolean;
    artifactUri?: string;
    contentType?: string;
    durationSec?: number;
    fileSizeBytes?: number;
    batchJobId?: string;
    error?: {
        code: string;
        message: string;
    };
}

// ============================================
// CLAUDE PROVIDER
// ============================================

export async function executeLLM(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();

    // Get API key from env
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        return {
            success: false,
            model: request.prompt.model,
            duration_ms: Date.now() - startTime,
            error: {
                code: "MISSING_API_KEY",
                message: "ANTHROPIC_API_KEY não configurada"
            }
        };
    }

    // Build system prompt with KB context
    let systemPrompt = request.prompt.systemPrompt;
    if (request.kbContext) {
        systemPrompt += `\n\n<knowledge_base>\n${request.kbContext}\n</knowledge_base>`;
    }

    // Render user template with variables
    let userMessage = request.prompt.userTemplate;
    for (const [key, value] of Object.entries(request.variables)) {
        const placeholder = `{{${key}}}`;
        userMessage = userMessage.replace(new RegExp(placeholder, 'g'), String(value));
    }

    // Get model from prompt or provider config
    const model = request.prompt.model || request.provider.defaultModel || "claude-sonnet-4-20250514";
    const maxTokens = request.prompt.maxTokens || 4096;
    const temperature = request.prompt.temperature ?? 0.7;

    // Calculate payload size for diagnostics
    const requestBody = JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages: [
            { role: "user", content: userMessage }
        ]
    });
    const payloadSizeBytes = new TextEncoder().encode(requestBody).length;

    try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
            },
            body: requestBody,
        });

        if (!response.ok) {
            const errorText = await response.text();
            return {
                success: false,
                model,
                duration_ms: Date.now() - startTime,
                error: {
                    code: `HTTP_${response.status}`,
                    message: errorText.slice(0, 500),
                    statusCode: response.status,
                    provider: request.provider.slug,
                    payloadSizeBytes,
                }
            };
        }

        const data = await response.json();
        const outputText = data.content?.[0]?.text || "";

        return {
            success: true,
            output: outputText,
            model,
            usage: {
                inputTokens: data.usage?.input_tokens || 0,
                outputTokens: data.usage?.output_tokens || 0,
            },
            duration_ms: Date.now() - startTime,
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const errorStack = error instanceof Error ? error.stack?.slice(0, 500) : undefined;

        return {
            success: false,
            model,
            duration_ms: Date.now() - startTime,
            error: {
                code: "NETWORK_ERROR",
                message: errorMessage,
                provider: request.provider.slug,
                payloadSizeBytes,
                stack: errorStack,
            }
        };
    }
}

// ============================================
// AZURE TTS PROVIDER (Batch Synthesis)
// ============================================

export async function executeTTS(request: TTSRequest): Promise<TTSResponse> {
    const subscriptionKey = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION || "eastus2";

    if (!subscriptionKey) {
        return {
            success: false,
            error: {
                code: "MISSING_API_KEY",
                message: "AZURE_SPEECH_KEY não configurada"
            }
        };
    }

    // Generate unique job ID
    const jobId = `vfos-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Build SSML from input
    const ssml = buildSSML(request.input, request.voicePreset, request.ssmlPreset);

    try {
        // 1. Create batch synthesis job (PUT)
        const createResponse = await fetch(
            `https://${region}.api.cognitive.microsoft.com/texttospeech/batchsyntheses/${jobId}?api-version=2024-04-01`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Ocp-Apim-Subscription-Key": subscriptionKey,
                },
                body: JSON.stringify({
                    inputKind: "SSML",
                    inputs: [{ content: ssml }],
                    properties: {
                        outputFormat: "audio-48khz-192kbitrate-mono-mp3",
                        concatenateResult: true,
                        timeToLiveInHours: 24
                    }
                }),
            }
        );

        if (!createResponse.ok) {
            const errorText = await createResponse.text();
            return {
                success: false,
                error: {
                    code: `HTTP_${createResponse.status}`,
                    message: `Batch job creation failed: ${errorText.slice(0, 500)}`
                }
            };
        }

        console.log(`[TTS] Created batch job: ${jobId}`);

        // 2. Poll for completion (max 30 attempts = ~30 min)
        const maxPolls = 30;
        const pollInterval = 60000; // 60 seconds
        let resultUrl: string | null = null;

        for (let i = 0; i < maxPolls; i++) {
            await new Promise(r => setTimeout(r, pollInterval));

            const statusResponse = await fetch(
                `https://${region}.api.cognitive.microsoft.com/texttospeech/batchsyntheses/${jobId}?api-version=2024-04-01`,
                {
                    headers: {
                        "Ocp-Apim-Subscription-Key": subscriptionKey,
                    },
                }
            );

            if (!statusResponse.ok) {
                console.log(`[TTS] Poll ${i + 1}/${maxPolls} failed: HTTP ${statusResponse.status}`);
                continue;
            }

            const statusData = await statusResponse.json();
            const status = statusData.status;

            console.log(`[TTS] Poll ${i + 1}/${maxPolls}: ${status}`);

            if (status === "Succeeded") {
                resultUrl = statusData.outputs?.result;
                break;
            }

            if (status === "Failed") {
                return {
                    success: false,
                    error: {
                        code: "BATCH_FAILED",
                        message: statusData.properties?.error?.message || "Batch synthesis failed"
                    }
                };
            }

            // Continue polling if Running or NotStarted
        }

        if (!resultUrl) {
            return {
                success: false,
                error: {
                    code: "TIMEOUT",
                    message: `Batch synthesis timed out after ${maxPolls} polls`
                }
            };
        }

        // 3. Download audio file
        console.log(`[TTS] Downloading audio from: ${resultUrl}`);

        const audioResponse = await fetch(resultUrl);
        if (!audioResponse.ok) {
            return {
                success: false,
                error: {
                    code: `DOWNLOAD_${audioResponse.status}`,
                    message: "Failed to download audio file"
                }
            };
        }

        // Save audio file
        const fs = await import("fs/promises");
        const path = await import("path");

        // Ensure directory exists
        const dir = path.dirname(request.outputPath);
        await fs.mkdir(dir, { recursive: true });

        // Write file
        const arrayBuffer = await audioResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.writeFile(request.outputPath, buffer);

        // Get file stats
        const stats = await fs.stat(request.outputPath);

        // Estimate duration (rough: 192kbps = 24000 bytes/sec)
        const durationSec = Math.round(buffer.length / 24000);

        console.log(`[TTS] Audio saved: ${request.outputPath} (${stats.size} bytes, ~${durationSec}s)`);

        return {
            success: true,
            artifactUri: request.outputPath,
            contentType: "audio/mpeg",
            durationSec,
            fileSizeBytes: stats.size,
            batchJobId: jobId,
        };

    } catch (error) {
        return {
            success: false,
            error: {
                code: "NETWORK_ERROR",
                message: error instanceof Error ? error.message : "Unknown error"
            }
        };
    }
}

function buildSSML(
    input: string,
    voicePreset: TTSRequest["voicePreset"],
    ssmlPreset?: TTSRequest["ssmlPreset"]
): string {
    // If input is already SSML, wrap with voice
    if (input.trim().startsWith("<speak")) {
        return input;
    }

    // Build voice attributes
    const voiceAttrs = [
        `name="${voicePreset.voiceName}"`,
    ];

    // Build prosody attributes
    const prosodyAttrs = [];
    if (voicePreset.rate && voicePreset.rate !== 1.0) {
        prosodyAttrs.push(`rate="${voicePreset.rate}"`);
    }
    if (voicePreset.pitch) {
        prosodyAttrs.push(`pitch="${voicePreset.pitch}"`);
    }

    // Build express-as for style
    let styledContent = input;
    if (voicePreset.style) {
        const styleDegree = voicePreset.styleDegree || 1.0;
        styledContent = `<mstts:express-as style="${voicePreset.style}" styledegree="${styleDegree}">${input}</mstts:express-as>`;
    }

    // Apply prosody if any
    if (prosodyAttrs.length > 0) {
        styledContent = `<prosody ${prosodyAttrs.join(" ")}>${styledContent}</prosody>`;
    }

    // Apply pause mapping from ssmlPreset if provided
    if (ssmlPreset?.pauseMapping) {
        for (const [marker, pauseMs] of Object.entries(ssmlPreset.pauseMapping)) {
            const pauseSSML = `<break time="${pauseMs}ms"/>`;
            styledContent = styledContent.replace(new RegExp(marker, 'g'), pauseSSML);
        }
    }

    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="${voicePreset.language}">
  <voice ${voiceAttrs.join(" ")}>
    ${styledContent}
  </voice>
</speak>`;
}

// ============================================
// VALIDATOR EXECUTORS
// ============================================

export interface ValidatorConfig {
    id: string;
    name: string;
    type: string;
    config: Record<string, unknown>;
    errorMessage: string;
}

export interface ValidationResult {
    validatorId: string;
    validatorName: string;
    passed: boolean;
    errorMessage?: string;
    details?: Record<string, unknown>;
}

export function executeValidators(
    content: string,
    validators: ValidatorConfig[]
): ValidationResult[] {
    const results: ValidationResult[] = [];

    for (const validator of validators) {
        const result = executeValidator(content, validator);
        results.push(result);
    }

    return results;
}

function executeValidator(content: string, validator: ValidatorConfig): ValidationResult {
    const config = validator.config;

    switch (validator.type) {
        case "forbidden_patterns": {
            const patterns = (config.patterns as string[]) || [];
            for (const pattern of patterns) {
                const regex = new RegExp(pattern, 'gi');
                if (regex.test(content)) {
                    return {
                        validatorId: validator.id,
                        validatorName: validator.name,
                        passed: false,
                        errorMessage: validator.errorMessage || `Padrão proibido encontrado: ${pattern}`,
                        details: { matchedPattern: pattern }
                    };
                }
            }
            return {
                validatorId: validator.id,
                validatorName: validator.name,
                passed: true,
            };
        }

        case "required_patterns": {
            const patterns = (config.patterns as string[]) || [];
            for (const pattern of patterns) {
                const regex = new RegExp(pattern, 'gi');
                if (!regex.test(content)) {
                    return {
                        validatorId: validator.id,
                        validatorName: validator.name,
                        passed: false,
                        errorMessage: validator.errorMessage || `Padrão requerido não encontrado: ${pattern}`,
                        details: { missingPattern: pattern }
                    };
                }
            }
            return {
                validatorId: validator.id,
                validatorName: validator.name,
                passed: true,
            };
        }

        case "min_words": {
            const minWords = (config.minWords as number) || 0;
            const wordCount = content.split(/\s+/).filter(Boolean).length;
            if (wordCount < minWords) {
                return {
                    validatorId: validator.id,
                    validatorName: validator.name,
                    passed: false,
                    errorMessage: validator.errorMessage || `Mínimo de ${minWords} palavras exigido, encontrado ${wordCount}`,
                    details: { wordCount, minWords }
                };
            }
            return {
                validatorId: validator.id,
                validatorName: validator.name,
                passed: true,
                details: { wordCount }
            };
        }

        case "max_words": {
            const maxWords = (config.maxWords as number) || Infinity;
            const wordCount = content.split(/\s+/).filter(Boolean).length;
            if (wordCount > maxWords) {
                return {
                    validatorId: validator.id,
                    validatorName: validator.name,
                    passed: false,
                    errorMessage: validator.errorMessage || `Máximo de ${maxWords} palavras permitido, encontrado ${wordCount}`,
                    details: { wordCount, maxWords }
                };
            }
            return {
                validatorId: validator.id,
                validatorName: validator.name,
                passed: true,
                details: { wordCount }
            };
        }

        default:
            return {
                validatorId: validator.id,
                validatorName: validator.name,
                passed: true,
                details: { skipped: true, reason: `Tipo desconhecido: ${validator.type}` }
            };
    }
}

// ============================================
// ARTIFACT STORAGE
// ============================================

export function getArtifactBasePath(jobId: string): string {
    return `./artifacts/${jobId}`;
}

export function getArtifactPath(jobId: string, stepKey: string, filename: string): string {
    return `./artifacts/${jobId}/${stepKey}/${filename}`;
}

export async function ensureArtifactDir(jobId: string, stepKey: string): Promise<string> {
    const fs = await import("fs/promises");
    const path = `./artifacts/${jobId}/${stepKey}`;
    await fs.mkdir(path, { recursive: true });
    return path;
}

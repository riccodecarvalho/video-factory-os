import { StepKind } from "./capabilities";
import { ValidationResult } from "./providers";

export type JobStatus = "pending" | "running" | "completed" | "failed" | "cancelled";
export type StepStatus = "pending" | "running" | "success" | "failed" | "skipped";

export interface LogEntry {
    timestamp: string;
    level: "info" | "warn" | "error" | "debug";
    message: string;
    stepKey?: string;
    meta?: Record<string, unknown>;
}

export interface StepDefinition {
    key: string;
    name: string;
    kind?: StepKind;
    required: boolean;
}

export interface ResolvedConfig {
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

export interface StepManifest {
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

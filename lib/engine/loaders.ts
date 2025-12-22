import { getDb, schema } from "@/lib/db";
import { eq, inArray } from "drizzle-orm";
import { type VideoPreset } from "./ffmpeg";
import { type ProviderConfig, type PromptConfig, type ValidatorConfig } from "./providers";

export async function loadPrompt(promptId: string): Promise<PromptConfig | null> {
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

export async function loadProvider(providerId: string): Promise<ProviderConfig | null> {
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

export async function loadVoicePreset(presetId: string) {
    const db = getDb();
    const [preset] = await db.select().from(schema.presetsVoice).where(eq(schema.presetsVoice.id, presetId));
    return preset;
}

export async function loadSsmlPreset(presetId: string) {
    const db = getDb();
    const [preset] = await db.select().from(schema.presetsSsml).where(eq(schema.presetsSsml.id, presetId));
    return preset;
}

export async function loadVideoPreset(presetId: string): Promise<VideoPreset | null> {
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

export async function loadValidators(validatorIds: string[]): Promise<ValidatorConfig[]> {
    if (validatorIds.length === 0) return [];
    const db = getDb();
    const validators = await db.select().from(schema.validators).where(inArray(schema.validators.id, validatorIds));

    return validators.map((v: typeof schema.validators.$inferSelect) => ({
        id: v.id,
        name: v.name,
        type: v.type,
        config: JSON.parse(v.config || "{}"),
        errorMessage: v.errorMessage,
    }));
}

export async function loadKnowledgeBase(kbIds: string[]): Promise<string> {
    if (kbIds.length === 0) return "";
    const db = getDb();
    const kbs = await db.select().from(schema.knowledgeBase).where(inArray(schema.knowledgeBase.id, kbIds));

    return kbs.map((kb: typeof schema.knowledgeBase.$inferSelect) => `[${kb.name}]\n${kb.content}`).join("\n\n---\n\n");
}

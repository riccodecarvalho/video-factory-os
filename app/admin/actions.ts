"use server";

/**
 * Admin Actions - Server Actions para CRUD do Admin
 * 
 * Config-First: todas as listas vêm do DB, zero hardcode.
 */

import { getDb, schema } from "@/lib/db";
import { eq, like, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { v4 as uuid } from "uuid";
import { auditCrud } from "@/lib/audit";

// ============================================
// PROMPTS
// ============================================

export async function getPrompts(search?: string, category?: string) {
    const db = getDb();

    let query = db.select().from(schema.prompts);

    const results = await query;

    // Filter in JS for simplicity (DB would be better for large datasets)
    return results.filter(p => {
        const matchesSearch = !search ||
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.slug.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = !category || category === "all" || p.category === category;
        return matchesSearch && matchesCategory;
    });
}

export async function getPromptCategories() {
    const db = getDb();
    const prompts = await db.select().from(schema.prompts);

    const categories = prompts.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return {
        all: prompts.length,
        ...categories,
    };
}

export async function updatePrompt(id: string, data: Partial<typeof schema.prompts.$inferInsert>) {
    const db = getDb();

    // Get before state
    const [before] = await db.select().from(schema.prompts).where(eq(schema.prompts.id, id));

    await db.update(schema.prompts)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(schema.prompts.id, id));

    // Audit
    if (before) {
        await auditCrud('updated', 'prompt', id, before.name, before, data);
    }

    revalidatePath("/admin/prompts");
}

export async function createPrompt(data: Partial<typeof schema.prompts.$inferInsert>) {
    const db = getDb();
    const now = new Date().toISOString();
    const newPrompt = {
        id: uuid(),
        slug: `new-prompt-${Date.now()}`,
        name: "Novo Prompt",
        category: "script",
        systemPrompt: "",
        userTemplate: "",
        model: "claude-sonnet-4-20250514",
        maxTokens: 4096,
        temperature: 0.7,
        version: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        ...data,
    };
    await db.insert(schema.prompts).values(newPrompt);
    revalidatePath("/admin/prompts");
    return newPrompt;
}

// ============================================
// PROVIDERS
// ============================================

export async function getProviders(search?: string, type?: string) {
    const db = getDb();
    const results = await db.select().from(schema.providers);

    return results.filter(p => {
        const matchesSearch = !search ||
            p.name.toLowerCase().includes(search.toLowerCase());
        const matchesType = !type || type === "all" || p.type === type;
        return matchesSearch && matchesType;
    });
}

export async function getProviderTypes() {
    const db = getDb();
    const providers = await db.select().from(schema.providers);

    const types = providers.reduce((acc, p) => {
        acc[p.type] = (acc[p.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return { all: providers.length, ...types };
}

export async function updateProvider(id: string, data: Partial<typeof schema.providers.$inferInsert>) {
    const db = getDb();
    const [before] = await db.select().from(schema.providers).where(eq(schema.providers.id, id));
    await db.update(schema.providers).set(data).where(eq(schema.providers.id, id));
    const [after] = await db.select().from(schema.providers).where(eq(schema.providers.id, id));
    await auditCrud("updated", "provider", id, after.name, before, after);
    revalidatePath("/admin/providers");
}

export async function createProvider() {
    const db = getDb();
    const now = new Date().toISOString();
    const newProvider = {
        id: uuid(),
        slug: `provider-${Date.now()}`,
        name: "Novo Provider",
        type: "llm",
        isActive: true,
        createdAt: now,
    };
    await db.insert(schema.providers).values(newProvider);
    revalidatePath("/admin/providers");
    return newProvider;
}

// ============================================
// VALIDATORS
// ============================================

export async function getValidators(search?: string, type?: string) {
    const db = getDb();
    const results = await db.select().from(schema.validators);

    return results.filter(v => {
        const matchesSearch = !search ||
            v.name.toLowerCase().includes(search.toLowerCase());
        const matchesType = !type || type === "all" || v.type === type;
        return matchesSearch && matchesType;
    });
}

export async function getValidatorTypes() {
    const db = getDb();
    const validators = await db.select().from(schema.validators);

    const types = validators.reduce((acc, v) => {
        acc[v.type] = (acc[v.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return { all: validators.length, ...types };
}

export async function updateValidator(id: string, data: Partial<typeof schema.validators.$inferInsert>) {
    const db = getDb();
    const [before] = await db.select().from(schema.validators).where(eq(schema.validators.id, id));
    await db.update(schema.validators).set(data).where(eq(schema.validators.id, id));
    const [after] = await db.select().from(schema.validators).where(eq(schema.validators.id, id));
    await auditCrud("updated", "validator", id, after.name, before, after);
    revalidatePath("/admin/validators");
}

export async function createValidator() {
    const db = getDb();
    const now = new Date().toISOString();
    const newValidator = {
        id: uuid(),
        slug: `validator-${Date.now()}`,
        name: "Novo Validator",
        type: "forbidden_patterns",
        config: "{}",
        errorMessage: "Validação falhou",
        severity: "error",
        isActive: true,
        createdAt: now,
    };
    await db.insert(schema.validators).values(newValidator);
    revalidatePath("/admin/validators");
    return newValidator;
}

// ============================================
// RECIPES
// ============================================

export async function getRecipes(search?: string) {
    const db = getDb();
    const results = await db.select().from(schema.recipes);

    return results.filter(r => {
        return !search ||
            r.name.toLowerCase().includes(search.toLowerCase()) ||
            r.slug.toLowerCase().includes(search.toLowerCase());
    });
}

export async function updateRecipe(id: string, data: Partial<typeof schema.recipes.$inferInsert>) {
    const db = getDb();
    await db.update(schema.recipes)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(schema.recipes.id, id));
    revalidatePath("/admin/recipes");
}

export async function createRecipe() {
    const db = getDb();
    const now = new Date().toISOString();
    const newRecipe = {
        id: uuid(),
        slug: `recipe-${Date.now()}`,
        name: "Nova Recipe",
        pipeline: "[]",
        version: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
    };
    await db.insert(schema.recipes).values(newRecipe);
    revalidatePath("/admin/recipes");
    return newRecipe;
}

// ============================================
// KNOWLEDGE BASE
// ============================================

export async function getKnowledgeBase(search?: string, tier?: string) {
    const db = getDb();
    const results = await db.select().from(schema.knowledgeBase);

    return results.filter(kb => {
        const matchesSearch = !search ||
            kb.name.toLowerCase().includes(search.toLowerCase());
        const matchesTier = !tier || tier === "all" || kb.tier === tier;
        return matchesSearch && matchesTier;
    });
}

export async function getKnowledgeTiers() {
    const db = getDb();
    const items = await db.select().from(schema.knowledgeBase);

    const tiers = items.reduce((acc, kb) => {
        acc[kb.tier] = (acc[kb.tier] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return { all: items.length, ...tiers };
}

export async function updateKnowledge(id: string, data: Partial<typeof schema.knowledgeBase.$inferInsert>) {
    const db = getDb();
    await db.update(schema.knowledgeBase)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(schema.knowledgeBase.id, id));
    revalidatePath("/admin/knowledge-base");
}

export async function createKnowledge() {
    const db = getDb();
    const now = new Date().toISOString();
    const newKb = {
        id: uuid(),
        slug: `kb-${Date.now()}`,
        name: "Novo Documento",
        tier: "tier1",
        category: "general",
        content: "",
        isActive: true,
        createdAt: now,
        updatedAt: now,
    };
    await db.insert(schema.knowledgeBase).values(newKb);
    revalidatePath("/admin/knowledge-base");
    return newKb;
}

// ============================================
// PRESETS (Voice, Video, Effects, SSML)
// ============================================

export type PresetType = "voice" | "video" | "effects" | "ssml";

export async function getPresets(type?: PresetType, search?: string) {
    const db = getDb();

    const [voice, video, effects, ssml] = await Promise.all([
        db.select().from(schema.presetsVoice),
        db.select().from(schema.presetsVideo),
        db.select().from(schema.presetsEffects),
        db.select().from(schema.presetsSsml),
    ]);

    const all = [
        ...voice.map(v => ({ ...v, presetType: "voice" as const })),
        ...video.map(v => ({ ...v, presetType: "video" as const })),
        ...effects.map(v => ({ ...v, presetType: "effects" as const })),
        ...ssml.map(v => ({ ...v, presetType: "ssml" as const })),
    ];

    return all.filter(p => {
        const matchesType = !type || type === "all" as any || p.presetType === type;
        const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
        return matchesType && matchesSearch;
    });
}

export async function getPresetCounts() {
    const db = getDb();

    const [voice, video, effects, ssml] = await Promise.all([
        db.select().from(schema.presetsVoice),
        db.select().from(schema.presetsVideo),
        db.select().from(schema.presetsEffects),
        db.select().from(schema.presetsSsml),
    ]);

    return {
        all: voice.length + video.length + effects.length + ssml.length,
        voice: voice.length,
        video: video.length,
        effects: effects.length,
        ssml: ssml.length,
    };
}

// Individual preset queries for Execution Map
export async function getVoicePresets() {
    const db = getDb();
    return db.select().from(schema.presetsVoice);
}

export async function getSsmlPresets() {
    const db = getDb();
    return db.select().from(schema.presetsSsml);
}

export async function getVideoPresets() {
    const db = getDb();
    return db.select().from(schema.presetsVideo);
}

export async function createVideoPreset(data: Partial<typeof schema.presetsVideo.$inferInsert>) {
    const db = getDb();
    const now = new Date().toISOString();
    const newPreset = {
        id: uuid(),
        slug: data.slug || `video-preset-${Date.now()}`,
        name: data.name || "Novo Preset de Vídeo",
        encoder: 'h264_videotoolbox',
        scale: '1280:720',
        fps: 30,
        bitrate: '4M',
        pixelFormat: 'yuv420p',
        audioCodec: 'aac',
        audioBitrate: '192k',
        isActive: true,
        createdAt: now,
        ...data,
    };
    await db.insert(schema.presetsVideo).values(newPreset);
    await auditCrud("created", "preset_video", newPreset.id, newPreset.name, undefined, newPreset);
    revalidatePath("/admin/presets/video");
    return newPreset;
}

export async function updateVideoPreset(id: string, data: Partial<typeof schema.presetsVideo.$inferInsert>) {
    const db = getDb();
    const [before] = await db.select().from(schema.presetsVideo).where(eq(schema.presetsVideo.id, id));
    await db.update(schema.presetsVideo).set(data).where(eq(schema.presetsVideo.id, id));
    const [after] = await db.select().from(schema.presetsVideo).where(eq(schema.presetsVideo.id, id));
    await auditCrud("updated", "preset_video", id, after.name, before, after);
    revalidatePath("/admin/presets/video");
}

export async function deleteVideoPreset(id: string) {
    const db = getDb();
    const [before] = await db.select().from(schema.presetsVideo).where(eq(schema.presetsVideo.id, id));
    await db.delete(schema.presetsVideo).where(eq(schema.presetsVideo.id, id));
    await auditCrud("deleted", "preset_video", id, before?.name || "unknown", before, undefined);
    revalidatePath("/admin/presets/video");
}

export async function getEffectsPresets() {
    const db = getDb();
    return db.select().from(schema.presetsEffects);
}

// Generic updatePreset for all preset types
export async function updatePreset(type: PresetType, id: string, data: Record<string, unknown>) {
    const db = getDb();
    const now = new Date().toISOString();

    // Clean data - remove fields that shouldn't be updated
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([k]) =>
            !["id", "createdAt", "presetType"].includes(k)
        )
    );

    switch (type) {
        case "voice":
            await db.update(schema.presetsVoice).set(cleanData).where(eq(schema.presetsVoice.id, id));
            break;
        case "video":
            await db.update(schema.presetsVideo).set(cleanData).where(eq(schema.presetsVideo.id, id));
            break;
        case "effects":
            await db.update(schema.presetsEffects).set(cleanData).where(eq(schema.presetsEffects.id, id));
            break;
        case "ssml":
            await db.update(schema.presetsSsml).set(cleanData).where(eq(schema.presetsSsml.id, id));
            break;
    }

    revalidatePath("/admin/presets");
}

// ============================================
// PROJECTS
// ============================================

export async function getProjects(search?: string) {
    const db = getDb();
    const results = await db.select().from(schema.projects);

    return results.filter(p => {
        const matchesSearch = !search ||
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.key.toLowerCase().includes(search.toLowerCase());
        return matchesSearch;
    });
}

export async function createProject() {
    const db = getDb();
    const now = new Date().toISOString();
    const id = uuid();

    const newProject = {
        id,
        key: `project-${Date.now()}`,
        name: "Novo Project",
        description: "",
        isActive: true,
        createdAt: now,
    };

    await db.insert(schema.projects).values(newProject);

    await auditCrud("created", "project", id, newProject.name, undefined, newProject);

    revalidatePath("/admin/projects");
    return newProject;
}

export async function updateProject(id: string, data: Partial<{
    name: string;
    key: string;
    description: string;
}>) {
    const db = getDb();

    const [before] = await db.select().from(schema.projects).where(eq(schema.projects.id, id));

    await db.update(schema.projects).set(data).where(eq(schema.projects.id, id));

    const [after] = await db.select().from(schema.projects).where(eq(schema.projects.id, id));

    await auditCrud("updated", "project", id, after.name, before, after);

    revalidatePath("/admin/projects");
}

export async function toggleProjectActive(id: string, isActive: boolean) {
    const db = getDb();

    const [before] = await db.select().from(schema.projects).where(eq(schema.projects.id, id));

    await db.update(schema.projects).set({ isActive }).where(eq(schema.projects.id, id));

    const action = isActive ? "updated" : "updated";
    await auditCrud(action, "project", id, before.name, { isActive: before.isActive }, { isActive });

    revalidatePath("/admin/projects");
}


"use server";

/**
 * Execution Map Actions - Governança de bindings
 * 
 * Fonte da verdade para wiring: qual prompt/provider/preset/validator/kb
 * é usado em cada step de cada recipe.
 */

import { getDb, schema } from "@/lib/db";
import { eq, and, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { v4 as uuid } from "uuid";
import { auditBinding } from "@/lib/audit";

// ============================================
// QUERIES
// ============================================

export async function getProjects() {
    const db = getDb();
    return db.select().from(schema.projects);
}

export async function getExecutionBindings(recipeId: string, projectId?: string) {
    const db = getDb();

    // Get global bindings for this recipe
    const globalBindings = await db.select().from(schema.executionBindings)
        .where(and(
            eq(schema.executionBindings.recipeId, recipeId),
            eq(schema.executionBindings.scope, 'global'),
            eq(schema.executionBindings.isActive, true)
        ));

    // Get project-specific bindings if projectId provided
    let projectBindings: typeof globalBindings = [];
    if (projectId) {
        projectBindings = await db.select().from(schema.executionBindings)
            .where(and(
                eq(schema.executionBindings.recipeId, recipeId),
                eq(schema.executionBindings.scope, 'project'),
                eq(schema.executionBindings.projectId, projectId),
                eq(schema.executionBindings.isActive, true)
            ));
    }

    return { globalBindings, projectBindings };
}

export async function getRecipeSteps(recipeId: string) {
    const db = getDb();
    const [recipe] = await db.select().from(schema.recipes).where(eq(schema.recipes.id, recipeId));
    if (!recipe) return [];

    const pipeline = JSON.parse(recipe.pipeline || '[]');
    return pipeline.map((step: { key: string; name: string }, index: number) => ({
        key: step.key,
        name: step.name || step.key,
        order: index,
    }));
}

// Get effective config for a step (project overrides global)
export async function getEffectiveConfig(
    recipeId: string,
    stepKey: string,
    projectId?: string
) {
    const { globalBindings, projectBindings } = await getExecutionBindings(recipeId, projectId);
    const db = getDb();

    // Filter to this step
    const stepGlobal = globalBindings.filter(b => b.stepKey === stepKey);
    const stepProject = projectBindings.filter(b => b.stepKey === stepKey);

    // Build effective config by slot, project overrides global
    const slots = ['prompt', 'provider', 'preset_voice', 'preset_ssml', 'validators', 'kb'];
    const config: Record<string, { source: 'global' | 'project'; bindings: typeof globalBindings }> = {};

    for (const slot of slots) {
        const projectSlot = stepProject.filter(b => b.slot === slot);
        const globalSlot = stepGlobal.filter(b => b.slot === slot);

        if (projectSlot.length > 0) {
            config[slot] = { source: 'project', bindings: projectSlot };
        } else if (globalSlot.length > 0) {
            config[slot] = { source: 'global', bindings: globalSlot };
        }
    }

    // Resolve target entities
    const resolved: Record<string, unknown> = {};
    for (const [slot, data] of Object.entries(config)) {
        if (data.bindings.length === 0) continue;

        // For single-value slots, get first binding
        const targetIds = data.bindings.map(b => b.targetId);

        switch (slot) {
            case 'prompt':
                const [prompt] = await db.select().from(schema.prompts).where(eq(schema.prompts.id, targetIds[0]));
                resolved[slot] = prompt ? { id: prompt.id, name: prompt.name, source: data.source } : null;
                break;
            case 'provider':
                const [provider] = await db.select().from(schema.providers).where(eq(schema.providers.id, targetIds[0]));
                resolved[slot] = provider ? { id: provider.id, name: provider.name, source: data.source } : null;
                break;
            case 'preset_voice':
                const [voice] = await db.select().from(schema.presetsVoice).where(eq(schema.presetsVoice.id, targetIds[0]));
                resolved[slot] = voice ? { id: voice.id, name: voice.name, source: data.source } : null;
                break;
            case 'preset_ssml':
                const [ssml] = await db.select().from(schema.presetsSsml).where(eq(schema.presetsSsml.id, targetIds[0]));
                resolved[slot] = ssml ? { id: ssml.id, name: ssml.name, source: data.source } : null;
                break;
            case 'validators':
                const validatorResults = [];
                for (const id of targetIds) {
                    const [v] = await db.select().from(schema.validators).where(eq(schema.validators.id, id));
                    if (v) validatorResults.push({ id: v.id, name: v.name });
                }
                resolved[slot] = { items: validatorResults, source: data.source };
                break;
            case 'kb':
                const kbResults = [];
                for (const id of targetIds) {
                    const [kb] = await db.select().from(schema.knowledgeBase).where(eq(schema.knowledgeBase.id, id));
                    if (kb) kbResults.push({ id: kb.id, name: kb.name });
                }
                resolved[slot] = { items: kbResults, source: data.source };
                break;
        }
    }

    return resolved;
}

// Get "Used by" for any entity
export async function getUsedBy(targetId: string) {
    const db = getDb();
    const bindings = await db.select().from(schema.executionBindings)
        .where(and(
            eq(schema.executionBindings.targetId, targetId),
            eq(schema.executionBindings.isActive, true)
        ));

    // Enrich with recipe and project names
    const enriched = [];
    for (const b of bindings) {
        const [recipe] = await db.select().from(schema.recipes).where(eq(schema.recipes.id, b.recipeId));
        let project = null;
        if (b.projectId) {
            const [p] = await db.select().from(schema.projects).where(eq(schema.projects.id, b.projectId));
            project = p;
        }
        enriched.push({
            ...b,
            recipeName: recipe?.name || 'Unknown',
            projectName: project?.name || null,
        });
    }

    return enriched;
}

// ============================================
// MUTATIONS
// ============================================

export async function setBinding(
    recipeId: string,
    stepKey: string,
    slot: string,
    targetId: string,
    scope: 'global' | 'project' = 'global',
    projectId?: string
) {
    const db = getDb();
    const now = new Date().toISOString();

    // For single-value slots, deactivate existing
    if (['prompt', 'provider', 'preset_voice', 'preset_ssml'].includes(slot)) {
        await db.update(schema.executionBindings)
            .set({ isActive: false, updatedAt: now })
            .where(and(
                eq(schema.executionBindings.recipeId, recipeId),
                eq(schema.executionBindings.stepKey, stepKey),
                eq(schema.executionBindings.slot, slot),
                eq(schema.executionBindings.scope, scope),
                scope === 'project' ? eq(schema.executionBindings.projectId, projectId!) : eq(schema.executionBindings.projectId, '')
            ));
    }

    // Insert new binding
    const bindingId = uuid();
    await db.insert(schema.executionBindings).values({
        id: bindingId,
        scope,
        projectId: projectId || null,
        recipeId,
        stepKey,
        slot,
        targetId,
        isActive: true,
        createdAt: now,
        updatedAt: now,
    });

    // Audit
    await auditBinding(
        'binding.set',
        bindingId,
        recipeId,
        stepKey,
        slot,
        scope,
        projectId,
        null,
        { targetId, scope, projectId }
    );

    revalidatePath('/admin/execution-map');
    return { success: true };
}

export async function removeBinding(bindingId: string) {
    const db = getDb();

    // Get before state
    const [before] = await db.select().from(schema.executionBindings).where(eq(schema.executionBindings.id, bindingId));

    await db.update(schema.executionBindings)
        .set({ isActive: false, updatedAt: new Date().toISOString() })
        .where(eq(schema.executionBindings.id, bindingId));

    // Audit
    if (before) {
        await auditBinding(
            'binding.removed',
            bindingId,
            before.recipeId,
            before.stepKey,
            before.slot,
            before.scope as 'global' | 'project',
            before.projectId || undefined,
            before,
            null
        );
    }

    revalidatePath('/admin/execution-map');
    return { success: true };
}

export async function resetToGlobal(recipeId: string, stepKey: string, slot: string, projectId: string) {
    const db = getDb();

    // Get before state
    const [before] = await db.select().from(schema.executionBindings)
        .where(and(
            eq(schema.executionBindings.recipeId, recipeId),
            eq(schema.executionBindings.stepKey, stepKey),
            eq(schema.executionBindings.slot, slot),
            eq(schema.executionBindings.scope, 'project'),
            eq(schema.executionBindings.projectId, projectId)
        ));

    await db.update(schema.executionBindings)
        .set({ isActive: false, updatedAt: new Date().toISOString() })
        .where(and(
            eq(schema.executionBindings.recipeId, recipeId),
            eq(schema.executionBindings.stepKey, stepKey),
            eq(schema.executionBindings.slot, slot),
            eq(schema.executionBindings.scope, 'project'),
            eq(schema.executionBindings.projectId, projectId)
        ));

    // Audit
    if (before) {
        await auditBinding(
            'binding.reset',
            before.id,
            recipeId,
            stepKey,
            slot,
            'project',
            projectId,
            before,
            null
        );
    }

    revalidatePath('/admin/execution-map');
    return { success: true };
}

// ============================================
// SEED BINDINGS (for initial wiring)
// ============================================

export async function seedDefaultBindings(recipeId: string) {
    const db = getDb();
    const now = new Date().toISOString();

    // Get recipe steps
    const steps = await getRecipeSteps(recipeId);

    // Get first of each entity type
    const [prompt] = await db.select().from(schema.prompts);
    const [provider] = await db.select().from(schema.providers);
    const [voice] = await db.select().from(schema.presetsVoice);
    const [ssml] = await db.select().from(schema.presetsSsml);
    const [validator] = await db.select().from(schema.validators);
    const [kb] = await db.select().from(schema.knowledgeBase);

    // Create default bindings for each step
    for (const step of steps) {
        const bindings = [];

        // script step needs prompt, provider, validators, kb
        if (['script', 'title', 'brief'].includes(step.key)) {
            if (prompt) bindings.push({ slot: 'prompt', targetId: prompt.id });
            if (provider) bindings.push({ slot: 'provider', targetId: provider.id });
            if (validator) bindings.push({ slot: 'validators', targetId: validator.id });
            if (kb) bindings.push({ slot: 'kb', targetId: kb.id });
        }

        // tts step needs provider, voice preset, ssml preset
        if (step.key === 'tts' || step.key === 'parse_ssml') {
            if (voice) bindings.push({ slot: 'preset_voice', targetId: voice.id });
            if (ssml) bindings.push({ slot: 'preset_ssml', targetId: ssml.id });
        }

        for (const b of bindings) {
            await db.insert(schema.executionBindings).values({
                id: uuid(),
                scope: 'global',
                recipeId,
                stepKey: step.key,
                slot: b.slot,
                targetId: b.targetId,
                isActive: true,
                createdAt: now,
                updatedAt: now,
            }).onConflictDoNothing();
        }
    }

    revalidatePath('/admin/execution-map');
    return { success: true };
}

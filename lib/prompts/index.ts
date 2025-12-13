/**
 * Video Factory OS - Prompt Governance
 * 
 * Regra de ouro: NUNCA fallback silencioso.
 * Se prompt não existe → throw explícito.
 */

import { eq, and } from 'drizzle-orm';
import type { Database } from '@/lib/db';
import { prompts, knowledgeBase } from '@/lib/db/schema';

export interface PromptConfig {
    id: string;
    slug: string;
    name: string;
    category: string;
    systemPrompt: string | null;
    userTemplate: string;
    model: string;
    maxTokens: number;
    temperature: number;
    kbTiers: string[] | null;
}

/**
 * Busca um prompt pelo slug.
 * THROWS se não encontrar - sem fallback silencioso!
 */
export async function getPromptOrThrow(
    db: Database,
    slug: string
): Promise<PromptConfig> {
    const result = await db
        .select()
        .from(prompts)
        .where(and(eq(prompts.slug, slug), eq(prompts.isActive, true)))
        .limit(1);

    if (result.length === 0) {
        // Tenta sugerir prompts similares
        const allPrompts = await db.select({ slug: prompts.slug }).from(prompts);
        const suggestions = allPrompts
            .map((p) => p.slug)
            .filter((s) => s.includes(slug.split('.')[0]));

        const suggestionText =
            suggestions.length > 0
                ? ` Did you mean: ${suggestions.slice(0, 3).join(', ')}?`
                : '';

        throw new Error(`Prompt not found: ${slug}.${suggestionText}`);
    }

    const prompt = result[0];
    return {
        id: prompt.id,
        slug: prompt.slug,
        name: prompt.name,
        category: prompt.category,
        systemPrompt: prompt.systemPrompt,
        userTemplate: prompt.userTemplate,
        model: prompt.model,
        maxTokens: prompt.maxTokens,
        temperature: prompt.temperature,
        kbTiers: prompt.kbTiers ? JSON.parse(prompt.kbTiers) : null,
    };
}

/**
 * Busca knowledge base por tiers.
 * tier1 = sempre carrega
 * tier2 = por contexto
 * tier3 = sob demanda
 */
export async function getKnowledgeBase(
    db: Database,
    tiers: string[],
    recipeSlug?: string
): Promise<string> {
    const results = await db
        .select()
        .from(knowledgeBase)
        .where(eq(knowledgeBase.isActive, true));

    const filtered = results.filter((kb) => {
        // Tier match
        if (!tiers.includes(kb.tier)) return false;
        // Recipe match (null = global, else must match)
        if (kb.recipeSlug && kb.recipeSlug !== recipeSlug) return false;
        return true;
    });

    // Ordenar por tier (tier1 primeiro)
    filtered.sort((a, b) => {
        const tierOrder = { tier1: 1, tier2: 2, tier3: 3 };
        return (tierOrder[a.tier as keyof typeof tierOrder] || 99) -
            (tierOrder[b.tier as keyof typeof tierOrder] || 99);
    });

    return filtered.map((kb) => `## ${kb.name}\n\n${kb.content}`).join('\n\n---\n\n');
}

/**
 * Substitui variáveis no template.
 * Suporta: {{variable}}, {{#if var}}...{{/if}}, {{#unless var}}...{{/unless}}
 */
export function replaceVariables(
    template: string,
    variables: Record<string, string | number | boolean | undefined>
): string {
    let result = template;

    // 1. Processar {{#if var}}...{{/if}}
    result = result.replace(
        /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
        (_, varName, content) => {
            const value = variables[varName];
            return value ? content : '';
        }
    );

    // 2. Processar {{#unless var}}...{{/unless}}
    result = result.replace(
        /\{\{#unless\s+(\w+)\}\}([\s\S]*?)\{\{\/unless\}\}/g,
        (_, varName, content) => {
            const value = variables[varName];
            return !value ? content : '';
        }
    );

    // 3. Processar {{variable}}
    result = result.replace(/\{\{(\w+)\}\}/g, (_, varName) => {
        const value = variables[varName];
        if (value === undefined) {
            console.warn(`Variable not provided: ${varName}`);
            return `{{${varName}}}`; // Mantém o placeholder
        }
        return String(value);
    });

    return result;
}

/**
 * Script para corrigir bindings de Knowledge Base e limpar prompts
 * 
 * 1. Define bindings explícitos na tabela execution_bindings
 * 2. Remove conteúdo inline duplicado dos prompts (DNA e KBs)
 */

import { getDb, schema } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { v4 as uuid } from "uuid";

async function main() {
    const db = getDb();

    // 1. Obter IDs necessários
    console.log('🔍 Buscando IDs...');

    // Recipe
    const [recipe] = await db.select().from(schema.recipes).where(eq(schema.recipes.slug, 'graciela-youtube-long'));
    if (!recipe) throw new Error('Recipe not found');

    // KBs
    const kbs = await db.select().from(schema.knowledgeBase);
    const kbMap = new Map(kbs.map(k => [k.slug, k.id]));

    const KB_SLUGS = {
        DNA: 'graciela-dna-tier1',
        HOOKS: 'graciela-hooks-v3',
        ESCALADAS: 'graciela-escaladas-v3',
        KARMA: 'graciela-karma-v3',
        ESTILO: 'graciela-estilo-escrita-v1',
        TITULOS: 'graciela-titulos-v1'
    };

    // Verificar se todos os KBs existem
    for (const [key, slug] of Object.entries(KB_SLUGS)) {
        if (!kbMap.has(slug)) throw new Error(`KB ${slug} (${key}) not found`);
    }

    // 2. Definir Bindings
    console.log('🔗 Criando bindings...');

    const bindingsToCreate = [
        // Planejamento: precisa de DNA, HOOKS, ESCALADAS, KARMA, ESTILO (para estrutura)
        { step: 'planejamento', kb: KB_SLUGS.DNA },
        { step: 'planejamento', kb: KB_SLUGS.HOOKS },
        { step: 'planejamento', kb: KB_SLUGS.ESCALADAS },
        { step: 'planejamento', kb: KB_SLUGS.KARMA },
        { step: 'planejamento', kb: KB_SLUGS.ESTILO },

        // Roteiro: precisa de DNA, ESTILO, KARMA (para referência)
        { step: 'roteiro', kb: KB_SLUGS.DNA },
        { step: 'roteiro', kb: KB_SLUGS.ESTILO },
        { step: 'roteiro', kb: KB_SLUGS.KARMA }, // Útil para garantir detalhes do Clímax

        // Titulo: precisa de TITULOS e DNA
        { step: 'titulo', kb: KB_SLUGS.TITULOS },
        { step: 'titulo', kb: KB_SLUGS.DNA },

        // Ideacao: precisa de DNA (para garantir tom)
        { step: 'ideacao', kb: KB_SLUGS.DNA }
    ];

    // Limpar bindings de KB existentes para estes steps (para evitar duplicatas)
    await db.delete(schema.executionBindings)
        .where(and(
            eq(schema.executionBindings.recipeId, recipe.id),
            eq(schema.executionBindings.slot, 'kb')
        ));

    // Inserir novos bindings
    for (const b of bindingsToCreate) {
        await db.insert(schema.executionBindings).values({
            id: uuid(),
            scope: 'global',
            recipeId: recipe.id,
            stepKey: b.step,
            slot: 'kb',
            targetId: kbMap.get(b.kb)!,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }

    console.log(`✅ ${bindingsToCreate.length} bindings de KB criados com sucesso.`);

    // 3. Atualizar Prompts
    console.log('📝 Atualizando prompts...');

    // Planejamento: Remover DNA inline
    const [planejamento] = await db.select().from(schema.prompts).where(eq(schema.prompts.slug, 'graciela.planejamento.v3'));
    if (planejamento) {
        let newContent = planejamento.userTemplate;

        // Remove seção DNA inline
        newContent = newContent.replace(
            /# DNA DEL CANAL\s+- Narradora: GRACIELA.*INDIGNACIÓN → CURIOSIDAD → CATARSIS\s+---/s,
            '# DNA DO CANAL: ver KB [DNA Graciela]\n\n---'
        );

        await db.update(schema.prompts)
            .set({ userTemplate: newContent, updatedAt: new Date().toISOString() })
            .where(eq(schema.prompts.id, planejamento.id));

        console.log('✅ Prompt planejamento.v3 atualizado (DNA removido)');
    }

    // Roteiro: Nada inline crítico, mas vamos garantir que ele saiba usar o KB
    // (A atualização anterior do roteiro.v3 já referenciou "ver KB estilo-escrita", então ok)

    console.log('🎉 Correção de KBs concluída!');
}

main().catch(console.error);

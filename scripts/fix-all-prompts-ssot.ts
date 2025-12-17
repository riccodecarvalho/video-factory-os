
import { getDb } from "../lib/db";
import * as schema from "../lib/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';

async function main() {
    const db = getDb();
    console.log('🔍 Iniciando auditoria SSOT da pipeline Graciela...');

    // 1. Obter Recipe
    const [recipe] = await db.select().from(schema.recipes).where(eq(schema.recipes.slug, 'graciela-youtube-long'));
    if (!recipe) throw new Error('Recipe not found');
    console.log(`✅ Recipe encontrada: ${recipe.name}`);

    // 2. Obter KBs essenciais
    const kbs = await db.select().from(schema.knowledgeBase).where(eq(schema.knowledgeBase.isActive, 1));
    const kbMap = {
        dna: kbs.find(k => k.slug === 'graciela-dna-tier1'),
        hooks: kbs.find(k => k.slug === 'graciela-hooks-v3'),
        escaladas: kbs.find(k => k.slug === 'graciela-escaladas-v3'),
        karma: kbs.find(k => k.slug === 'graciela-karma-v3'),
        estilo: kbs.find(k => k.slug === 'graciela-estilo-escrita-v1'),
        titulos: kbs.find(k => k.slug === 'graciela-titulos-v1'),
    };

    if (!kbMap.dna) throw new Error('CRITICO: KB DNA não encontrado!');

    // 3. Mapeamento de Steps -> Prompts -> Bindings Necessários
    const stepBindings = [
        {
            stepKey: 'ideacao',
            promptSlug: 'graciela.ideacao.v2',
            kbs: ['dna']
        },
        {
            stepKey: 'titulo',
            promptSlug: 'graciela.titulo.v2',
            kbs: ['dna', 'titulos']
        },
        {
            stepKey: 'planejamento',
            promptSlug: 'graciela.planejamento.v3',
            kbs: ['dna', 'hooks', 'escaladas', 'karma', 'estilo']
        },
        {
            stepKey: 'roteiro',
            promptSlug: 'graciela.roteiro.v3',
            kbs: ['dna', 'estilo', 'karma']
        },
        {
            stepKey: 'miniaturas',
            promptSlug: 'graciela.miniaturas.v2',
            kbs: ['dna']
        },
        {
            stepKey: 'descricao',
            promptSlug: 'graciela.descricao.v2',
            kbs: ['dna', 'hooks'] // Hooks ajudam na descrição
        },
        {
            stepKey: 'tags',
            promptSlug: 'graciela.tags.v2',
            kbs: ['dna'] // DNA contém nicho/tags principais
        },
        {
            stepKey: 'comunidade',
            promptSlug: 'graciela.comunidade.v2',
            kbs: ['dna']
        }
    ];

    console.log('\n🔗 Verificando e Corrigindo Bindings e Conteúdo...');

    for (const step of stepBindings) {
        console.log(`\n👉 Processando Step: ${step.stepKey} (${step.promptSlug})`);

        // A. Validar Bindings
        // Primeiro limpamos bindings antigos deste step para garantir estado limpo (ou fazemos upsert)
        // Optando por delete/insert para garantir ordem e limpeza
        await db.delete(schema.executionBindings)
            .where(and(
                eq(schema.executionBindings.recipeId, recipe.id),
                eq(schema.executionBindings.stepKey, step.stepKey),
                eq(schema.executionBindings.slot, 'kb')
            ));

        // Inserir novos bindings
        for (const kbKey of step.kbs) {
            const kb = kbMap[kbKey as keyof typeof kbMap];
            if (!kb) {
                console.warn(`⚠️  KB '${kbKey}' não encontrado no mapa para step ${step.stepKey}`);
                continue;
            }

            await db.insert(schema.executionBindings).values({
                id: uuidv4(),
                recipeId: recipe.id,
                stepKey: step.stepKey,
                targetId: kb.id,
                slot: 'kb',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            console.log(`   + Binding KB: ${kb.slug}`);
        }

        // B. Limpar Conteúdo Duplicado no Prompt
        const [prompt] = await db.select().from(schema.prompts).where(eq(schema.prompts.slug, step.promptSlug));
        if (!prompt) {
            console.error(`❌ Prompt ${step.promptSlug} não encontrado!`);
            continue;
        }

        let newSystemPrompt = prompt.systemPrompt || '';
        let newUserTemplate = prompt.userTemplate || '';
        let modified = false;

        // Padrões de DNA Hardcoded para remover
        const patternsToRemove = [
            /CONTEXTO DEL CANAL[\s\S]*?(?=---)/g,
            /FÓRMULA-MADRE[\s\S]*?(?=---)/g,
            /DISTRIBUCIÓN DE TEMAS[\s\S]*?(?=---)/g,
            /Perfil:[\s\S]*?(?=---)/i,
            /Narradora:[\s\S]*?(?=---)/i,
            /# DNA DEL CANAL[\s\S]*?(?=#)/g, // variação em markdown headings
            /CONTEXTO DO CANAL[\s\S]*?(?=---)/g // variação pt
        ];

        // Header de injeção padrão
        const injectionHeader = `
# DNA & CONTEXTO GLOBAL
(Ver KB 'graciela-dna-tier1' injectado acima)
- Canal, Narradora, Público, Nicho e Fórmula-Madre são definidos no KB.
- Siga estritamente as diretrizes do DNA.
`;

        // Verifica se já tem o header
        const hasHeader = newSystemPrompt.includes('DNA & CONTEXTO GLOBAL') || newUserTemplate.includes('DNA & CONTEXTO GLOBAL');

        // Remove duplicatas no System Prompt
        /*
        for (const pattern of patternsToRemove) {
            if (pattern.test(newSystemPrompt)) {
                newSystemPrompt = newSystemPrompt.replace(pattern, '');
                modified = true;
                console.log('   - Removido bloco DNA do System Prompt');
            }
        }
         */

        // A estratégia de regex é arriscada em prompts grandes. 
        // Vamos ser mais cirúrgicos: Se é um dos passos conhecidos por ter o DNA hardcoded no inicio,
        // vamos substituir o cabeçalho.

        if (step.promptSlug === 'graciela.ideacao.v2' ||
            step.promptSlug === 'graciela.tags.v2' ||
            step.promptSlug === 'graciela.titulo.v2' ||
            step.promptSlug === 'graciela.miniaturas.v2' ||
            step.promptSlug === 'graciela.descricao.v2' ||
            step.promptSlug === 'graciela.comunidade.v2') {

            // Nestes prompts v2, o DNA costuma estar no topo do System Prompt ou User Template.
            // Vou substituir referências explícitas.

            if (newSystemPrompt.includes('CONTEXTO DEL CANAL')) {
                // Tenta remover até PRINCIPIOS (Ideacao)
                newSystemPrompt = newSystemPrompt.replace(
                    /CONTEXTO DEL CANAL:[\s\S]*?(?=PRINCIPIOS:|# PRINCIPIOS)/i,
                    `# DNA DO CANAL\nVer KB anexado (graciela-dna-tier1).\n\n`
                );

                // Tenta remover até --- (Tags, Descricao, etc)
                newSystemPrompt = newSystemPrompt.replace(
                    /CONTEXTO DEL CANAL:[\s\S]*?(?=---)/i,
                    `# DNA DO CANAL\nVer KB anexado (graciela-dna-tier1).\n\n`
                );

                modified = true;
            }

            if (newSystemPrompt.includes('FÓRMULA-MADRE')) {
                newSystemPrompt = newSystemPrompt.replace(/FÓRMULA-MADRE[\s\S]*?(?=\n\n|\n[A-Z])/g, '');
                modified = true;
            }

            if (newSystemPrompt.includes('DISTRIBUCIÓN DE TEMAS')) {
                newSystemPrompt = newSystemPrompt.replace(/DISTRIBUCIÓN DE TEMAS[\s\S]*?(?=\n\n|\n[A-Z])/g, '');
                modified = true;
            }
        }

        if (modified) {
            await db.update(schema.prompts)
                .set({
                    systemPrompt: newSystemPrompt,
                    updatedAt: new Date().toISOString()
                })
                .where(eq(schema.prompts.id, prompt.id));
            console.log(`   📝 Prompt atualizado (System Prompt limpo)`);
        } else {
            console.log(`   ✨ Prompt parece limpo ou regex não casou.`);
        }
    }

    console.log('\n✅ Auditoria e Correção SSOT concluída!');
}

main().catch(console.error);

/**
 * Script para reorganizar KBs e atualizar prompts
 * 
 * 1. Atualiza planejamento.v3 para referenciar estilo-escrita-v1
 * 2. Remove técnicas inline duplicadas
 * 3. Simplifica seção de técnicas
 */

import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

async function main() {
    const db = getDb();

    // 1. Buscar prompt atual
    const [prompt] = await db.select()
        .from(schema.prompts)
        .where(eq(schema.prompts.slug, 'graciela.planejamento.v3'));

    if (!prompt) {
        console.error('Prompt não encontrado');
        return;
    }

    // 2. Atualizar seção de TÉCNICAS NARRATIVAS para referenciar KB
    let newTemplate = prompt.userTemplate;

    // Substituir seção inline de técnicas por referência a KB
    const oldTecnicas = `# TÉCNICAS NARRATIVAS OBLIGATORIAS

1. **15+ números específicos** (por extenso)
2. **4 revelaciones en capas** (25%, 50%, 75%, 90%)
3. **6-10 micro-tensiones** distribuidas
4. **3-5 objetos simbólicos** con arco completo
5. **Karma en 4 capas** (emocional, social, material, legado)
6. **2-3 frases quotables** para Shorts`;

    const newTecnicas = `# TÉCNICAS NARRATIVAS (ver KBs)

**ESTRUTURA (já calculada por timestamp):**
- Hook: ver KB biblioteca-hooks (15 tipos)
- Escalada: ver KB biblioteca-escaladas (12 tipos)
- Clímax/Karma: ver KB biblioteca-karma (10+8 tipos)

**ESTILO DE ESCRITA (ver KB biblioteca-estilo-escrita):**
- Ritmo Build-up + Punch
- Cuantificação Precisa (15+ números por extenso)
- Momentos de Quase Descoberta

**OBRIGATÓRIO EM CADA ROTEIRO:**
1. 15+ números específicos (por extenso)
2. 4 revelaciones en capas (25%, 50%, 75%, 90%)
3. 6-10 micro-tensiones distribuidas
4. 3-5 objetos simbólicos con arco completo
5. Karma en 4 capas (emocional, social, material, legado)
6. 2-3 frases quotables para Shorts`;

    newTemplate = newTemplate.replace(oldTecnicas, newTecnicas);

    // 3. Atualizar no banco
    await db.update(schema.prompts)
        .set({
            userTemplate: newTemplate,
            updatedAt: new Date().toISOString()
        })
        .where(eq(schema.prompts.slug, 'graciela.planejamento.v3'));

    console.log('✅ [1/2] planejamento.v3 atualizado com referências a KBs');

    // 4. Verificar roteiro.v3 também
    const [roteiro] = await db.select()
        .from(schema.prompts)
        .where(eq(schema.prompts.slug, 'graciela.roteiro.v3'));

    if (roteiro) {
        // Atualizar seção de técnicas no roteiro também
        let newRoteiro = roteiro.userTemplate;

        const oldRoteiroTecnicas = `# TÉCNICAS DEL PLAN (EJECUTAR TODAS)

1. **Revelaciones en 4 capas** - usar las del plan
2. **Micro-tensiones** - posicionar las del plan
3. **Objetos simbólicos** - desarrollar arcos completos
4. **Karma 4 capas** - ejecutar en Acto 6
5. **Frases quotables** - insertar con pausas`;

        const newRoteiroTecnicas = `# TÉCNICAS NARRATIVAS (del plano + KBs)

**EXECUTAR DO PLANO:**
- Revelaciones en 4 capas (del campo "tecnicas_narrativas")
- Micro-tensiones (posicionar según el plano)
- Objetos simbólicos (desarrollar arcos completos del plano)
- Karma 4 capas (ejecutar en Acto 6)
- Frases quotables (insertar con pausas)

**ESTILO DE ESCRITA (ver KB biblioteca-estilo-escrita):**
- Ritmo Build-up + Punch (10 momentos mínimo)
- Cuantificação: 15+ números por extenso
- Momentos de Quase Descoberta: 2-3 por roteiro`;

        newRoteiro = newRoteiro.replace(oldRoteiroTecnicas, newRoteiroTecnicas);

        await db.update(schema.prompts)
            .set({
                userTemplate: newRoteiro,
                updatedAt: new Date().toISOString()
            })
            .where(eq(schema.prompts.slug, 'graciela.roteiro.v3'));

        console.log('✅ [2/2] roteiro.v3 atualizado com referências a KBs');
    }

    // 5. Verificar estado final dos KBs
    const kbs = await db.select({
        slug: schema.knowledgeBase.slug,
        name: schema.knowledgeBase.name,
        isActive: schema.knowledgeBase.isActive,
    }).from(schema.knowledgeBase);

    console.log('\n📋 Estado final dos KBs:');
    for (const kb of kbs) {
        const status = kb.isActive ? '✅' : '❌';
        console.log(`${status} ${kb.slug}: ${kb.name}`);
    }
}

main().catch(console.error);

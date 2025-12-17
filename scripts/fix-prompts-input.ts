/**
 * Script de Correção: Adiciona INPUT section a todos os prompts
 * 
 * Problema: Prompts v2 têm instruções mas não consomem variáveis
 * Solução: Adicionar seção de INPUT no final de cada user_template
 */

import { getDb, schema } from "../lib/db";
import { eq } from "drizzle-orm";

// Mapeamento de slug → variáveis que deve consumir
const PROMPT_INPUT_SECTIONS: Record<string, string> = {
    "graciela.titulo.v2": `

---

# ═══════════════════════════════════════════════════════════════════
# INPUT PARA PROCESSAMENTO
# ═══════════════════════════════════════════════════════════════════

## IDEAÇÃO DO VÍDEO:
{{ ideacao }}

## TIMESTAMP PARA VARIAÇÃO:
{{ timestamp }}

---

# ═══════════════════════════════════════════════════════════════════
# INSTRUÇÃO FINAL
# ═══════════════════════════════════════════════════════════════════

AGORA, com base na IDEAÇÃO acima, GERA 5 TÍTULOS VIRAIS rankeados.
Segue EXATAMENTE o formato de OUTPUT especificado nas instruções.
NÃO peça input adicional. O input está acima. EXECUTA AGORA.
`,

    "graciela.planejamento.v3": `

---

# ═══════════════════════════════════════════════════════════════════
# INPUT PARA PROCESSAMENTO
# ═══════════════════════════════════════════════════════════════════

## IDEAÇÃO:
{{ ideacao }}

## TÍTULO SELECIONADO:
{{ titulo }}

## TIMESTAMP PARA VARIAÇÃO:
{{ timestamp }}

## DURAÇÃO:
{{ duracao }} minutos

---

GERA O PLANO ESTRUTURADO AGORA. APENAS JSON VÁLIDO, SEM EXPLICAÇÕES.
`,

    "graciela.roteiro.v3": `

---

# ═══════════════════════════════════════════════════════════════════
# INPUT PARA PROCESSAMENTO  
# ═══════════════════════════════════════════════════════════════════

## PLANO ESTRUTURADO:
{{ planejamento }}

## DURAÇÃO ALVO:
{{ duracao }} minutos (~{{ duracao * 130 }} palavras)

---

ESCREVE O ROTEIRO COMPLETO AGORA. APENAS TEXTO NARRATIVO PURO.
`,

    "graciela.miniaturas.v2": `

---

# ═══════════════════════════════════════════════════════════════════
# INPUT PARA PROCESSAMENTO
# ═══════════════════════════════════════════════════════════════════

## IDEAÇÃO:
{{ ideacao }}

## TÍTULO:
{{ titulo }}

## PLANEJAMENTO:
{{ planejamento }}

---

GERA OS 3 CONCEITOS DE THUMBNAIL AGORA com prompts para IA.
Formato JSON conforme especificado. NÃO peça input adicional.
`,

    "graciela.descricao.v2": `

---

# ═══════════════════════════════════════════════════════════════════
# INPUT PARA PROCESSAMENTO
# ═══════════════════════════════════════════════════════════════════

## TÍTULO DO VÍDEO:
{{ titulo }}

## IDEAÇÃO:
{{ ideacao }}

## PLANEJAMENTO:
{{ planejamento }}

## ROTEIRO (resumo):
{{ roteiro }}

---

GERA A DESCRIÇÃO COMPLETA AGORA. Formato especificado nas instruções.
NÃO peça input adicional. EXECUTA AGORA.
`,

    "graciela.tags.v2": `

---

# ═══════════════════════════════════════════════════════════════════
# INPUT PARA PROCESSAMENTO
# ═══════════════════════════════════════════════════════════════════

## TÍTULO:
{{ titulo }}

## IDEAÇÃO:
{{ ideacao }}

## PLANEJAMENTO:
{{ planejamento }}

---

GERA AS TAGS AGORA. Lista de 15-20 tags otimizadas, separadas por vírgula.
NÃO peça input adicional.
`,

    "graciela.comunidade.v2": `

---

# ═══════════════════════════════════════════════════════════════════
# INPUT PARA PROCESSAMENTO
# ═══════════════════════════════════════════════════════════════════

## TÍTULO DO VÍDEO:
{{ titulo }}

## IDEAÇÃO:
{{ ideacao }}

## PLANEJAMENTO:
{{ planejamento }}

---

GERA O POST DE COMUNIDADE AGORA. Formato especificado nas instruções.
NÃO peça input adicional. EXECUTA AGORA.
`,

    "graciela.ideacao.v2": `

---

# ═══════════════════════════════════════════════════════════════════
# INPUT PARA PROCESSAMENTO
# ═══════════════════════════════════════════════════════════════════

## TEMA/IDEIA DO USUÁRIO:
{{ tema }}

## TIMESTAMP PARA VARIAÇÃO:
{{ timestamp }}

---

GERA A IDEAÇÃO COMPLETA AGORA. Formato especificado nas instruções.
NÃO peça input adicional. EXECUTA AGORA.
`,
};

async function fixPrompts(): Promise<void> {
    console.log("🔧 Corrigindo prompts com INPUT sections...\n");

    const db = getDb();
    const now = new Date().toISOString();

    for (const [slug, inputSection] of Object.entries(PROMPT_INPUT_SECTIONS)) {
        console.log(`📝 Processando: ${slug}`);

        try {
            // Load current prompt
            const [prompt] = await db.select().from(schema.prompts).where(eq(schema.prompts.slug, slug));

            if (!prompt) {
                console.log(`   ⚠️ Prompt não encontrado: ${slug}`);
                continue;
            }

            // Check if already has INPUT section
            if (prompt.userTemplate?.includes("INPUT PARA PROCESSAMENTO")) {
                console.log(`   ✅ Já tem INPUT section, pulando`);
                continue;
            }

            // Append input section
            const newUserTemplate = (prompt.userTemplate || "") + inputSection;

            await db.update(schema.prompts).set({
                userTemplate: newUserTemplate,
                updatedAt: now,
            }).where(eq(schema.prompts.slug, slug));

            console.log(`   ✅ INPUT section adicionada (${inputSection.length} chars)`);
        } catch (error) {
            console.log(`   ❌ Erro: ${error}`);
        }
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ Correção concluída!");
    console.log("=".repeat(50));

    process.exit(0);
}

fixPrompts().catch(console.error);

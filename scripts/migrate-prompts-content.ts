/**
 * Script de Migração: Atualiza prompts com conteúdo real dos arquivos de referência
 * 
 * Problema: Prompts no banco têm apenas placeholders apontando para arquivos
 * Solução: Ler arquivos de referência e atualizar system_prompt e user_template
 */

import { getDb, schema } from "../lib/db";
import { eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

const REFERENCE_DIR = "./docs/02-features/prompts/graciela/reference";

// Mapeamento slug -> arquivo de referência
const PROMPT_FILES: Record<string, string> = {
    "graciela.ideacao.v2": "ideacao-v2.md",
    "graciela.titulo.v2": "titulo-v2.md",
    "graciela.planejamento.v2": "planejamento-v2.md",
    "graciela.roteiro.v2": "roteiro-v2.md",
    "graciela.miniaturas.v2": "miniaturas-v2.md",
    "graciela.descricao.v2": "descricao-v2.md",
    "graciela.tags.v2": "tags-v2.md",
    "graciela.comunidade.v2": "comunidade-v2.md",
};

/**
 * Extrai SYSTEM PROMPT do arquivo markdown
 */
function extractSystemPrompt(content: string): string {
    // Procura por ## SYSTEM PROMPT seguido de bloco de código
    const systemMatch = content.match(/##\s*SYSTEM\s*PROMPT[\s\S]*?```([\s\S]*?)```/i);
    if (systemMatch) {
        return systemMatch[1].trim();
    }

    // Fallback: procura por texto após "## SYSTEM PROMPT" até próximo ##
    const fallbackMatch = content.match(/##\s*SYSTEM\s*PROMPT\s*\n([\s\S]*?)(?=\n##|\n---)/i);
    if (fallbackMatch) {
        return fallbackMatch[1].trim();
    }

    return "";
}

/**
 * Extrai USER TEMPLATE - todo o conteúdo útil do arquivo
 * (exclui metadata e system prompt)
 */
function extractUserTemplate(content: string): string {
    // Remove metadata do topo (título, versão, etc)
    let cleaned = content;

    // Remove tudo antes de "---" seguido de conteúdo útil
    const parts = content.split(/\n---\n/);
    if (parts.length > 1) {
        // Pega tudo após o primeiro separador
        cleaned = parts.slice(1).join("\n---\n");
    }

    // Remove o bloco SYSTEM PROMPT (já extraído separadamente)
    cleaned = cleaned.replace(/##\s*SYSTEM\s*PROMPT[\s\S]*?```[\s\S]*?```/gi, "");

    // Limpa linhas em branco excessivas
    cleaned = cleaned.replace(/\n{3,}/g, "\n\n").trim();

    return cleaned;
}

async function migratePrompts() {
    console.log("🚀 Iniciando migração de prompts...\n");

    const db = getDb();
    let successCount = 0;
    let errorCount = 0;

    for (const [slug, filename] of Object.entries(PROMPT_FILES)) {
        const filepath = path.join(REFERENCE_DIR, filename);

        console.log(`📄 Processando: ${slug}`);

        // Verificar se arquivo existe
        if (!fs.existsSync(filepath)) {
            console.log(`   ❌ ERRO: Arquivo não encontrado: ${filepath}`);
            errorCount++;
            continue;
        }

        // Ler conteúdo
        const content = fs.readFileSync(filepath, "utf-8");
        console.log(`   📊 Tamanho do arquivo: ${content.length} bytes`);

        // Extrair partes
        const systemPrompt = extractSystemPrompt(content);
        const userTemplate = extractUserTemplate(content);

        console.log(`   📝 System Prompt: ${systemPrompt.length} chars`);
        console.log(`   📝 User Template: ${userTemplate.length} chars`);

        if (!systemPrompt && !userTemplate) {
            console.log(`   ⚠️ AVISO: Nenhum conteúdo extraído`);
            errorCount++;
            continue;
        }

        // Atualizar no banco
        try {
            await db.update(schema.prompts).set({
                systemPrompt: systemPrompt || undefined,
                userTemplate: userTemplate || undefined,
                updatedAt: new Date().toISOString(),
            }).where(eq(schema.prompts.slug, slug));

            console.log(`   ✅ Atualizado com sucesso!\n`);
            successCount++;
        } catch (error) {
            console.log(`   ❌ ERRO ao atualizar: ${error}`);
            errorCount++;
        }
    }

    console.log("\n" + "=".repeat(50));
    console.log(`✅ Migração concluída!`);
    console.log(`   Sucesso: ${successCount}`);
    console.log(`   Erros: ${errorCount}`);
    console.log("=".repeat(50));

    process.exit(0);
}

migratePrompts().catch(console.error);

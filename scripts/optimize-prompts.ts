/**
 * Script de Otimização: Limpa referências n8n e otimiza todos os prompts
 * 
 * Remove: sintaxe n8n, seções de variáveis n8n
 * Garante: INPUT sections corretas, outputs esperados
 */

import { getDb, schema } from "../lib/db";
import { eq } from "drizzle-orm";

async function optimizePrompts(): Promise<void> {
    console.log("🔧 Otimizando prompts para nosso sistema...\n");

    const db = getDb();
    const now = new Date().toISOString();

    // 1. Limpar referências n8n de descricao.v2
    console.log("📝 Limpando descricao.v2...");
    const [descricao] = await db.select().from(schema.prompts).where(eq(schema.prompts.slug, "graciela.descricao.v2"));
    if (descricao) {
        let template = descricao.userTemplate || "";

        // Remover seção "# VARIÁVEIS n8n" completamente
        template = template.replace(/# VARIÁVEIS n8n[\s\S]*?```[\s\S]*?```\n+---/g, "---");

        // Remover qualquer {{ $('...') }} restante
        template = template.replace(/\{\{\s*\$\('[^']*'\)[^}]*\}\}/g, "[ver planejamento]");

        await db.update(schema.prompts).set({
            userTemplate: template,
            updatedAt: now,
        }).where(eq(schema.prompts.slug, "graciela.descricao.v2"));
        console.log("   ✅ Referências n8n removidas");
    }

    // 2. Verificar e corrigir max_tokens do roteiro para garantir output longo
    console.log("\n📝 Ajustando roteiro.v3 para garantir 8000+ palavras...");
    const [roteiro] = await db.select().from(schema.prompts).where(eq(schema.prompts.slug, "graciela.roteiro.v3"));
    if (roteiro) {
        // Aumentar max_tokens se necessário
        if (roteiro.maxTokens < 32000) {
            await db.update(schema.prompts).set({
                maxTokens: 32000, // Aumentar para permitir roteiros longos
                updatedAt: now,
            }).where(eq(schema.prompts.slug, "graciela.roteiro.v3"));
            console.log(`   ✅ max_tokens aumentado: ${roteiro.maxTokens} → 32000`);
        }
    }

    // 3. Verificar se ideacao tem output format claro
    console.log("\n📝 Verificando ideacao.v2...");
    const [ideacao] = await db.select().from(schema.prompts).where(eq(schema.prompts.slug, "graciela.ideacao.v2"));
    if (ideacao && ideacao.userTemplate) {
        // Verificar se tem seção de INPUT
        if (!ideacao.userTemplate.includes("INPUT PARA PROCESSAMENTO")) {
            console.log("   ⚠️ Falta INPUT section no ideacao");
        } else {
            console.log("   ✅ INPUT section presente");
        }
    }

    // 4. Verificar planejamento.v3
    console.log("\n📝 Verificando planejamento.v3...");
    const [plan] = await db.select().from(schema.prompts).where(eq(schema.prompts.slug, "graciela.planejamento.v3"));
    if (plan) {
        // Aumentar max_tokens se necessário
        if (plan.maxTokens < 16384) {
            await db.update(schema.prompts).set({
                maxTokens: 16384,
                updatedAt: now,
            }).where(eq(schema.prompts.slug, "graciela.planejamento.v3"));
            console.log(`   ✅ max_tokens aumentado: ${plan.maxTokens} → 16384`);
        } else {
            console.log(`   ✅ max_tokens OK: ${plan.maxTokens}`);
        }
    }

    // 5. Listar status final de todos os prompts
    console.log("\n📊 STATUS FINAL DOS PROMPTS:\n");
    const allPrompts = await db.select().from(schema.prompts).where(eq(schema.prompts.isActive, true));

    for (const p of allPrompts.filter(x => x.slug.startsWith("graciela."))) {
        const hasInput = p.userTemplate?.includes("INPUT PARA PROCESSAMENTO") || false;
        const hasN8n = p.userTemplate?.includes("$('") || false;
        const status = hasInput && !hasN8n ? "✅" : hasN8n ? "❌ n8n" : "⚠️ sem INPUT";
        console.log(`${status} ${p.slug} (${p.maxTokens} tokens)`);
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ Otimização concluída!");
    console.log("=".repeat(50));

    process.exit(0);
}

optimizePrompts().catch(console.error);

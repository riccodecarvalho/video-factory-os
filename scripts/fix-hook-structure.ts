"use server";

/**
 * Script para corrigir estrutura de hook nos prompts
 * 
 * Problema: O prompt planejamento.v3 gera hooks que começam com "Mi nombre es [Protagonista]"
 * Solução: Separar em hook_agressivo (ação pura) + intro_graciela (apresentação)
 */

import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

async function fixHookStructure() {
    const db = getDb();

    console.log("=== CORRIGINDO ESTRUTURA DE HOOK NOS PROMPTS ===\n");

    // 1. Verificar prompt planejamento.v3
    const [planejamento] = await db.select()
        .from(schema.prompts)
        .where(eq(schema.prompts.slug, "graciela.planejamento.v3"));

    if (!planejamento) {
        console.log("❌ Prompt graciela.planejamento.v3 não encontrado");
        return;
    }

    console.log("✅ Encontrado graciela.planejamento.v3");

    // 2. Novo bloco de hook_detalhado com estrutura correta
    const novoHookBlock = `"hook_detallado": {
    "framework": "nombre del tipo seleccionado",
    "hook_agressivo": "~100 palabras, 30-40 segundos. SIN NOMBRES, SIN PRESENTACIONES. Solo acción, tensión, drama puro. Ej: 'Veinticuatro horas. Eso fue todo lo que tardaron en destruir cincuenta años de vida...'",
    "intro_graciela": "Hola, soy Graciela. Y esta es la historia de [NOMBRE], una mujer de [EDAD] años que [GANCHO]. Pero antes de contarte [PROMESA], verifica si ya estás suscrito al canal.",
    "elementos_obligatorios": {
      "timestamp": "hora específica",
      "numero_testigos": "número específico",
      "stakes_cuantificados": "string",
      "promesa_karma": "string"
    }
  }`;

    // Substituir o bloco antigo
    const antigoHookBlock = `"hook_detallado": {
    "framework": "nombre del tipo seleccionado",
    "texto_hook": "~150 palabras, 40 segundos",
    "elementos_obligatorios": {
      "timestamp": "hora específica",
      "numero_testigos": "número específico",
      "stakes_cuantificados": "string",
      "promesa_karma": "string"
    }
  }`;

    let newUserTemplate = planejamento.userTemplate.replace(antigoHookBlock, novoHookBlock);

    // Também adicionar instrução explícita sobre a estrutura
    const instrucaoHook = `
# ESTRUCTURA DEL INICIO DEL VIDEO (OBLIGATORIO)

La estructura del inicio DEBE ser:

## 1. HOOK AGRESSIVO (0:00 - 0:40)
- 100% ACCIÓN DRAMÁTICA
- PROHIBIDO: nombres, presentaciones, "Mi nombre es..."
- PERMITIDO: números, timestamps, tensión, misterio
- Ejemplo: "Veinticuatro horas. Eso fue todo lo que tardaron en destruir cincuenta años de vida. A las tres de la tarde, una mentira. A las seis, una casa vacía. A las nueve, una mujer de sesenta y ocho años llorando en un asilo. Pero lo que no sabían... es que esa mujer tenía cinco millones escondidos."

## 2. PRESENTACIÓN GRACIELA (0:40 - 1:00)
- "Hola, soy Graciela. Y esta es la historia de [NOMBRE], una mujer de [EDAD] años que [RESUMEN_DRAMA]."
- CTA de suscripción aquí

## 3. HISTORIA EN PRIMERA PERSONA (1:00+)
- "Mi nombre es [NOMBRE]. Tengo [EDAD] años..."
- Aquí SÍ se presenta la protagonista

`;

    // Adicionar instrução se não existir
    if (!newUserTemplate.includes("HOOK AGRESSIVO")) {
        // Inserir antes de "# DNA DEL CANAL" ou no início
        if (newUserTemplate.includes("# DNA DEL CANAL")) {
            newUserTemplate = newUserTemplate.replace("# DNA DEL CANAL", instrucaoHook + "\n# DNA DEL CANAL");
        } else {
            newUserTemplate = instrucaoHook + "\n" + newUserTemplate;
        }
    }

    // Salvar
    await db.update(schema.prompts)
        .set({
            userTemplate: newUserTemplate,
            updatedAt: new Date().toISOString()
        })
        .where(eq(schema.prompts.id, planejamento.id));

    console.log("✅ planejamento.v3 atualizado com nova estrutura de hook");

    // 3. Verificar prompt roteiro.v3
    const [roteiro] = await db.select()
        .from(schema.prompts)
        .where(eq(schema.prompts.slug, "graciela.roteiro.v3"));

    if (roteiro) {
        console.log("\n✅ Verificando graciela.roteiro.v3...");

        // Garantir que roteiro execute a estrutura correta
        const novaArquitetura = `# ARQUITECTURA DEL GUIÓN (OBLIGATORIO)

## [0:00-0:40] HOOK AGRESSIVO
- Ejecutar el "hook_agressivo" del plan
- 100% acción, CERO nombres, CERO presentaciones
- Solo drama, tensión, números, timestamps

## [0:40-1:00] PRESENTACIÓN GRACIELA  
- Ejecutar el "intro_graciela" del plan
- "Hola, soy Graciela. Y esta es la historia de [NOMBRE]..."
- Incluir CTA de suscripción

## [1:00+] HISTORIA EN PRIMERA PERSONA
- AQUÍ es donde aparece: "Mi nombre es [PROTAGONISTA]. Tengo [EDAD] años..."
- Narrar como si fueras la protagonista
- Seguir estructura de 7 actos del plan

## [FINAL] CIERRE GRACIELA
- Time skip del plan (epílogo)
- Estado actual protagonista y villano
- Lección moral
- CTA: "Si te tocó el corazón, compártela"`;

        let roteiroTemplate = roteiro.userTemplate;

        // Remover arquitetura antiga e inserir nova
        const arquiteturaRegex = /# ARQUITECTURA DEL GUIÓN[\s\S]*?(?=\n# REGLAS DE ESCRITURA|\n---\n# REGLAS)/;

        if (arquiteturaRegex.test(roteiroTemplate)) {
            roteiroTemplate = roteiroTemplate.replace(arquiteturaRegex, novaArquitetura + "\n\n");
        }

        await db.update(schema.prompts)
            .set({
                userTemplate: roteiroTemplate,
                updatedAt: new Date().toISOString()
            })
            .where(eq(schema.prompts.id, roteiro.id));

        console.log("✅ roteiro.v3 atualizado com arquitetura correta");
    }

    console.log("\n=== CORREÇÃO CONCLUÍDA ===");
    console.log("\nEstrutura agora:");
    console.log("1. hook_agressivo: Ação pura sem nomes");
    console.log("2. intro_graciela: Apresentação pela Graciela");
    console.log("3. História em 1ª pessoa: Depois no roteiro");
}

// Executar
fixHookStructure().then(() => {
    console.log("\n✅ Script finalizado");
    process.exit(0);
}).catch(err => {
    console.error("❌ Erro:", err);
    process.exit(1);
});

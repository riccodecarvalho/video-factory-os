/**
 * Export Knowledge Base + Prompts para Claude Project
 * 
 * Gera arquivos markdown otimizados para uso no Claude Project
 * permitindo comparação de qualidade entre sistemas.
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

const db = new Database('video-factory.db');
const OUTPUT_DIR = 'export/claude-project';

interface Prompt {
    slug: string;
    name: string;
    category: string;
    description: string | null;
    system_prompt: string | null;
    user_template: string;
    model: string;
    max_tokens: number;
    temperature: number;
}

interface KnowledgeBase {
    slug: string;
    name: string;
    tier: string;
    category: string;
    content: string;
}

function getPromptsByChannel(channel: 'graciela' | 'vj'): Prompt[] {
    const prefix = channel === 'graciela' ? 'graciela.' : 'vj.';
    return db.prepare(`
        SELECT slug, name, category, description, system_prompt, user_template, model, max_tokens, temperature
        FROM prompts 
        WHERE slug LIKE ? AND is_active = 1
        ORDER BY slug
    `).all(`${prefix}%`) as Prompt[];
}

function getKBsByChannel(channel: 'graciela' | 'vj'): KnowledgeBase[] {
    const prefix = channel === 'graciela' ? 'graciela-' : 'vj-';
    return db.prepare(`
        SELECT slug, name, tier, category, content
        FROM knowledge_base 
        WHERE slug LIKE ? AND is_active = 1
        ORDER BY 
            CASE tier
                WHEN 'tier1' THEN 1
                WHEN 'tier2' THEN 2
                WHEN 'tier3' THEN 3
            END,
            slug
    `).all(`${prefix}%`) as KnowledgeBase[];
}

function generateChannelDoc(channel: 'graciela' | 'vj'): string {
    const prompts = getPromptsByChannel(channel);
    const kbs = getKBsByChannel(channel);

    const channelName = channel === 'graciela'
        ? 'Verdades de Graciela (ES-MX)'
        : 'Virando o Jogo (PT-BR)';

    let doc = `# ${channelName} - Base de Conhecimento Completa

> Exportado em: ${new Date().toISOString().split('T')[0]}
> Total: ${prompts.length} prompts, ${kbs.length} knowledge bases

---

## 📚 KNOWLEDGE BASES

`;

    // Agrupar KBs por tier
    const tier1 = kbs.filter(kb => kb.tier === 'tier1');
    const tier2 = kbs.filter(kb => kb.tier === 'tier2');
    const tier3 = kbs.filter(kb => kb.tier === 'tier3');

    if (tier1.length > 0) {
        doc += `### Tier 1: DNA (Sempre Carregado)\n\n`;
        for (const kb of tier1) {
            doc += `#### ${kb.name}\n\n${kb.content}\n\n---\n\n`;
        }
    }

    if (tier2.length > 0) {
        doc += `### Tier 2: Bibliotecas (Contexto Específico)\n\n`;
        for (const kb of tier2) {
            doc += `#### ${kb.name}\n\n${kb.content}\n\n---\n\n`;
        }
    }

    if (tier3.length > 0) {
        doc += `### Tier 3: Referências (Sob Demanda)\n\n`;
        for (const kb of tier3) {
            doc += `#### ${kb.name}\n\n${kb.content}\n\n---\n\n`;
        }
    }

    // Prompts
    doc += `## 🎯 PROMPTS DE GERAÇÃO\n\n`;

    for (const prompt of prompts) {
        doc += `### ${prompt.name} (\`${prompt.slug}\`)\n\n`;
        doc += `**Categoria:** ${prompt.category} | **Modelo:** ${prompt.model} | **Tokens:** ${prompt.max_tokens} | **Temp:** ${prompt.temperature}\n\n`;

        if (prompt.description) {
            doc += `> ${prompt.description}\n\n`;
        }

        if (prompt.system_prompt) {
            doc += `**System Prompt:**\n\`\`\`\n${prompt.system_prompt}\n\`\`\`\n\n`;
        }

        doc += `**User Prompt Template:**\n\`\`\`\n${prompt.user_template}\n\`\`\`\n\n---\n\n`;
    }

    return doc;
}

function generateReadme(): string {
    return `# 📘 Video Factory OS - Claude Project Export

## Como Usar

1. Crie um novo projeto no [Claude Projects](https://claude.ai/projects)
2. Adicione o arquivo do canal desejado como knowledge:
   - \`GRACIELA-COMPLETO.md\` para "Verdades de Graciela" (ES-MX)
   - \`VJ-COMPLETO.md\` para "Virando o Jogo" (PT-BR)
3. Use o \`PIPELINE.md\` como referência para o fluxo de geração

## Arquivos

| Arquivo | Descrição |
|---------|-----------|
| \`GRACIELA-COMPLETO.md\` | DNA + KBs + Prompts do canal Graciela |
| \`VJ-COMPLETO.md\` | DNA + KBs + Prompts do canal VJ |
| \`PIPELINE.md\` | Fluxo de geração de vídeo |

## Pipeline de Geração

Para gerar um vídeo completo, siga estas etapas:

1. **Tema Central:** Dê uma ideia inicial (bagunçada mesmo)
2. **Ideação:** Use o prompt de ideação para refinar
3. **Título:** Gere opções de títulos virais
4. **Planejamento:** Estruture a história com revelações progressivas
5. **Roteiro:** Gere o roteiro completo em Stage Directions

## Formato de Output Esperado

### Stage Directions (Roteiro)

O roteiro deve seguir estas regras:
- NÃO usar SSML nem Markdown
- Começar com \`(voz: NARRADORA)\`
- Usar marcadores de voz: NARRADORA / ANTAGONISTA / OTRO
- Usar pausas: [PAUSA CORTA], [PAUSA], [PAUSA LARGA]
- Mínimo 6000 palavras

---

Exportado em: ${new Date().toISOString().split('T')[0]}
`;
}

function generatePipeline(): string {
    return `# 🎬 Pipeline de Geração de Vídeo

## Fluxo Completo

\`\`\`
Tema Central → Ideação → Título → Planejamento → Roteiro
\`\`\`

## Etapas Detalhadas

### 1. Tema Central (Input do Usuário)

O usuário fornece uma ideia inicial, pode ser:
- Uma frase bagunçada
- Um conceito de história
- Uma situação de humilhação + vingança

**Exemplo:**
> "velha motorista de van humilhada por pais ricos descobre herança"

---

### 2. Ideação (Prompt: ideacao)

Transforma o tema em um conceito estruturado:
- Protagonista
- Conflito
- Emoção alvo
- Keywords

**Output:**
- Conceito central refinado
- Elementos de história

---

### 3. Título (Prompt: titulo)

Gera múltiplas opções de títulos virais:
- 60-80 caracteres
- Hook emocional
- Revelação parcial
- Gatilho de curiosidade

**Output:**
- 5-8 opções de título
- O melhor é selecionado

---

### 4. Planejamento (Prompt: planejamento)

Estrutura a narrativa completa:
- Revelações progressivas (5 beats)
- Espelhamentos (antes/depois)
- Objetos simbólicos
- Ironias dramáticas
- Micro-tensões

**Output:**
- Estrutura detalhada da história
- Blueprint para o roteiro

---

### 5. Roteiro (Prompt: roteiro)

Gera o roteiro completo em Stage Directions:
- Formato específico (não SSML, não Markdown)
- Marcadores de voz
- Pausas dramáticas
- Mínimo 6000 palavras
- Duração: 40-75 minutos

**Output:**
- Roteiro completo em Stage Directions
- Pronto para conversão TTS

---

## Regras Não-Negociáveis

1. **Stage Directions:** Nunca usar SSML ou Markdown no roteiro
2. **Vozes:** Apenas NARRADORA, ANTAGONISTA, OTRO
3. **Pausas:** [PAUSA CORTA], [PAUSA], [PAUSA LARGA]
4. **Extensão:** Mínimo 6000 palavras

---

Exportado em: ${new Date().toISOString().split('T')[0]}
`;
}

// Main execution
console.log('🚀 Iniciando exportação para Claude Project...\n');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Generate files
console.log('📝 Gerando GRACIELA-COMPLETO.md...');
const gracielaDoc = generateChannelDoc('graciela');
fs.writeFileSync(path.join(OUTPUT_DIR, 'GRACIELA-COMPLETO.md'), gracielaDoc);
console.log(`   ✅ ${(gracielaDoc.length / 1024).toFixed(1)} KB\n`);

console.log('📝 Gerando VJ-COMPLETO.md...');
const vjDoc = generateChannelDoc('vj');
fs.writeFileSync(path.join(OUTPUT_DIR, 'VJ-COMPLETO.md'), vjDoc);
console.log(`   ✅ ${(vjDoc.length / 1024).toFixed(1)} KB\n`);

console.log('📝 Gerando README.md...');
const readme = generateReadme();
fs.writeFileSync(path.join(OUTPUT_DIR, 'README.md'), readme);
console.log(`   ✅ ${(readme.length / 1024).toFixed(1)} KB\n`);

console.log('📝 Gerando PIPELINE.md...');
const pipeline = generatePipeline();
fs.writeFileSync(path.join(OUTPUT_DIR, 'PIPELINE.md'), pipeline);
console.log(`   ✅ ${(pipeline.length / 1024).toFixed(1)} KB\n`);

// Summary
const totalSize = gracielaDoc.length + vjDoc.length + readme.length + pipeline.length;
const estimatedTokens = Math.round(totalSize / 4); // ~4 chars per token

console.log('✅ Exportação concluída!\n');
console.log(`📊 Resumo:`);
console.log(`   - Total: ${(totalSize / 1024).toFixed(1)} KB`);
console.log(`   - Tokens estimados: ~${estimatedTokens.toLocaleString()}`);
console.log(`   - Arquivos em: ${OUTPUT_DIR}/`);

db.close();

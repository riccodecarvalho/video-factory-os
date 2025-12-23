/**
 * SEED: Prompts Graciela v2
 * 
 * Migra os 8 prompts evolvidos do diretório z- tmp/3/
 * para o banco de dados com versionamento v2.
 * 
 * Decisões implementadas:
 * 1. Pipeline completo (8 prompts LLM)
 * 2. Substituir brief.v1 por planejamento.v2
 * 3. Armazenamento no banco SQLite
 * 4. Step keys em PT-BR
 * 5. Todos resetados para v2
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import Database from 'better-sqlite3';
import { nanoid } from 'nanoid';

const PROMPTS_DIR = join(process.cwd(), 'z- tmp/3');
const DB_PATH = join(process.cwd(), 'video-factory.db');

interface PromptFile {
    filename: string;
    slug: string;
    name: string;
    category: string;
    description: string;
    model: string;
    maxTokens: number;
    temperature: number;
}

// Mapeamento de arquivos .md → metadados
const PROMPTS: PromptFile[] = [
    {
        filename: 'prompt-ideacao-v1.md',
        slug: 'graciela.ideacao.v2',
        name: 'Graciela - Ideação de Histórias',
        category: 'ideacao',
        description: 'Gera ideias de histórias originais para o canal',
        model: 'claude-sonnet-4-5-20250929',
        maxTokens: 4096,
        temperature: 0.8
    },
    {
        filename: 'prompt-titulos-v4.md',
        slug: 'graciela.titulo.v2',
        name: 'Graciela - Títulos Virais',
        category: 'titulo',
        description: 'Gera títulos virais otimizados para CTR',
        model: 'claude-sonnet-4-5-20250929',
        maxTokens: 4096,
        temperature: 0.6
    },
    {
        filename: 'prompt-planejamento-v4.md',
        slug: 'graciela.planejamento.v2',
        name: 'Graciela - Planejamento Estruturado',
        category: 'planejamento',
        description: 'Cria plano narrativo JSON estruturado com 7 atos e 32 técnicas',
        model: 'claude-sonnet-4-5-20250929',
        maxTokens: 16000,
        temperature: 0.7
    },
    {
        filename: 'prompt-roteiro-v3.md',
        slug: 'graciela.roteiro.v2',
        name: 'Graciela - Roteiro Narrado',
        category: 'roteiro',
        description: 'Gera roteiro completo em texto narrativo pronto para TTS',
        model: 'claude-sonnet-4-5-20250929',
        maxTokens: 16000,
        temperature: 0.7
    },
    {
        filename: 'prompt-thumbnails-v3.md',
        slug: 'graciela.miniaturas.v2',
        name: 'Graciela - Miniaturas (Thumbnails)',
        category: 'miniaturas',
        description: 'Gera prompts de imagem para thumbnails virais com layout ANTES→DEPOIS',
        model: 'claude-sonnet-4-5-20250929',
        maxTokens: 4096,
        temperature: 0.3
    },
    {
        filename: 'prompt-descricao-v1.md',
        slug: 'graciela.descricao.v2',
        name: 'Graciela - Descrição YouTube',
        category: 'descricao',
        description: 'Gera descrição otimizada SEO + comentário fixado',
        model: 'claude-sonnet-4-5-20250929',
        maxTokens: 4096,
        temperature: 0.5
    },
    {
        filename: 'prompt-tags-v1.md',
        slug: 'graciela.tags.v2',
        name: 'Graciela - Tags SEO',
        category: 'tags',
        description: 'Gera tags YouTube otimizadas para SEO',
        model: 'claude-sonnet-4-5-20250929',
        maxTokens: 2000,
        temperature: 0.3
    },
    {
        filename: 'prompt-community-v1.md',
        slug: 'graciela.comunidade.v2',
        name: 'Graciela - Community Posts',
        category: 'comunidade',
        description: 'Gera posts de community para engagement entre uploads',
        model: 'claude-sonnet-4-5-20250929',
        maxTokens: 3000,
        temperature: 0.6
    }
];

/**
 * Extrai SYSTEM PROMPT e USER TEMPLATE de um arquivo .md
 */
function parsePromptFile(filepath: string): { systemPrompt: string | null; userTemplate: string } {
    const content = readFileSync(filepath, 'utf-8');

    // Extrair SYSTEM PROMPT (conteúdo dentro do bloco de código após ## SYSTEM PROMPT)
    // Formato pode ser:
    // ## SYSTEM PROMPT\n```\n<conteúdo>\n```
    // ou
    // # SYSTEM PROMPT\n```\n<conteúdo>\n```
    const systemMatch = content.match(/##?\s*SYSTEM PROMPT\s*```(?:\w+)?\s*([\s\S]*?)```/);
    const systemPrompt = systemMatch ? systemMatch[1].trim() : null;

    // USER TEMPLATE: usar um template simples que referencia o arquivo completo
    // O arquivo .md completo serve como documentação de referência
    const userTemplate = `Ver documentação completa em: docs/02-features/prompts/graciela/reference/

Input esperado: Ver arquivo de referência para detalhes.

Este prompt utiliza todo o conteúdo documentado em ${filepath.split('/').pop()}.`;

    return { systemPrompt, userTemplate };
}

/**
 * Insere os prompts no banco
 */
async function seedPrompts() {
    const db = new Database(DB_PATH);

    console.log('🌱 Seeding Graciela Prompts v2...\n');

    try {
        // 1. Desativar prompts v1 antigos
        console.log('📦 Desativando prompts v1...');
        const oldSlugs = ['graciela.title.v1', 'graciela.brief.v1', 'graciela.script.v1'];

        const updateStmt = db.prepare(`
            UPDATE prompts 
            SET is_active = 0, updated_at = datetime('now')
            WHERE slug = ?
        `);

        for (const slug of oldSlugs) {
            const result = updateStmt.run(slug);
            console.log(`  ❌ ${slug} (${result.changes} rows)`);
        }

        // 2. Inserir novos prompts v2
        console.log('\n✨ Inserindo prompts v2...');

        const insertStmt = db.prepare(`
            INSERT INTO prompts (
                id, slug, name, category, description,
                system_prompt, user_template,
                model, max_tokens, temperature,
                version, is_active,
                created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?, ?,
                ?, ?,
                ?, ?, ?,
                2, 1,
                datetime('now'), datetime('now')
            )
        `);

        for (const p of PROMPTS) {
            const filepath = join(PROMPTS_DIR, p.filename);

            try {
                const { systemPrompt, userTemplate } = parsePromptFile(filepath);

                const id = nanoid();
                insertStmt.run(
                    id,
                    p.slug,
                    p.name,
                    p.category,
                    p.description,
                    systemPrompt,
                    userTemplate,
                    p.model,
                    p.maxTokens,
                    p.temperature
                );

                console.log(`  ✅ ${p.slug} (${p.filename})`);
            } catch (err) {
                console.error(`  ❌ ERRO ao processar ${p.filename}:`, err);
            }
        }

        // 3. Verificar inserções
        console.log('\n📊 Verificando...');
        const count = db.prepare(`
            SELECT COUNT(*) as total 
            FROM prompts 
            WHERE slug LIKE 'graciela.%.v2' AND is_active = 1
        `).get() as { total: number };

        console.log(`  Total de prompts v2 ativos: ${count.total}/8`);

        // 4. Listar todos os prompts Graciela
        console.log('\n📋 Prompts Graciela (todos):');
        const allPrompts = db.prepare(`
            SELECT slug, name, version, is_active
            FROM prompts
            WHERE slug LIKE 'graciela.%'
            ORDER BY version DESC, slug ASC
        `).all();

        for (const row of allPrompts) {
            const status = (row as any).is_active ? '✅' : '❌';
            console.log(`  ${status} ${(row as any).slug} (v${(row as any).version})`);
        }

        console.log('\n✅ Seed completed!');

    } catch (error) {
        console.error('❌ Erro ao fazer seed:', error);
        throw error;
    } finally {
        db.close();
    }
}

// Executar
seedPrompts().catch(console.error);

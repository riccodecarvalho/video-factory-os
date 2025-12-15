/**
 * SEED: Recipe + Bindings Graciela v2
 * 
 * Atualiza a recipe existente graciela-youtube-long com step keys PT-BR
 * e cria bindings para os 8 prompts v2.
 */

import Database from 'better-sqlite3';
import { join } from 'path';
import { nanoid } from 'nanoid';

const DB_PATH = join(process.cwd(), 'video-factory.db');

async function seedRecipeAndBindings() {
    const db = new Database(DB_PATH);

    console.log('🔧 Atualizando Recipe + Bindings Graciela v2...\n');

    try {
        const recipeId = '54db244d-993f-41a1-ae9b-17963140ea51'; // graciela-youtube-long

        // 1. Atualizar pipeline da recipe com step keys PT-BR
        console.log('📦 Atualizando recipe pipeline...');

        const newPipeline = JSON.stringify([
            { key: 'ideacao', kind: 'llm' },
            { key: 'titulo', kind: 'llm' },
            { key: 'planejamento', kind: 'llm' },
            { key: 'roteiro', kind: 'llm' },
            { key: 'parse_ssml', kind: 'transform' },
            { key: 'tts', kind: 'tts' },
            { key: 'renderizacao', kind: 'render' },
            { key: 'exportacao', kind: 'export' },
            { key: 'miniaturas', kind: 'llm' },
            { key: 'descricao', kind: 'llm' },
            { key: 'tags', kind: 'llm' },
            { key: 'comunidade', kind: 'llm' }
        ]);

        db.prepare(`
            UPDATE recipes 
            SET pipeline = ?, 
                version = 2,
                updated_at = datetime('now')
            WHERE id = ?
        `).run(newPipeline, recipeId);

        console.log('  ✅ Pipeline atualizado (12 steps PT-BR)\\n');

        // 2. Remover bindings antigos de prompts
        console.log('🗑️  Removendo bindings antigos...');

        const deleted = db.prepare(`
            DELETE FROM execution_bindings 
            WHERE recipe_id = ? AND slot = 'prompt'
        `).run(recipeId);

        console.log(`  ❌ ${deleted.changes} bindings removidos\\n`);

        // 3. Criar novos bindings para prompts v2
        console.log('✨ Criando novos bindings...');

        const bindings = [
            { stepKey: 'ideacao', promptSlug: 'graciela.ideacao.v2' },
            { stepKey: 'titulo', promptSlug: 'graciela.titulo.v2' },
            { stepKey: 'planejamento', promptSlug: 'graciela.planejamento.v2' },
            { stepKey: 'roteiro', promptSlug: 'graciela.roteiro.v2' },
            { stepKey: 'miniaturas', promptSlug: 'graciela.miniaturas.v2' },
            { stepKey: 'descricao', promptSlug: 'graciela.descricao.v2' },
            { stepKey: 'tags', promptSlug: 'graciela.tags.v2' },
            { stepKey: 'comunidade', promptSlug: 'graciela.comunidade.v2' }
        ];

        const insertStmt = db.prepare(`
            INSERT INTO execution_bindings (
                id, scope, recipe_id, step_key, slot, target_id, is_active, created_at, updated_at
            ) VALUES (?, 'global', ?, ?, 'prompt', ?, 1, datetime('now'), datetime('now'))
        `);

        for (const binding of bindings) {
            const id = nanoid();
            insertStmt.run(id, recipeId, binding.stepKey, binding.promptSlug);
            console.log(`  ✅ ${binding.stepKey} → ${binding.promptSlug}`);
        }

        // 4. Verificar bindings criados
        console.log('\n📊 Verificando bindings...');
        const count = db.prepare(`
            SELECT COUNT(*) as total 
            FROM execution_bindings 
            WHERE recipe_id = ? AND slot = 'prompt' AND is_active = 1
        `).get(recipeId) as { total: number };

        console.log(`  Total de bindings ativos: ${count.total}/8\n`);

        // 5. Listar todos os bindings
        console.log('📋 Bindings finais:');
        const allBindings = db.prepare(`
            SELECT step_key, target_id 
            FROM execution_bindings 
            WHERE recipe_id = ? AND slot = 'prompt' AND is_active = 1
            ORDER BY step_key
        `).all(recipeId);

        for (const row of allBindings) {
            console.log(`  ${(row as any).step_key} → ${(row as any).target_id}`);
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
seedRecipeAndBindings().catch(console.error);

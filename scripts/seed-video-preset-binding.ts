/**
 * Seed: Add Video Preset Binding for Graciela Recipe
 * 
 * Este script adiciona binding de preset_video para o step de renderização.
 */

import Database from 'better-sqlite3';
import { nanoid } from 'nanoid';
import { resolve } from 'path';

const dbPath = resolve(process.cwd(), 'video-factory.db');

async function main() {
    console.log('🎬 Adicionando binding de preset_video para Graciela...\n');

    const db = new Database(dbPath);

    try {
        // 1. Verificar se já existe preset youtube-long-720p
        const presets = db.prepare('SELECT * FROM presets_video').all() as { id: string; slug: string; name: string }[];
        console.log(`📋 Presets de vídeo existentes: ${presets.length}`);
        presets.forEach(p => console.log(`   - ${p.slug} (${p.name})`));

        if (presets.length === 0) {
            console.log('\n⚠️  Nenhum preset de vídeo encontrado. Execute npm run db:seed primeiro.');
            return;
        }

        // 2. Pegar o primeiro preset para usar
        const defaultPreset = presets.find(p => p.slug === 'youtube-long-720p') || presets[0];

        // 3. Pegar ID da recipe Graciela
        const recipes = db.prepare("SELECT * FROM recipes WHERE slug = 'graciela-youtube-long'").all() as { id: string }[];
        if (recipes.length === 0) {
            console.log('\n⚠️  Recipe graciela-youtube-long não encontrada.');
            return;
        }
        const recipeId = recipes[0].id;

        // 4. Verificar se já existe binding para renderizacao
        const existingBinding = db.prepare(`
            SELECT * FROM execution_bindings 
            WHERE recipe_id = ? AND step_key = 'renderizacao' AND slot = 'preset_video'
        `).get(recipeId);

        if (existingBinding) {
            console.log('\n✅ Binding de preset_video já existe para renderização.');
            return;
        }

        // 5. Criar binding
        const bindingId = nanoid();
        db.prepare(`
            INSERT INTO execution_bindings (
                id, scope, recipe_id, step_key, slot, target_id, is_active, created_at, updated_at
            ) VALUES (?, 'global', ?, 'renderizacao', 'preset_video', ?, 1, datetime('now'), datetime('now'))
        `).run(bindingId, recipeId, defaultPreset.id);

        console.log(`\n✅ Binding criado: renderizacao → ${defaultPreset.slug}`);

        // 6. Verificar
        const verifyBindings = db.prepare(`
            SELECT step_key, slot, target_id 
            FROM execution_bindings 
            WHERE recipe_id = ? AND slot = 'preset_video'
        `).all(recipeId) as { step_key: string; slot: string; target_id: string }[];

        console.log('\n📋 Bindings de preset_video:');
        verifyBindings.forEach(b => console.log(`   ${b.step_key} → ${b.target_id}`));

    } finally {
        db.close();
    }

    console.log('\n✅ Seed concluído!\n');
}

main().catch(console.error);

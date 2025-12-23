/**
 * Video Factory OS - Database Connection
 * 
 * SQLite local com Drizzle ORM.
 * Singleton pattern para reuso da conexão.
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

// Database path (root do projeto)
const DB_PATH = path.join(process.cwd(), 'video-factory.db');

// Singleton
let db: ReturnType<typeof drizzle> | null = null;
let sqlite: Database.Database | null = null;

export function getDb() {
    if (!db) {
        sqlite = new Database(DB_PATH);

        // ==============================================
        // PRAGMAS DE PROTEÇÃO CONTRA CORRUPÇÃO
        // ==============================================
        // 
        // WAL: Melhor concorrência e recuperação após crash
        // synchronous=NORMAL: Bom equilíbrio entre performance e durabilidade
        // busy_timeout=5000: Aguardar 5s se banco estiver locked
        // foreign_keys=ON: Garantir integridade referencial
        //
        // @see docs/01-adr/2025-12-19-adr-012-backup-sqlite.md
        // ==============================================

        sqlite.pragma('journal_mode = WAL');
        sqlite.pragma('synchronous = NORMAL');
        sqlite.pragma('busy_timeout = 5000');
        sqlite.pragma('foreign_keys = ON');

        db = drizzle(sqlite, { schema });
    }
    return db;
}

export function closeDb() {
    if (sqlite) {
        sqlite.close();
        sqlite = null;
        db = null;
    }
}

// Export schema for convenience
export { schema };
export type Database = ReturnType<typeof getDb>;

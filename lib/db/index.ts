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
        sqlite.pragma('journal_mode = WAL'); // Better concurrency
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

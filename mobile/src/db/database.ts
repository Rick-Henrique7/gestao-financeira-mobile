import * as SQLite from 'expo-sqlite';
import { migration001 } from './migrations/001_init';
import { migration002 } from './migrations/002_seed';
import { migration003 } from './migrations/003_goal_deposits';
import { migration004 } from './migrations/004_goals_enhance';

// ─── DB SINGLETON (SQLite local, offline-first) ─────────────────────────────
let dbInstance: SQLite.SQLiteDatabase | null = null;

const DB_NAME = 'sgf.db';

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  await runMigrations(db);
  dbInstance = db;
  return db;
}

export function generateId(): string {
  // 16 chars random + timestamp prefix = sortable
  return (
    Date.now().toString(36).padStart(8, '0') +
    Math.random().toString(36).slice(2, 10)
  );
}

interface Migration {
  name: string;
  sql: string;
}

const migrations: Migration[] = [
  { name: '001_init',           sql: migration001 },
  { name: '002_seed',           sql: migration002 },
  { name: '003_goal_deposits',  sql: migration003 },
  { name: '004_goals_enhance',  sql: migration004 },
];

async function runMigrations(db: SQLite.SQLiteDatabase) {
  // Cria a tabela de controle se nao existir
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const applied = new Set<string>(
    (await db.getAllAsync<{ name: string }>('SELECT name FROM _migrations')).map((r) => r.name)
  );

  for (const m of migrations) {
    if (applied.has(m.name)) continue;
    try {
      await db.execAsync(m.sql);
      await db.runAsync('INSERT INTO _migrations (name) VALUES (?)', m.name);
    } catch (e) {
      const msg = (e as Error).message || '';
      // Tolerancia para colunas duplicadas (idempotente)
      if (msg.includes('duplicate column')) {
        await db.runAsync('INSERT OR IGNORE INTO _migrations (name) VALUES (?)', m.name);
      } else {
        throw e;
      }
    }
  }
}

// Util para resetar (debug)
export async function resetDB() {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
  }
  await SQLite.deleteDatabaseAsync(DB_NAME);
}

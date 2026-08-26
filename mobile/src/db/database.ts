import * as SQLite from 'expo-sqlite';
import { migration001 } from './migrations/001_init';
import { migration002 } from './migrations/002_seed';
import { migration003 } from './migrations/003_goal_deposits';
import { migration004 } from './migrations/004_goals_enhance';

// ─── DB SINGLETON (SQLite local, offline-first) ─────────────────────────────
const DB_NAME = 'sgf.db';
let dbInstance: SQLite.SQLiteDatabase | null = null;
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function isInvalidDbError(e: unknown): boolean {
  const msg = (e as Error)?.message ?? String(e);
  return (
    msg.includes('NullPointerException') ||
    msg.includes('database is closed') ||
    msg.includes('database is not open') ||
    msg.includes('attempt to re-open an already-closed object') ||
    msg.includes('database connection') ||
    msg.includes('cannot perform operation on a closed')
  );
}

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  // Mutex: chamadas concorrentes compartilham a mesma promise de init
  if (!dbPromise) {
    dbPromise = (async () => {
      try {
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        await runMigrations(db);
        dbInstance = db;
        return db;
      } catch (e) {
        dbPromise = null;
        throw e;
      } finally {
        // Permite futuras chamadas depois do init completar
        if (dbInstance) dbPromise = null;
      }
    })();
  }
  return dbPromise;
}

/**
 * Executa uma operacao no DB com retry automatico se a connection estiver stale.
 * O expo-sqlite no Android pode invalidar a connection quando o app vai pra
 * background; ao voltar, a ref antiga joga NPE. Este helper detecta isso,
 * fecha a ref stale, re-inicializa a DB, e tenta de novo (uma vez).
 */
export async function withDB<T>(fn: (db: SQLite.SQLiteDatabase) => Promise<T>): Promise<T> {
  try {
    const db = await getDB();
    return await fn(db);
  } catch (e) {
    if (isInvalidDbError(e)) {
      console.warn('[db] connection stale, re-opening');
      try {
        await dbInstance?.closeAsync();
      } catch { /* ignore */ }
      dbInstance = null;
      dbPromise = null;
      const db = await getDB();
      return await fn(db);
    }
    throw e;
  }
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
  try {
    await dbInstance?.closeAsync();
  } catch { /* ignore */ }
  dbInstance = null;
  dbPromise = null;
  await SQLite.deleteDatabaseAsync(DB_NAME);
}

/**
 * SQLite 오픈 + 스키마 마이그레이션.
 * 한 디바이스에 한 사용자가 사용한다고 가정 (multi-user 분리는 V2 과제).
 */
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'scheduler.db';
const SCHEMA_VERSION = 1;

const SCHEMA_V1 = `
  CREATE TABLE IF NOT EXISTS entries (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    completed INTEGER,
    color TEXT,
    icon TEXT,
    is_recurring INTEGER,
    location TEXT,
    start_date TEXT,
    end_date TEXT,
    created_at TEXT,
    updated_at TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);
  CREATE INDEX IF NOT EXISTS idx_entries_user ON entries(user_id);

  CREATE TABLE IF NOT EXISTS oplog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    op TEXT NOT NULL,
    entry_id TEXT NOT NULL,
    payload TEXT,
    enqueued_at TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    last_error TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_oplog_id ON oplog(id);

  CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openAndMigrate();
  }
  return dbPromise;
}

async function openAndMigrate(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DB_NAME);

  // PRAGMA: foreign keys + WAL for better concurrent reads
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  // Migrate
  await db.execAsync(SCHEMA_V1);

  await db.runAsync(
    'INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)',
    ['schema_version', String(SCHEMA_VERSION)]
  );

  return db;
}

/** 로그아웃 등에서 로컬 데이터 전체 삭제 (다른 사용자 진입 대비). */
export async function clearLocalData(): Promise<void> {
  const db = await getDB();
  await db.execAsync('DELETE FROM entries; DELETE FROM oplog;');
}

/**
 * OfflineFirstEntryRepository — 항상 SQLite를 source of truth로 사용.
 * 모든 mutation은 SQLite에 즉시 반영하고 oplog에 기록한 뒤,
 * 가능하면 즉시 sync를 트리거(네트워크 가능 시)한다.
 *
 * Idempotency: insert는 client-side UUID + INSERT OR REPLACE, update/delete는 PK 기반.
 */
import type * as SQLite from 'expo-sqlite';
import type { EntryRepository, NewRawEntry, RawEntry } from '@project/shared/src/repositories/entryRepository';
import { getDB } from '../db/sqlite';
import { rawToColumns, rowToRaw, type SQLEntryRow } from '../db/mappers';
import { triggerSyncIfOnline } from '../sync/networkBridge';

const ALL_COLUMNS = [
  'id', 'user_id', 'date', 'type', 'title', 'content',
  'completed', 'color', 'icon', 'is_recurring', 'location',
  'start_date', 'end_date', 'created_at', 'updated_at',
] as const;

const UPDATABLE_COLUMNS = [
  'date', 'type', 'title', 'content', 'completed', 'color',
  'icon', 'is_recurring', 'location', 'start_date', 'end_date', 'updated_at',
] as const;

async function enqueueOp(
  db: SQLite.SQLiteDatabase,
  op: 'insert' | 'update' | 'delete',
  entryId: string,
  payload: unknown
): Promise<void> {
  await db.runAsync(
    'INSERT INTO oplog (op, entry_id, payload, enqueued_at) VALUES (?, ?, ?, ?)',
    [op, entryId, payload === null ? null : JSON.stringify(payload), new Date().toISOString()]
  );
}

export const sqliteEntryRepository: EntryRepository = {
  async list(): Promise<RawEntry[]> {
    const db = await getDB();
    const rows = await db.getAllAsync<SQLEntryRow>(
      'SELECT * FROM entries ORDER BY created_at ASC'
    );
    return rows.map(rowToRaw);
  },

  async insert(entry: NewRawEntry): Promise<RawEntry> {
    const db = await getDB();
    const now = new Date().toISOString();
    const full: RawEntry = { ...entry, created_at: now, updated_at: now };
    const cols = rawToColumns(full);

    const placeholders = ALL_COLUMNS.map(() => '?').join(', ');
    const values = ALL_COLUMNS.map((c) => cols[c] ?? null);

    await db.runAsync(
      `INSERT OR REPLACE INTO entries (${ALL_COLUMNS.join(', ')}) VALUES (${placeholders})`,
      values as never[]
    );

    await enqueueOp(db, 'insert', entry.id, full);
    triggerSyncIfOnline();
    return full;
  },

  async update(id: string, updates: Partial<RawEntry>): Promise<void> {
    const db = await getDB();
    const now = new Date().toISOString();
    const merged: Partial<RawEntry> = { ...updates, updated_at: now };
    const cols = rawToColumns(merged);

    const setClauses: string[] = [];
    const values: unknown[] = [];
    for (const c of UPDATABLE_COLUMNS) {
      if (c in cols) {
        setClauses.push(`${c} = ?`);
        values.push(cols[c] ?? null);
      }
    }
    if (setClauses.length === 0) return;

    values.push(id);
    await db.runAsync(
      `UPDATE entries SET ${setClauses.join(', ')} WHERE id = ?`,
      values as never[]
    );

    await enqueueOp(db, 'update', id, merged);
    triggerSyncIfOnline();
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.runAsync('DELETE FROM entries WHERE id = ?', [id]);
    await enqueueOp(db, 'delete', id, null);
    triggerSyncIfOnline();
  },
};

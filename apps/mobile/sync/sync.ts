/**
 * Sync 흐름:
 *  1. flushOplog — 로컬에 쌓인 변경을 Supabase로 push (순서 보존, 실패 시 중단)
 *  2. pullRemote — Supabase의 최신 상태를 로컬 SQLite로 upsert
 *
 * 단순화한 last-write-wins: pullRemote는 row 전체를 INSERT OR REPLACE한다.
 * 따라서 push를 먼저 해서 로컬의 미반영 변경이 손실되지 않게 한다.
 *
 * 사용자가 한 디바이스만 쓰는 시나리오 기준으로 충분히 안전하다.
 */
import { remoteEntryRepository } from '@project/shared/src/repositories/remoteEntryRepository';
import type { NewRawEntry, RawEntry } from '@project/shared/src/repositories/entryRepository';
import { getDB } from '../db/sqlite';
import { rawToColumns, type SQLEntryRow } from '../db/mappers';

const ALL_COLUMNS = [
  'id', 'user_id', 'date', 'type', 'title', 'content',
  'completed', 'color', 'icon', 'is_recurring', 'location',
  'start_date', 'end_date', 'created_at', 'updated_at',
] as const;

interface OpRow {
  id: number;
  op: 'insert' | 'update' | 'delete';
  entry_id: string;
  payload: string | null;
  enqueued_at: string;
  attempts: number;
  last_error: string | null;
}

let syncing = false;

export async function flushOplog(): Promise<{ pushed: number; failed: number }> {
  const db = await getDB();
  const ops = await db.getAllAsync<OpRow>('SELECT * FROM oplog ORDER BY id ASC');

  let pushed = 0;
  let failed = 0;

  for (const op of ops) {
    try {
      const payload = op.payload ? (JSON.parse(op.payload) as Partial<RawEntry>) : null;
      switch (op.op) {
        case 'insert': {
          if (!payload || !payload.id || !payload.user_id || !payload.date || !payload.type) {
            throw new Error('invalid insert payload (missing required fields)');
          }
          // 런타임 가드 통과 — 안전하게 NewRawEntry로 cast
          await remoteEntryRepository.insert(payload as NewRawEntry);
          break;
        }
        case 'update': {
          if (!payload) throw new Error('update payload missing');
          await remoteEntryRepository.update(op.entry_id, payload);
          break;
        }
        case 'delete': {
          await remoteEntryRepository.delete(op.entry_id);
          break;
        }
      }
      await db.runAsync('DELETE FROM oplog WHERE id = ?', [op.id]);
      pushed += 1;
    } catch (err) {
      failed += 1;
      await db.runAsync(
        'UPDATE oplog SET attempts = attempts + 1, last_error = ? WHERE id = ?',
        [String(err), op.id]
      );
      // 순서 보존을 위해 첫 실패 시 중단
      console.warn('[sync] oplog push failed, halting:', err);
      break;
    }
  }
  return { pushed, failed };
}

export async function pullRemote(): Promise<{ pulled: number }> {
  const db = await getDB();
  const remote = await remoteEntryRepository.list();

  if (remote.length === 0) return { pulled: 0 };

  await db.withTransactionAsync(async () => {
    for (const row of remote) {
      const cols = rawToColumns(row);
      const placeholders = ALL_COLUMNS.map(() => '?').join(', ');
      const values = ALL_COLUMNS.map((c) => cols[c] ?? null);
      await db.runAsync(
        `INSERT OR REPLACE INTO entries (${ALL_COLUMNS.join(', ')}) VALUES (${placeholders})`,
        values as never[]
      );
    }
  });

  return { pulled: remote.length };
}

export async function fullSync(): Promise<void> {
  if (syncing) return;
  syncing = true;
  try {
    const pushResult = await flushOplog();
    const pullResult = await pullRemote();
    if (pushResult.pushed > 0 || pullResult.pulled > 0) {
      console.log('[sync] done', { ...pushResult, ...pullResult });
    }
  } catch (err) {
    console.error('[sync] failed:', err);
  } finally {
    syncing = false;
  }
}

/** oplog 잔여량 확인 (디버그/UI 표시용) */
export async function getPendingOpCount(): Promise<number> {
  const db = await getDB();
  const result = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) as n FROM oplog');
  return result?.n ?? 0;
}

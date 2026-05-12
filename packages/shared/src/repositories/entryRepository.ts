/**
 * EntryRepository — Supabase `entries` 테이블의 CRUD를 추상화.
 *
 * 웹은 RemoteEntryRepository(직접 Supabase)로, 모바일은 OfflineFirstEntryRepository
 * (SQLite 캐시 + oplog 큐)로 구현체를 갈아끼운다. 슬라이스는 이 인터페이스만 본다.
 */
import type { EntryType } from '../store/diaryStore';

/**
 * DB row 형태(supabase 컬럼과 1:1). EntryItem(UI shape)과는 비슷하지만
 * 명시적으로 분리해 둔다 — 추후 SQLite ↔ Supabase 동기화에서 row 단위로 다룬다.
 */
export interface RawEntry {
  id: string;
  user_id?: string;
  date: string;
  type: EntryType;
  title: string;
  content: string;
  completed?: boolean | null;
  color?: string | null;
  icon?: string | null;
  is_recurring?: boolean | null;
  location?: { lat: number; lng: number; address?: string; name?: string } | null;
  start_date?: string | null;
  end_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

/** insert에 필요한 최소 필드. id는 호출자가 생성(uuid)해서 넘긴다 (오프라인 idempotency용). */
export interface NewRawEntry {
  id: string;
  user_id: string;
  date: string;
  type: EntryType;
  title: string;
  content: string;
  completed?: boolean | null;
  color?: string | null;
  icon?: string | null;
  is_recurring?: boolean | null;
  location?: RawEntry['location'];
  start_date?: string | null;
  end_date?: string | null;
}

export interface EntryRepository {
  list(): Promise<RawEntry[]>;
  insert(entry: NewRawEntry): Promise<RawEntry>;
  update(id: string, updates: Partial<RawEntry>): Promise<void>;
  delete(id: string): Promise<void>;
}

let repo: EntryRepository | null = null;

export function setEntryRepository(r: EntryRepository): void {
  repo = r;
}

export function getEntryRepository(): EntryRepository {
  if (!repo) {
    throw new Error(
      '[shared] EntryRepository not initialized. Call setEntryRepository() at app entry.'
    );
  }
  return repo;
}

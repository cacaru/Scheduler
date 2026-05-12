/**
 * RemoteEntryRepository — Supabase에 직접 CRUD를 던지는 구현.
 * 웹의 기본 동작이자 모바일 sync 단계에서도 원격 측 쓰기에 사용된다.
 *
 * 클라이언트 전용 컬럼(updated_at)은 Supabase 스키마에 없으므로 outgoing 페이로드에서 제거한다.
 * 로컬 SQLite는 updated_at을 그대로 유지 (LWW 후속 도입 여지를 위해).
 */
import { supabase } from '../utils/supabase';
import type { EntryRepository, NewRawEntry, RawEntry } from './entryRepository';

const CLIENT_ONLY_COLUMNS = ['updated_at'] as const;

function stripClientOnly<T extends object>(row: T): T {
  const out = { ...row } as Record<string, unknown>;
  for (const c of CLIENT_ONLY_COLUMNS) delete out[c];
  return out as T;
}

export const remoteEntryRepository: EntryRepository = {
  async list() {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as RawEntry[];
  },

  async insert(entry: NewRawEntry) {
    const payload = stripClientOnly(entry);
    // id를 호출자가 생성해서 넘기므로 upsert로 멱등성 확보 (재시도 안전)
    const { data, error } = await supabase
      .from('entries')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    return data as RawEntry;
  },

  async update(id, updates) {
    const payload = stripClientOnly(updates);
    if (Object.keys(payload).length === 0) return; // 보낼 필드가 없으면 noop
    const { error } = await supabase.from('entries').update(payload).eq('id', id);
    if (error) throw error;
  },

  async delete(id) {
    const { error } = await supabase.from('entries').delete().eq('id', id);
    if (error) throw error;
  },
};

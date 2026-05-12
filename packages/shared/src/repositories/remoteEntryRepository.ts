/**
 * RemoteEntryRepository — Supabase에 직접 CRUD를 던지는 구현.
 * 웹의 기본 동작이자 모바일 sync 단계에서도 원격 측 쓰기에 사용된다.
 */
import { supabase } from '../utils/supabase';
import type { EntryRepository, NewRawEntry, RawEntry } from './entryRepository';

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
    // id를 호출자가 생성해서 넘기므로 upsert로 멱등성 확보 (재시도 안전)
    const { data, error } = await supabase
      .from('entries')
      .upsert(entry, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    return data as RawEntry;
  },

  async update(id, updates) {
    const { error } = await supabase.from('entries').update(updates).eq('id', id);
    if (error) throw error;
  },

  async delete(id) {
    const { error } = await supabase.from('entries').delete().eq('id', id);
    if (error) throw error;
  },
};

/**
 * Supabase 클라이언트 초기화 모듈.
 *
 * 환경변수(import.meta.env / process.env / Constants.expoConfig.extra)는
 * 플랫폼별로 형식이 달라 shared에서 직접 읽지 않는다. 각 앱의 진입점에서
 * `initSupabaseClient(url, anonKey, options?)`를 1회 호출하라.
 *
 * 기존 `import { supabase } from '...'` 호출부는 변경할 필요가 없도록
 * `supabase`를 Proxy로 노출한다. 호출 시점에 초기화돼 있어야 한다.
 */
import { createClient, type SupabaseClient, type SupabaseClientOptions } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export function initSupabaseClient(
  url: string,
  anonKey: string,
  options?: SupabaseClientOptions<'public'>
): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error('[shared] initSupabaseClient: url and anonKey are required.');
  }
  _client = createClient(url, anonKey, options);
  return _client;
}

export function getSupabaseClient(): SupabaseClient {
  if (!_client) {
    throw new Error(
      '[shared] Supabase client not initialized. Call initSupabaseClient() at app entry.'
    );
  }
  return _client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabaseClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

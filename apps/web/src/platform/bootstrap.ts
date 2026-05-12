/**
 * 웹 앱 진입 시 1회 호출. shared의 어댑터를 주입하고 Supabase 클라이언트를 초기화.
 * 반드시 React 트리 렌더링 전에 실행되어야 한다 (FOUC 방지 및 supabase 호출 보장).
 */
import { setStorageAdapter } from '@project/shared/src/adapters/storage';
import { setThemeApplier } from '@project/shared/src/adapters/theme';
import { initSupabaseClient } from '@project/shared/src/utils/supabase';
import { hydrateUIStore } from '@project/shared/src/store/uiStore';
import { webStorageAdapter } from './storage';
import { webThemeApplier } from './theme';

export function bootstrapWebPlatform(): void {
  setStorageAdapter(webStorageAdapter);
  setThemeApplier(webThemeApplier);

  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anonKey) {
    console.error('[bootstrap] Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY');
  } else {
    initSupabaseClient(url, anonKey);
  }

  hydrateUIStore();
}

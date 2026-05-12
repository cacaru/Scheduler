/**
 * 모바일 진입 시 1회 await. shared 어댑터 주입 + Supabase 초기화 + UI 스토어 hydrate.
 * 반드시 React 트리 렌더링 전에 완료되어야 한다 (auth.getSession()이 supabase에 의존).
 */
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { setStorageAdapter } from '@project/shared/src/adapters/storage';
import { setThemeApplier } from '@project/shared/src/adapters/theme';
import { initSupabaseClient } from '@project/shared/src/utils/supabase';
import { hydrateUIStore } from '@project/shared/src/store/uiStore';
import { hydrateStorageCache, mobileStorageAdapter } from './storage';
import { mobileThemeApplier } from './theme';

export async function bootstrapMobilePlatform(): Promise<void> {
  setStorageAdapter(mobileStorageAdapter);
  setThemeApplier(mobileThemeApplier);

  await hydrateStorageCache();

  const extra = (Constants.expoConfig?.extra ?? {}) as {
    supabaseUrl?: string;
    supabaseAnonKey?: string;
  };

  if (!extra.supabaseUrl || !extra.supabaseAnonKey) {
    console.error(
      '[bootstrap] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. ' +
        'Set them in apps/mobile/.env and restart the bundler.'
    );
  } else {
    initSupabaseClient(extra.supabaseUrl, extra.supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }

  hydrateUIStore();
}

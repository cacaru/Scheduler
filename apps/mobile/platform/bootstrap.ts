/**
 * 모바일 진입 시 1회 await. shared 어댑터 주입 + Supabase 초기화 + UI 스토어 hydrate
 * + SQLite 캐시 오픈 + 오프라인 우선 EntryRepository 주입 + 네트워크 브리지 활성화.
 */
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { setStorageAdapter } from '@project/shared/src/adapters/storage';
import { setThemeApplier } from '@project/shared/src/adapters/theme';
import { initSupabaseClient } from '@project/shared/src/utils/supabase';
import { hydrateUIStore } from '@project/shared/src/store/uiStore';
import { setEntryRepository } from '@project/shared/src/repositories/entryRepository';

import { hydrateStorageCache, mobileStorageAdapter } from './storage';
import { mobileThemeApplier } from './theme';
import { getDB } from '../db/sqlite';
import { sqliteEntryRepository } from '../repositories/sqliteEntryRepository';
import { fullSync } from '../sync/sync';
import { initNetworkBridge } from '../sync/networkBridge';

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

  // SQLite를 미리 열어 놓고, repository를 오프라인 우선으로 등록
  await getDB();
  setEntryRepository(sqliteEntryRepository);

  // 네트워크 변화 감시 + 재연결 시 자동 sync
  initNetworkBridge(fullSync);

  hydrateUIStore();
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StorageAdapter } from '@project/shared/src/adapters/storage';
import { UI_STORAGE_KEYS } from '@project/shared/src/store/uiStore';

/**
 * shared의 StorageAdapter는 동기 인터페이스이고 AsyncStorage는 비동기다.
 * 부팅 시 hydrateStorageCache()로 알려진 키를 모두 메모리에 올린 뒤,
 * get은 메모리에서 동기 반환, set은 메모리 갱신 + AsyncStorage fire-and-forget.
 */
const cache = new Map<string, string>();
const KNOWN_KEYS: readonly string[] = Object.values(UI_STORAGE_KEYS);

export async function hydrateStorageCache(): Promise<void> {
  const entries = await AsyncStorage.multiGet(KNOWN_KEYS as string[]);
  for (const [key, value] of entries) {
    if (value !== null) cache.set(key, value);
  }
}

export const mobileStorageAdapter: StorageAdapter = {
  get(key) {
    return cache.get(key) ?? null;
  },
  set(key, value) {
    cache.set(key, value);
    AsyncStorage.setItem(key, value).catch((err) => {
      console.warn('[storage] AsyncStorage.setItem failed:', key, err);
    });
  },
  remove(key) {
    cache.delete(key);
    AsyncStorage.removeItem(key).catch((err) => {
      console.warn('[storage] AsyncStorage.removeItem failed:', key, err);
    });
  },
};

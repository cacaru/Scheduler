import type { StorageAdapter } from '@project/shared/src/adapters/storage';

export const webStorageAdapter: StorageAdapter = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // 사용자가 저장 거부(시크릿 모드 한도 등) 시 무시
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

/**
 * 플랫폼별 영속 저장소를 추상화한다.
 * - 웹: localStorage 래퍼
 * - 모바일(RN): AsyncStorage / MMKV 래퍼
 *
 * 모바일의 AsyncStorage는 비동기지만, 현재 shared에서 사용하는 키
 * (테마/색/폰트)는 모두 앱 시작 시 1회 로드 후 메모리에서 동기적으로
 * 다루므로 동기 인터페이스로 정의한다. 모바일 측에서는 부팅 시 hydrate
 * 단계에서 미리 메모리에 올린 값을 동기 함수로 노출하면 된다.
 */
export interface StorageAdapter {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

let adapter: StorageAdapter | null = null;

export function setStorageAdapter(a: StorageAdapter): void {
  adapter = a;
}

export function getStorageAdapter(): StorageAdapter {
  if (!adapter) {
    throw new Error(
      '[shared] StorageAdapter is not initialized. Call setStorageAdapter() at app entry.'
    );
  }
  return adapter;
}

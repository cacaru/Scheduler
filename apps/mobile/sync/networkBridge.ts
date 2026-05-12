/**
 * NetInfo 기반 네트워크 상태 추적 + sync 트리거.
 *
 * - 부팅 시 initNetworkBridge(syncFn)으로 sync 함수를 등록
 * - 오프라인 → 온라인 전이 시 자동 sync
 * - Repository의 mutation 직후 triggerSyncIfOnline()으로 즉시 push 시도
 */
import NetInfo from '@react-native-community/netinfo';

let isOnline = true;
let syncFn: (() => Promise<void>) | null = null;
let unsubscribe: (() => void) | null = null;

export function initNetworkBridge(sync: () => Promise<void>): void {
  syncFn = sync;

  // 초기 상태
  NetInfo.fetch().then((state) => {
    isOnline = !!state.isConnected && state.isInternetReachable !== false;
  });

  // 변화 감지
  unsubscribe?.();
  unsubscribe = NetInfo.addEventListener((state) => {
    const wasOnline = isOnline;
    isOnline = !!state.isConnected && state.isInternetReachable !== false;
    if (!wasOnline && isOnline && syncFn) {
      console.log('[net] reconnected, triggering sync');
      syncFn().catch((err) => console.error('[net] reconnect sync failed:', err));
    }
  });
}

export function teardownNetworkBridge(): void {
  unsubscribe?.();
  unsubscribe = null;
  syncFn = null;
}

export function triggerSyncIfOnline(): void {
  if (isOnline && syncFn) {
    syncFn().catch((err) => console.error('[net] sync trigger failed:', err));
  }
}

export function getOnlineStatus(): boolean {
  return isOnline;
}

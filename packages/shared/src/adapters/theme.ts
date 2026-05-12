/**
 * 테마/색/폰트/스크롤락의 "실제 적용"을 플랫폼에 위임하는 콜백 묶음.
 * - 웹: document.documentElement.style.setProperty / data-theme / body.classList
 * - 모바일: NativeWind 토큰 갱신 / StatusBar 스타일 / 모달 스택 관리 등
 */
export interface ThemeApplier {
  applyTheme(theme: 'light' | 'dark'): void;
  applyColors(primary: string, light: string, heavy: string): void;
  applyFonts(body: string, title: string): void;
  applyScrollLock(locked: boolean): void;
}

let applier: ThemeApplier | null = null;

export function setThemeApplier(a: ThemeApplier): void {
  applier = a;
}

export function getThemeApplier(): ThemeApplier {
  if (!applier) {
    throw new Error(
      '[shared] ThemeApplier is not initialized. Call setThemeApplier() at app entry.'
    );
  }
  return applier;
}

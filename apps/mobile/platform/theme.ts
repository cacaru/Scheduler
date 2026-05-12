import type { ThemeApplier } from '@project/shared/src/adapters/theme';

/**
 * 모바일 테마 적용기.
 * 현재는 스토어에 값을 보관만 하고 실제 시각 적용은 Phase 3(UI 재디자인)에서
 * NativeWind 다크모드 토글 / 색상 토큰 동기화 / expo-font 로드와 함께 연결한다.
 * 그래서 지금은 의도적으로 no-op이다.
 */
export const mobileThemeApplier: ThemeApplier = {
  applyTheme(_theme) {
    // TODO(Phase 3): NativeWind colorScheme 동기화 (`useColorScheme`)
  },
  applyColors(_primary, _light, _heavy) {
    // TODO(Phase 3): 색상 토큰을 컨텍스트로 전파해 NativeWind와 연결
  },
  applyFonts(_body, _title) {
    // TODO(Phase 3): expo-font로 로드된 폰트 패밀리를 NativeWind 토큰으로 전달
  },
  applyScrollLock(_locked) {
    // 모바일은 모달 자체가 외부 스크롤을 막으므로 별도 잠금 불필요
  },
};

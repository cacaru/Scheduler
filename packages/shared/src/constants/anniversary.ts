/**
 * 기념일 아이콘 — 플랫폼 비종속 이름 리스트.
 *
 * 실제 컴포넌트 매핑은 각 앱이 자체 보관:
 *   - apps/web/src/icons/anniversary.ts  (lucide-react)
 *   - apps/mobile/icons/anniversary.ts   (lucide-react-native)
 *
 * 새 아이콘 추가 시 ICON_NAMES에 추가 + 두 앱의 매핑 파일에도 추가.
 * IconName union 덕분에 한 곳을 빠뜨리면 컴파일 에러로 즉시 잡힘.
 */
export const ICON_NAMES = [
  'Gift',
  'Heart',
  'Star',
  'Cake',
  'PartyPopper',
  'Book',
  'Clock',
  'Droplet',
  'Notebook',
  'Trophy',
] as const;

export type IconName = (typeof ICON_NAMES)[number];

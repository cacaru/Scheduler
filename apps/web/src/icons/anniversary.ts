/**
 * 웹용 기념일 아이콘 매핑 (lucide-react).
 * 정의 타입은 Record<IconName, ...>로 엄격(새 IconName 추가 시 빠뜨리면 컴파일 에러),
 * 노출 타입은 Record<string, ...>로 느슨해 string으로 인덱싱 가능 (backward compat).
 */
import {
  Book,
  Cake,
  Clock,
  Droplet,
  Gift,
  Heart,
  Notebook,
  PartyPopper,
  Star,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import { ICON_NAMES, type IconName } from '@project/shared/src/constants/anniversary';

// 정의 시점에 모든 IconName이 매핑되어야 함을 강제
const STRICT_ICON_MAP: Record<IconName, LucideIcon> = {
  Gift,
  Heart,
  Star,
  Cake,
  PartyPopper,
  Book,
  Clock,
  Droplet,
  Notebook,
  Trophy,
};

/** 호환성을 위한 느슨한 Record. 동적 string 인덱싱 가능. */
export const ANNIVERSARY_ICONS: Record<string, LucideIcon> = STRICT_ICON_MAP;

/** 폼/피커 등에서 .map 용도. ICON_NAMES 순서 유지. */
export const ICONS: Array<{ name: IconName; icon: LucideIcon }> = ICON_NAMES.map((name) => ({
  name,
  icon: STRICT_ICON_MAP[name],
}));

/**
 * 호출자에서 인덱싱 + 폴백 패턴을 한 줄로 줄여주는 헬퍼.
 * 새 코드는 이걸 사용 권장.
 */
export function getAnniversaryIcon(name: string | null | undefined): LucideIcon {
  if (name && (ICON_NAMES as readonly string[]).includes(name)) {
    return STRICT_ICON_MAP[name as IconName];
  }
  return Gift;
}

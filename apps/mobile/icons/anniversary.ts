/**
 * 모바일용 기념일 아이콘 매핑 (lucide-react-native).
 * 정의 타입 Record<IconName, ...>로 새 IconName 추가 시 빠뜨리면 컴파일 에러.
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
} from 'lucide-react-native';
import { ICON_NAMES, type IconName } from '@project/shared/src/constants/anniversary';

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

export const ANNIVERSARY_ICONS: Record<string, LucideIcon> = STRICT_ICON_MAP;

/** 폼/피커 등에서 .map 용도. ICON_NAMES 순서 유지. */
export const ICONS: Array<{ name: IconName; icon: LucideIcon }> = ICON_NAMES.map((name) => ({
  name,
  icon: STRICT_ICON_MAP[name],
}));

export function getAnniversaryIcon(name: string | null | undefined): LucideIcon {
  if (name && (ICON_NAMES as readonly string[]).includes(name)) {
    return STRICT_ICON_MAP[name as IconName];
  }
  return Gift;
}

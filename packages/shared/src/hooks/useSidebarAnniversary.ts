/**
 * useSidebarAnniversary.ts
 * 사이드바에 표시될 기념일 목록을 월별로 그룹화하고 관리하는 커스텀 훅입니다.
 */
import { useMemo } from 'react';
import { useDiaryStore, type EntryItem } from '../store/diaryStore';

export const useSidebarAnniversary = () => {
  const entries = useDiaryStore((state) => state.entries);

  const groupedAnniversaries = useMemo(() => {
    const groups: { [month: string]: { [date: string]: EntryItem[] } } = {};

    Object.entries(entries).forEach(([date, items]) => {
      const anniversaries = items.filter((item) => item.type === 'anniversary');
      if (anniversaries.length === 0) return;

      const month = date.substring(0, 7);
      if (!groups[month]) groups[month] = {};
      groups[month][date] = anniversaries;
    });
    return groups;
  }, [entries]);

  const sortedMonths = useMemo(
    () => Object.keys(groupedAnniversaries).sort((a, b) => b.localeCompare(a)),
    [groupedAnniversaries]
  );

  return {
    groupedAnniversaries,
    sortedMonths,
  };
};

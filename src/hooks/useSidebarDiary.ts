/**
 * useSidebarDiary.ts
 * 사이드바에 표시될 일기 목록을 월별로 그룹화하고 관리하는 커스텀 훅입니다.
 */
import { useMemo } from 'react';
import { useDiaryStore, type EntryItem } from '../store/diaryStore';

export const useSidebarDiary = () => {
  const entries = useDiaryStore((state) => state.entries);

  const groupedDiaries = useMemo(() => {
    const groups: { [month: string]: { [date: string]: EntryItem[] } } = {};

    Object.entries(entries).forEach(([date, items]) => {
      const diaries = items.filter((item) => item.type === 'diary');
      if (diaries.length === 0) return;

      const month = date.substring(0, 7);
      if (!groups[month]) groups[month] = {};
      groups[month][date] = diaries;
    });
    return groups;
  }, [entries]);

  const sortedMonths = useMemo(
    () => Object.keys(groupedDiaries).sort((a, b) => b.localeCompare(a)),
    [groupedDiaries]
  );

  return {
    groupedDiaries,
    sortedMonths,
  };
};

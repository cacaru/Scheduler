import { type StateCreator } from 'zustand';
import { type EntryItem, type EntryType, type DiaryState } from '../diaryStore';
import { useUIStore } from '../uiStore';
import { useAuthStore } from '../authStore';
import { getEntryRepository, type RawEntry } from '../../repositories/entryRepository';
import { uuid } from '../../utils/uuid';
import { eachDayOfInterval, format, parseISO } from 'date-fns';

export interface BaseSlice {
  entries: Record<string, EntryItem[]>;
  isLoading: boolean;
  fetchEntries: () => Promise<void>;
  addItem: (
    date: string,
    type: EntryType,
    title: string,
    content: string,
    color?: string,
    location?: EntryItem['location'],
    is_recurring?: boolean,
    icon?: string,
    start_date?: string,
    end_date?: string
  ) => Promise<void>;
  updateItem: (date: string, id: string, updates: Partial<EntryItem>) => Promise<void>;
  deleteItem: (date: string, id: string) => Promise<void>;
}

export const getSafeEntries = (entries: Record<string, EntryItem[]>, date: string): EntryItem[] => {
  const existing = entries[date];
  return Array.isArray(existing) ? existing : [];
};

/** Raw row → 화면용 EntryItem 변환 */
function toEntryItem(row: RawEntry): EntryItem {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    content: row.content,
    completed: row.completed ?? undefined,
    color: row.color ?? undefined,
    icon: row.icon ?? undefined,
    is_recurring: row.is_recurring ?? undefined,
    location: row.location ?? undefined,
    start_date: row.start_date ?? undefined,
    end_date: row.end_date ?? undefined,
  };
}

/** 날짜별 그룹핑. todo의 start_date~end_date는 모든 날짜로 펼친다. */
function groupByDate(rows: RawEntry[]): Record<string, EntryItem[]> {
  const grouped: Record<string, EntryItem[]> = {};
  for (const row of rows) {
    const entry = toEntryItem(row);

    if (row.type === 'todo' && row.start_date && row.end_date) {
      try {
        const days = eachDayOfInterval({
          start: parseISO(row.start_date),
          end: parseISO(row.end_date),
        });
        for (const day of days) {
          const dStr = format(day, 'yyyy-MM-dd');
          if (!grouped[dStr]) grouped[dStr] = [];
          grouped[dStr].push(entry);
        }
        continue;
      } catch {
        // 폴백 — 단일 날짜로 처리
      }
    }
    if (!grouped[row.date]) grouped[row.date] = [];
    grouped[row.date].push(entry);
  }
  return grouped;
}

export const createBaseSlice: StateCreator<DiaryState, [], [], BaseSlice> = (set) => ({
  entries: {},
  isLoading: false,

  fetchEntries: async () => {
    try {
      set({ isLoading: true });
      const rows = await getEntryRepository().list();
      set({ entries: groupByDate(rows) });
    } catch (err) {
      console.error('Error fetching entries:', err);
      useUIStore.getState().showToast('데이터를 불러오는 중 오류가 발생했습니다.', 'error');
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (date, type, title, content, color, location, is_recurring, icon, start_date, end_date) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user) return;

      const id = uuid();
      const row = await getEntryRepository().insert({
        id,
        user_id: user.id,
        date,
        type,
        title,
        content,
        completed: type === 'todo' ? false : null,
        color: color ?? null,
        icon: icon ?? null,
        is_recurring: is_recurring ?? null,
        location: location ?? null,
        start_date: start_date ?? null,
        end_date: end_date ?? null,
      });

      const entry = toEntryItem(row);

      set((state) => {
        const next = { ...state.entries };
        if (row.type === 'todo' && row.start_date && row.end_date) {
          try {
            const days = eachDayOfInterval({
              start: parseISO(row.start_date),
              end: parseISO(row.end_date),
            });
            for (const day of days) {
              const dStr = format(day, 'yyyy-MM-dd');
              next[dStr] = [...getSafeEntries(next, dStr), entry];
            }
          } catch {
            next[date] = [...getSafeEntries(next, date), entry];
          }
        } else {
          next[date] = [...getSafeEntries(next, date), entry];
        }
        return { entries: next };
      });
      useUIStore.getState().showToast('성공적으로 추가되었습니다.', 'success');
    } catch (err) {
      console.error('addItem Error:', err);
      useUIStore.getState().showToast('항목 추가에 실패했습니다.', 'error');
      throw err;
    }
  },

  updateItem: async (_date, id, updates) => {
    try {
      // EntryItem.location은 NonNullable이므로 별도 변환 필요 없음
      await getEntryRepository().update(id, updates as Partial<RawEntry>);

      set((state) => {
        const next = { ...state.entries };

        // 1. 모든 날짜에서 기존 인스턴스 제거
        let updatedItem: EntryItem | null = null;
        for (const d of Object.keys(next)) {
          const item = next[d].find((i) => i.id === id);
          if (item && !updatedItem) updatedItem = { ...item, ...updates };
          next[d] = next[d].filter((i) => i.id !== id);
        }
        if (!updatedItem) return state;

        const item = updatedItem;
        if (item.type === 'todo' && item.start_date && item.end_date) {
          try {
            const days = eachDayOfInterval({
              start: parseISO(item.start_date),
              end: parseISO(item.end_date),
            });
            for (const day of days) {
              const dStr = format(day, 'yyyy-MM-dd');
              if (!next[dStr]) next[dStr] = [];
              next[dStr] = [...next[dStr], item];
            }
          } catch {
            // 폴백 — _date에 배치
            const target = (updates as { date?: string }).date || _date;
            if (!next[target]) next[target] = [];
            next[target] = [...next[target], item];
          }
        } else {
          const target = (updates as { date?: string }).date || _date;
          if (!next[target]) next[target] = [];
          next[target] = [...next[target], item];
        }
        return { entries: next };
      });
      useUIStore.getState().showToast('성공적으로 수정되었습니다.', 'success');
    } catch (err) {
      console.error('Error updating item:', err);
      useUIStore.getState().showToast('수정에 실패했습니다.', 'error');
    }
  },

  deleteItem: async (_date, id) => {
    try {
      await getEntryRepository().delete(id);
      set((state) => {
        const next = { ...state.entries };
        for (const d of Object.keys(next)) {
          next[d] = next[d].filter((item) => item.id !== id);
        }
        return { entries: next };
      });
      useUIStore.getState().showToast('삭제되었습니다.', 'success');
    } catch (err) {
      console.error('Error deleting item:', err);
      useUIStore.getState().showToast('삭제에 실패했습니다.', 'error');
    }
  },
});

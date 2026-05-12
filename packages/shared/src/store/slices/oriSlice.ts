import { type StateCreator } from 'zustand';
import { type EntryItem, type DiaryState } from '../diaryStore';
import { getEntryRepository } from '../../repositories/entryRepository';

export interface OriSlice {
  oriItem: Record<string, EntryItem[]>;
  isLoading: boolean;
  fetchOris: () => Promise<void>;
}

export const getSafeEntries = (entries: Record<string, EntryItem[]>, date: string): EntryItem[] => {
  const existing = entries[date];
  return Array.isArray(existing) ? existing : [];
};

export const createOriSlice: StateCreator<DiaryState, [], [], OriSlice> = (set) => ({
  oriItem: {},
  isLoading: false,

  fetchOris: async () => {
    try {
      set({ isLoading: true });
      const rows = await getEntryRepository().list();

      const grouped: Record<string, EntryItem[]> = {};
      for (const row of rows) {
        const entry: EntryItem = {
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
        if (!grouped[row.date]) grouped[row.date] = [];
        grouped[row.date].push(entry);
      }
      set({ oriItem: grouped });
    } catch (err) {
      console.error('Error fetching oris:', err);
    } finally {
      set({ isLoading: false });
    }
  },
});

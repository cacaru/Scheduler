import { type StateCreator } from 'zustand';
import { type DiaryState } from '../diaryStore';
import { getEntryRepository } from '../../repositories/entryRepository';
import { getSafeEntries } from './baseSlice';

export interface MovementSlice {
  moveItem: (id: string, fromDate: string, toDate: string) => Promise<void>;
  reorderItems: (date: string, activeId: string, overId: string) => void;
}

export const createMovementSlice: StateCreator<DiaryState, [], [], MovementSlice> = (set) => ({
  moveItem: async (id, fromDate, toDate) => {
    if (fromDate === toDate) return;

    try {
      await getEntryRepository().update(id, { date: toDate });
    } catch (err) {
      console.error('Error moving item:', err);
      return;
    }

    set((state) => {
      const fromEntries = [...getSafeEntries(state.entries, fromDate)];
      const idx = fromEntries.findIndex((item) => item.id === id);
      if (idx === -1) return state;

      const [moved] = fromEntries.splice(idx, 1);
      const toEntries = getSafeEntries(state.entries, toDate);

      return {
        entries: {
          ...state.entries,
          [fromDate]: fromEntries,
          [toDate]: [...toEntries, moved],
        },
      };
    });
  },

  reorderItems: (date, activeId, overId) => {
    set((state) => {
      const items = [...getSafeEntries(state.entries, date)];
      const oldIndex = items.findIndex((item) => item.id === activeId);
      const newIndex = items.findIndex((item) => item.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const [moved] = items.splice(oldIndex, 1);
        items.splice(newIndex, 0, moved);
      }

      return {
        entries: {
          ...state.entries,
          [date]: items,
        },
      };
    });
  },
});

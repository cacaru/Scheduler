import { type StateCreator } from 'zustand';
import { supabase } from '../../utils/supabase';
import { type DiaryState } from '../diaryStore';
import { getSafeEntries } from './baseSlice';

export interface MovementSlice {
  moveItem: (id: string, fromDate: string, toDate: string) => Promise<void>;
  reorderItems: (date: string, activeId: string, overId: string) => void;
}

export const createMovementSlice: StateCreator<DiaryState, [], [], MovementSlice> = (set) => ({
  moveItem: async (id, fromDate, toDate) => {
    if (fromDate === toDate) return;

    const { error } = await supabase
      .from('entries')
      .update({ date: toDate })
      .eq('id', id);

    if (error) {
      console.error('Error moving item:', error);
      return;
    }

    set((state) => {
      const fromEntries = [...getSafeEntries(state.entries, fromDate)];
      const itemIndex = fromEntries.findIndex((item) => item.id === id);
      if (itemIndex === -1) return state;
      
      const [movedItem] = fromEntries.splice(itemIndex, 1);
      const toEntries = getSafeEntries(state.entries, toDate);
      
      return {
        entries: {
          ...state.entries,
          [fromDate]: fromEntries,
          [toDate]: [...toEntries, movedItem],
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
        const [movedItem] = items.splice(oldIndex, 1);
        items.splice(newIndex, 0, movedItem);
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

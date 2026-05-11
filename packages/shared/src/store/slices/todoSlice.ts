import { type StateCreator } from 'zustand';
import { supabase } from '../../utils/supabase';
import { type DiaryState } from '../diaryStore';
import { getSafeEntries } from './baseSlice';

export interface TodoSlice {
  toggleTodo: (date: string, id: string) => Promise<void>;
}

export const createTodoSlice: StateCreator<DiaryState, [], [], TodoSlice> = (set, get) => ({
  toggleTodo: async (date, id) => {
    const items = getSafeEntries(get().entries, date);
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const newCompleted = !item.completed;
    const { error } = await supabase
      .from('entries')
      .update({ completed: newCompleted })
      .eq('id', id);

    if (error) {
      console.error('Error toggling todo:', error);
      return;
    }

    set((state) => ({
      entries: {
        ...state.entries,
        [date]: getSafeEntries(state.entries, date).map((i) =>
          i.id === id ? { ...i, completed: newCompleted } : i
        ),
      },
    }));
  },
});

import { type StateCreator } from 'zustand';
import { supabase } from '../../utils/supabase';
import { type EntryItem, type DiaryState } from '../diaryStore';

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    set({ isLoading: true });
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching oris:', error);
    } else {
      const grouped: Record<string, EntryItem[]> = {};
      
    data.forEach((item: any) => {
        const entry: EntryItem = {
          id: item.id,
          type: item.type,
          title: item.title,
          content: item.content,
          completed: item.completed,
          color: item.color,
          icon: item.icon,
          is_recurring: item.is_recurring,
          location: item.location,
          start_date: item.start_date,
          end_date: item.end_date,
        };

        // 모든 요소를 단일로 지정
        if (!grouped[item.date]) grouped[item.date] = [];
            grouped[item.date].push(entry);
    });
      
      set({ oriItem: grouped });
    }
    set({ isLoading: false });
  },

  
});
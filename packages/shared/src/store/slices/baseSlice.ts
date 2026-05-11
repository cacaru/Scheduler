import { type StateCreator } from 'zustand';
import { supabase } from '../../utils/supabase';
import { type EntryItem, type EntryType, type DiaryState } from '../diaryStore';
import { useUIStore } from '../uiStore';
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

export const createBaseSlice: StateCreator<DiaryState, [], [], BaseSlice> = (set) => ({
  entries: {},
  isLoading: false,

  fetchEntries: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      set({ isLoading: true });
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
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

        // 기간형 항목(todo) 처리
        if (item.type === 'todo' && item.start_date && item.end_date) {
          try {
            const start = parseISO(item.start_date);
            const end = parseISO(item.end_date);
            const days = eachDayOfInterval({ start, end });
            
            days.forEach(day => {
              const dateStr = format(day, 'yyyy-MM-dd');
              if (!grouped[dateStr]) grouped[dateStr] = [];
              grouped[dateStr].push(entry);
            });
          } catch (e) {
            console.error('Error expanding date interval:', e);
            if (!grouped[item.date]) grouped[item.date] = [];
            grouped[item.date].push(entry);
          }
        } else {
          // 단일 날짜 항목
          if (!grouped[item.date]) grouped[item.date] = [];
          grouped[item.date].push(entry);
        }
      });
      
      set({ entries: grouped });
    } catch (err) {
      console.error('Error fetching entries:', err);
      useUIStore.getState().showToast('데이터를 불러오는 중 오류가 발생했습니다.', 'error');
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (date, type, title, content, color, location, is_recurring, icon, start_date, end_date) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newItem: any = {
        user_id: user.id,
        date,
        type,
        title,
        content,
        completed: type === 'todo' ? false : undefined,
        color,
        is_recurring,
        icon,
        location,
        start_date,
        end_date,
      };

      const { data, error } = await supabase
        .from('entries')
        .insert(newItem)
        .select()
        .single();

      if (error) throw error;

      const entry: EntryItem = {
        id: data.id,
        type: data.type,
        title: data.title,
        content: data.content,
        completed: data.completed,
        color: data.color,
        icon: data.icon,
        is_recurring: data.is_recurring,
        location: data.location,
        start_date: data.start_date,
        end_date: data.end_date,
      };

      set((state) => {
        const nextEntries = { ...state.entries };
        
        if (type === 'todo' && start_date && end_date) {
          try {
            const days = eachDayOfInterval({ start: parseISO(start_date), end: parseISO(end_date) });
            days.forEach(day => {
              const dStr = format(day, 'yyyy-MM-dd');
              nextEntries[dStr] = [...getSafeEntries(nextEntries, dStr), entry];
            });
          } catch (e) {
            nextEntries[date] = [...getSafeEntries(nextEntries, date), entry];
          }
        } else {
          nextEntries[date] = [...getSafeEntries(nextEntries, date), entry];
        }
        
        return { entries: nextEntries };
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
      const { error } = await supabase
        .from('entries')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      set((state) => {
        const nextEntries = { ...state.entries };
        
        // 1. 모든 날짜에서 기존 항목 인스턴스 제거
        let updatedItem: EntryItem | null = null;
        Object.keys(nextEntries).forEach(d => {
          const item = nextEntries[d].find(i => i.id === id);
          if (item && !updatedItem) {
            updatedItem = { ...item, ...updates };
          }
          nextEntries[d] = nextEntries[d].filter(i => i.id !== id);
        });

        if (!updatedItem) return state;

        // 2. 업데이트된 정보를 바탕으로 다시 배치
        const item = updatedItem as EntryItem;
        if (item.type === 'todo' && item.start_date && item.end_date) {
          try {
            const days = eachDayOfInterval({ 
              start: parseISO(item.start_date), 
              end: parseISO(item.end_date) 
            });
            days.forEach(day => {
              const dStr = format(day, 'yyyy-MM-dd');
              if (!nextEntries[dStr]) nextEntries[dStr] = [];
              nextEntries[dStr] = [...nextEntries[dStr], item];
            });
          } catch (e) {
            // 폴백
          }
        } else {
          // 단일 날짜 항목
          const targetDate = (updates as any).date || _date;
          if (!nextEntries[targetDate]) nextEntries[targetDate] = [];
          nextEntries[targetDate] = [...nextEntries[targetDate], item];
        }

        return { entries: nextEntries };
      });
      useUIStore.getState().showToast('성공적으로 수정되었습니다.', 'success');
    } catch (err) {
      console.error('Error updating item:', err);
      useUIStore.getState().showToast('수정에 실패했습니다.', 'error');
    }
  },

  deleteItem: async (_date, id) => {
    try {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => {
        const nextEntries = { ...state.entries };
        Object.keys(nextEntries).forEach(d => {
          nextEntries[d] = nextEntries[d].filter(item => item.id !== id);
        });
        return { entries: nextEntries };
      });
      useUIStore.getState().showToast('삭제되었습니다.', 'success');
    } catch (err) {
      console.error('Error deleting item:', err);
      useUIStore.getState().showToast('삭제에 실패했습니다.', 'error');
    }
  },
});

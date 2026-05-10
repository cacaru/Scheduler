import { type StateCreator } from 'zustand';
import { supabase } from '../../utils/supabase';
import { type EntryItem, type EntryType, type DiaryState } from '../diaryStore';
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    set({ isLoading: true });
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching entries:', error);
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
    }
    set({ isLoading: false });
  },

  addItem: async (date, type, title, content, color, location, is_recurring, icon, start_date, end_date) => {
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

    if (error) {
      console.error('addItem Error:', error);
      throw error;
    }

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
  },

  updateItem: async (_date, id, updates) => {
    const { error } = await supabase
      .from('entries')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating item:', error);
      return;
    }

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
          // 폴백: 원래 날짜에 유지 (만약 _date가 유효하다면 사용)
          // 여기서는 아이템이 처음 발견된 날짜 정보를 찾기 어렵다면 다시 fetch하는 것이 안전할 수 있음
        }
      } else {
        // 단일 날짜 항목 (업데이트에 date가 포함되어 있을 수도 있음)
        const targetDate = (updates as any).date || _date;
        if (!nextEntries[targetDate]) nextEntries[targetDate] = [];
        nextEntries[targetDate] = [...nextEntries[targetDate], item];
      }

      return { entries: nextEntries };
    });
  },

  deleteItem: async (_date, id) => {
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting item:', error);
      return;
    }

    set((state) => {
      const nextEntries = { ...state.entries };
      Object.keys(nextEntries).forEach(d => {
        nextEntries[d] = nextEntries[d].filter(item => item.id !== id);
      });
      return { entries: nextEntries };
    });
  },
});

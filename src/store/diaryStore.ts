import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type EntryType = 'diary' | 'todo';

export interface EntryItem {
  id: string;
  type: EntryType;
  title: string;
  content: string;
  completed?: boolean;
  color?: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
    name?: string;
  };
}

interface DiaryState {
  entries: Record<string, EntryItem[]>;
  addItem: (date: string, type: EntryType, title: string, content: string, color?: string, location?: EntryItem['location']) => void;
  updateItem: (date: string, id: string, updates: Partial<EntryItem>) => void;
  deleteItem: (date: string, id: string) => void;
  toggleTodo: (date: string, id: string) => void;
  moveItem: (id: string, fromDate: string, toDate: string) => void;
  reorderItems: (date: string, activeId: string, overId: string) => void;
}

const getSafeEntries = (entries: Record<string, EntryItem[]>, date: string): EntryItem[] => {
  const existing = entries[date];
  return Array.isArray(existing) ? existing : [];
};

export const useDiaryStore = create<DiaryState>()(
  persist(
    (set) => ({
      entries: {},
      addItem: (date, type, title, content, color, location) =>
        set((state) => {
          const newItem: EntryItem = {
            id: crypto.randomUUID(),
            type,
            title,
            content,
            completed: type === 'todo' ? false : undefined,
            color,
            location,
          };
          
          return {
            entries: {
              ...state.entries,
              [date]: [...getSafeEntries(state.entries, date), newItem],
            },
          };
        }),
      updateItem: (date, id, updates) =>
        set((state) => ({
          entries: {
            ...state.entries,
            [date]: getSafeEntries(state.entries, date).map((item) =>
              item.id === id ? { ...item, ...updates } : item
            ),
          },
        })),
      deleteItem: (date, id) =>
        set((state) => ({
          entries: {
            ...state.entries,
            [date]: getSafeEntries(state.entries, date).filter((item) => item.id !== id),
          },
        })),
      toggleTodo: (date, id) =>
        set((state) => ({
          entries: {
            ...state.entries,
            [date]: getSafeEntries(state.entries, date).map((item) =>
              item.id === id ? { ...item, completed: !item.completed } : item
            ),
          },
        })),
      moveItem: (id, fromDate, toDate) =>
        set((state) => {
          if (fromDate === toDate) return state;
          
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
        }),
      reorderItems: (date, activeId, overId) =>
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
        }),
    }),
    {
      name: 'diary-storage',
    }
  )
);

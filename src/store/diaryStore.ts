import { create } from 'zustand';
import { createBaseSlice, type BaseSlice } from './slices/baseSlice';
import { createMovementSlice, type MovementSlice } from './slices/movementSlice';
import { createTodoSlice, type TodoSlice } from './slices/todoSlice';
import { createOriSlice, type OriSlice } from './slices/oriSlice';

export type EntryType = 'diary' | 'todo' | 'anniversary';

export interface EntryItem {
  id: string;
  type: EntryType;
  title: string;
  content: string;
  completed?: boolean;
  color?: string;
  icon?: string;
  is_recurring?: boolean;
  start_date?: string; // "yyyy-MM-dd"
  end_date?: string;   // "yyyy-MM-dd"
  location?: {
    lat: number;
    lng: number;
    address?: string;
    name?: string;
  };
}

export type DiaryState = BaseSlice & MovementSlice & TodoSlice & OriSlice;

export const useDiaryStore = create<DiaryState>()((...a) => ({
  ...createBaseSlice(...a),
  ...createMovementSlice(...a),
  ...createTodoSlice(...a),
  ...createOriSlice(...a),
}));

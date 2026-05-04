/**
 * uiStore.ts
 * 애플리케이션의 UI 상태(내비게이션, 특정 항목 바로가기, 수정 모드 등)를
 * 관리하는 전역 Zustand 스토어입니다.
 */
import { create } from 'zustand';

interface UIState {
  navigationDate: string | null;
  navigationEntryId: string | null;
  isEditMode: boolean;
  navigateAndOpenModal: (date: string, entryId?: string, isEdit?: boolean) => void;
  clearNavigation: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  navigationDate: null,
  navigationEntryId: null,
  isEditMode: false,
  navigateAndOpenModal: (date, entryId, isEdit) => set({ 
    navigationDate: date, 
    navigationEntryId: entryId || null,
    isEditMode: !!isEdit
  }),
  clearNavigation: () => set({ 
    navigationDate: null, 
    navigationEntryId: null,
    isEditMode: false
  }),
}));

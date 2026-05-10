/**
 * uiStore.ts
 * 애플리케이션의 UI 상태(내비게이션, 특정 항목 바로가기, 수정 모드 등)를
 * 관리하는 전역 Zustand 스토어입니다.
 */
import { create } from 'zustand';

export type Theme = 'light' | 'dark';

interface UIState {
  navigationDate: string | null;
  navigationEntryId: string | null;
  isEditMode: boolean;
  theme: Theme;
  theme_primary: string;
  theme_light: string;
  theme_heavy: string;
  modalCount: number;
  navigateAndOpenModal: (date: string, entryId?: string, isEdit?: boolean) => void;
  clearNavigation: () => void;
  toggleTheme: () => void;
  setThemeColors: (primary: string, light: string, heavy: string) => void;
  setModalOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  navigationDate: null,
  navigationEntryId: null,
  isEditMode: false,
  theme: (localStorage.getItem('theme') as Theme) || 'light',
  theme_primary: localStorage.getItem('theme_primary') || '#e2d5f9',
  theme_light: localStorage.getItem('theme_light') || '#e2d5f925',
  theme_heavy: localStorage.getItem('theme_heavy') || '#ac9ec4',
  modalCount: 0,
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
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    return { theme: newTheme };
  }),
  setThemeColors: (primary, light, heavy) => {
    localStorage.setItem('theme_primary', primary);
    localStorage.setItem('theme_light', light);
    localStorage.setItem('theme_heavy', heavy);
    document.documentElement.style.setProperty('--accent', primary);
    document.documentElement.style.setProperty('--accent-light', light);
    document.documentElement.style.setProperty('--accent-heavy', heavy);
    set({ theme_primary: primary, theme_light: light, theme_heavy: heavy });
  },
  setModalOpen: (isOpen) => set((state) => {
    const newCount = isOpen ? state.modalCount + 1 : Math.max(0, state.modalCount - 1);
    
    if (typeof document !== 'undefined') {
      if (newCount > 0) {
        document.body.classList.add('no-scroll');
      } else {
        document.body.classList.remove('no-scroll');
      }
    }
    
    return { modalCount: newCount };
  }),
}));

// 초기 테마 및 색상 즉시 적용 (FOUC 방지)
if (typeof document !== 'undefined') {
  const savedTheme = localStorage.getItem('theme') || 'light';
  const savedPrimary = localStorage.getItem('theme_primary') || '#e2d5f9';
  const savedLight = localStorage.getItem('theme_light') || '#e2d5f925';
  const savedHeavy = localStorage.getItem('theme_heavy') || '#ac9ec4';
  
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.documentElement.style.setProperty('--accent', savedPrimary);
  document.documentElement.style.setProperty('--accent-light', savedLight);
  document.documentElement.style.setProperty('--accent-heavy', savedHeavy);
}

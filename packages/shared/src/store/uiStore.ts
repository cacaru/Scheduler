/**
 * uiStore.ts
 * 애플리케이션의 UI 상태(내비게이션, 특정 항목 바로가기, 수정 모드 등)를
 * 관리하는 전역 Zustand 스토어입니다.
 */
import { create } from 'zustand';

export type Theme = 'light' | 'dark';
export type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  message: string | null;
  type: ToastType;
}

interface UIState {
  navigationDate: string | null;
  navigationEntryId: string | null;
  isEditMode: boolean;
  theme: Theme;
  theme_primary: string;
  theme_light: string;
  theme_heavy: string;
  bodyFont: string;
  titleFont: string;
  modalCount: number;
  toast: ToastState;
  navigateAndOpenModal: (date: string, entryId?: string, isEdit?: boolean) => void;
  clearNavigation: () => void;
  toggleTheme: () => void;
  setThemeColors: (primary: string, light: string, heavy: string) => void;
  setFonts: (body: string, title: string) => void;
  setModalOpen: (isOpen: boolean) => void;
  showToast: (message: string, type?: ToastType) => void;
  clearToast: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  navigationDate: null,
  navigationEntryId: null,
  isEditMode: false,
  theme: (localStorage.getItem('theme') as Theme) || 'light',
  theme_primary: localStorage.getItem('themePrimary') || '#e2d5f9',
  theme_light: localStorage.getItem('themeLight') || '#e2d5f925',
  theme_heavy: localStorage.getItem('themeHeavy') || '#ac9ec4',
  bodyFont: localStorage.getItem('bodyFont') || 'KyoboHandwriting2019',
  titleFont: localStorage.getItem('titleFont') || 'Cafe24Surround',
  modalCount: 0,
  toast: { message: null, type: 'info' },
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
    localStorage.setItem('themePrimary', primary);
    localStorage.setItem('themeLight', light);
    localStorage.setItem('themeHeavy', heavy);
    document.documentElement.style.setProperty('--accent', primary);
    document.documentElement.style.setProperty('--accent-light', light);
    document.documentElement.style.setProperty('--accent-heavy', heavy);
    set({ theme_primary: primary, theme_light: light, theme_heavy: heavy });
  },
  setFonts: (body, title) => {
    localStorage.setItem('bodyFont', body);
    localStorage.setItem('titleFont', title);
    document.documentElement.style.setProperty('--font-body', `"${body}", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif`);
    document.documentElement.style.setProperty('--font-title', `"${title}", sans-serif`);
    set({ bodyFont: body, titleFont: title });
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
  showToast: (message, type = 'info') => {
    set({ toast: { message, type } });
    setTimeout(() => {
      get().clearToast();
    }, 3000);
  },
  clearToast: () => set({ toast: { message: null, type: 'info' } }),
}));

// 초기 테마 및 색상, 폰트 즉시 적용 (FOUC 방지)
if (typeof document !== 'undefined') {
  const savedTheme = localStorage.getItem('theme') || 'light';
  const savedPrimary = localStorage.getItem('themePrimary') || '#e2d5f9';
  const savedLight = localStorage.getItem('themeLight') || '#e2d5f925';
  const savedHeavy = localStorage.getItem('themeHeavy') || '#ac9ec4';
  const savedBodyFont = localStorage.getItem('bodyFont') || 'KyoboHandwriting2019';
  const savedTitleFont = localStorage.getItem('titleFont') || 'Cafe24Surround';
  
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.documentElement.style.setProperty('--accent', savedPrimary);
  document.documentElement.style.setProperty('--accent-light', savedLight);
  document.documentElement.style.setProperty('--accent-heavy', savedHeavy);
  document.documentElement.style.setProperty('--font-body', `"${savedBodyFont}", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif`);
  document.documentElement.style.setProperty('--font-title', `"${savedTitleFont}", sans-serif`);
}

/**
 * uiStore.ts
 * 애플리케이션의 UI 상태(내비게이션, 특정 항목 바로가기, 수정 모드 등)를
 * 관리하는 전역 Zustand 스토어입니다.
 *
 * 영속화(localStorage 등)와 실제 DOM/스타일 적용은 플랫폼별 어댑터에 위임합니다.
 * 앱 진입점에서 setStorageAdapter/setThemeApplier를 먼저 호출하고
 * hydrateUIStore()로 저장된 값을 불러오세요.
 */
import { create } from 'zustand';
import { getStorageAdapter } from '../adapters/storage';
import { getThemeApplier } from '../adapters/theme';

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

export const UI_STORAGE_KEYS = {
  theme: 'theme',
  themePrimary: 'themePrimary',
  themeLight: 'themeLight',
  themeHeavy: 'themeHeavy',
  bodyFont: 'bodyFont',
  titleFont: 'titleFont',
} as const;

export const UI_DEFAULTS = {
  theme: 'light' as Theme,
  themePrimary: '#e2d5f9',
  themeLight: '#e2d5f925',
  themeHeavy: '#ac9ec4',
  bodyFont: 'KyoboHandwriting2019',
  titleFont: 'Cafe24Surround',
};

export const useUIStore = create<UIState>((set, get) => ({
  navigationDate: null,
  navigationEntryId: null,
  isEditMode: false,
  theme: UI_DEFAULTS.theme,
  theme_primary: UI_DEFAULTS.themePrimary,
  theme_light: UI_DEFAULTS.themeLight,
  theme_heavy: UI_DEFAULTS.themeHeavy,
  bodyFont: UI_DEFAULTS.bodyFont,
  titleFont: UI_DEFAULTS.titleFont,
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
    const newTheme: Theme = state.theme === 'light' ? 'dark' : 'light';
    getStorageAdapter().set(UI_STORAGE_KEYS.theme, newTheme);
    getThemeApplier().applyTheme(newTheme);
    return { theme: newTheme };
  }),
  setThemeColors: (primary, light, heavy) => {
    const storage = getStorageAdapter();
    storage.set(UI_STORAGE_KEYS.themePrimary, primary);
    storage.set(UI_STORAGE_KEYS.themeLight, light);
    storage.set(UI_STORAGE_KEYS.themeHeavy, heavy);
    getThemeApplier().applyColors(primary, light, heavy);
    set({ theme_primary: primary, theme_light: light, theme_heavy: heavy });
  },
  setFonts: (body, title) => {
    const storage = getStorageAdapter();
    storage.set(UI_STORAGE_KEYS.bodyFont, body);
    storage.set(UI_STORAGE_KEYS.titleFont, title);
    getThemeApplier().applyFonts(body, title);
    set({ bodyFont: body, titleFont: title });
  },
  setModalOpen: (isOpen) => set((state) => {
    const newCount = isOpen ? state.modalCount + 1 : Math.max(0, state.modalCount - 1);
    getThemeApplier().applyScrollLock(newCount > 0);
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

/**
 * 앱 진입 시 1회 호출. 저장소에서 값을 읽어 스토어에 주입하고 즉시 적용합니다.
 * 반드시 setStorageAdapter / setThemeApplier 후에 호출하세요.
 */
export function hydrateUIStore(): void {
  const storage = getStorageAdapter();
  const applier = getThemeApplier();

  const theme = (storage.get(UI_STORAGE_KEYS.theme) as Theme | null) || UI_DEFAULTS.theme;
  const primary = storage.get(UI_STORAGE_KEYS.themePrimary) || UI_DEFAULTS.themePrimary;
  const light = storage.get(UI_STORAGE_KEYS.themeLight) || UI_DEFAULTS.themeLight;
  const heavy = storage.get(UI_STORAGE_KEYS.themeHeavy) || UI_DEFAULTS.themeHeavy;
  const bodyFont = storage.get(UI_STORAGE_KEYS.bodyFont) || UI_DEFAULTS.bodyFont;
  const titleFont = storage.get(UI_STORAGE_KEYS.titleFont) || UI_DEFAULTS.titleFont;

  useUIStore.setState({
    theme,
    theme_primary: primary,
    theme_light: light,
    theme_heavy: heavy,
    bodyFont,
    titleFont,
  });

  applier.applyTheme(theme);
  applier.applyColors(primary, light, heavy);
  applier.applyFonts(bodyFont, titleFont);
}

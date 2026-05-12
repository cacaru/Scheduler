import { useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { supabase } from '../utils/supabase';

export type SidebarPanelType = 'todo' | 'diary' | 'anniversary' | null;

/**
 * 사이드바의 플랫폼 비종속 상태와 액션.
 *
 * 데스크톱 웹의 마우스 기반 리사이저는 플랫폼 의존이 강하므로 별도로
 * `apps/web/src/hooks/useSidebarResize.ts`로 분리되어 있다. 모바일에서는
 * 이 훅 대신 BottomTab/Drawer 패턴으로 교체될 예정이라 리사이저가 필요 없다.
 */
export const useSidebarUI = () => {
  const { user, setProfile } = useAuthStore();
  const { theme_primary, setThemeColors } = useUIStore();
  const [expandedPanel, setExpandedPanel] = useState<SidebarPanelType>(null);

  const [expandedTodoMonths, setExpandedTodoMonths] = useState<string[]>([]);
  const [expandedAnniMonths, setExpandedAnniMonths] = useState<string[]>([]);
  const [expandedDiaryMonths, setExpandedDiaryMonths] = useState<string[]>([]);

  const currentTheme = theme_primary;

  const togglePanel = useCallback((panel: SidebarPanelType) => {
    setExpandedPanel(prev => prev === panel ? null : panel);
  }, []);

  const changeTheme = useCallback(async (primary: string, light: string, heavy: string) => {
    setThemeColors(primary, light, heavy);

    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            theme_primary: primary,
            theme_light: light,
            theme_heavy: heavy,
          });

        if (!error) {
          setProfile({ id: user.id, theme_primary: primary, theme_light: light , theme_heavy: heavy});
        }
      } catch (err) {
        console.error('Failed to save theme to DB:', err);
      }
    }
  }, [user, setProfile, setThemeColors]);

  const toggleTodoMonth = useCallback((month: string) => {
    setExpandedTodoMonths(prev =>
      prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
    );
  }, []);

  const toggleAnniMonth = useCallback((month: string) => {
    setExpandedAnniMonths(prev =>
      prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
    );
  }, []);

  const toggleDiaryMonth = useCallback((month: string) => {
    setExpandedDiaryMonths(prev =>
      prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
    );
  }, []);

  const closeAllPanels = useCallback(() => {
    setExpandedPanel(null);
  }, []);

  return {
    expandedPanel,
    expandedTodoMonths,
    expandedAnniMonths,
    expandedDiaryMonths,
    currentTheme,
    actions: {
      togglePanel,
      changeTheme,
      toggleTodoMonth,
      toggleAnniMonth,
      toggleDiaryMonth,
      closeAllPanels
    }
  };
};

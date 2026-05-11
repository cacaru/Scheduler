import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { supabase } from '../utils/supabase';

export type SidebarPanelType = 'todo' | 'diary' | 'anniversary' | null;

export const useSidebarUI = () => {
  const { user, setProfile } = useAuthStore();
  const { theme_primary, setThemeColors } = useUIStore();
  const [expandedPanel, setExpandedPanel] = useState<SidebarPanelType>(null);
  
  // 개별 패널별 확장된 월 상태
  const [expandedTodoMonths, setExpandedTodoMonths] = useState<string[]>([]);
  const [expandedAnniMonths, setExpandedAnniMonths] = useState<string[]>([]);
  const [expandedDiaryMonths, setExpandedDiaryMonths] = useState<string[]>([]);

  const [extensionWidth, setExtensionWidth] = useState(340);
  const [isResizing, setIsResizing] = useState(false);
  
  // 전역 스토어의 색상을 현재 테마로 사용
  const currentTheme = theme_primary;

  const togglePanel = useCallback((panel: SidebarPanelType) => {
    setExpandedPanel(prev => prev === panel ? null : panel);
  }, []);

  const changeTheme = useCallback(async (primary: string, light: string, heavy: string) => {
    // 1. 전역 스토어 및 LocalStorage 즉시 반영
    setThemeColors(primary, light, heavy);
    
    // 2. DB 업데이트 (로그인 상태인 경우)
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

  // 리사이징 로직
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newWidth = e.clientX - 260; // 사이드 메뉴 너비 고려
      if (newWidth > 280 && newWidth < 600) {
        setExtensionWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  // 월별 확장 토글 로직
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
    extensionWidth,
    isResizing,
    currentTheme,
    actions: {
      togglePanel,
      changeTheme,
      startResizing,
      toggleTodoMonth,
      toggleAnniMonth,
      toggleDiaryMonth,
      closeAllPanels
    }
  };
};

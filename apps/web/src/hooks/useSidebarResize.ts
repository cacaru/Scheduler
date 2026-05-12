import { useState, useCallback, useEffect } from 'react';

/**
 * 데스크톱 웹의 마우스 기반 사이드바 리사이저.
 * window의 mousemove/mouseup 이벤트를 직접 사용하므로 웹 전용이다.
 */
export const useSidebarResize = (initialWidth = 340, min = 280, max = 600, baseOffset = 260) => {
  const [extensionWidth, setExtensionWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newWidth = e.clientX - baseOffset;
      if (newWidth > min && newWidth < max) {
        setExtensionWidth(newWidth);
      }
    }
  }, [isResizing, baseOffset, min, max]);

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

  return { extensionWidth, isResizing, startResizing };
};

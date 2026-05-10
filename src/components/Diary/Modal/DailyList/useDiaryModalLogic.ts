import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useDiaryStore } from '../../../../store/diaryStore';
import { useUIStore } from '../../../../store/uiStore';
import { useDiaryForm } from './useDiaryForm';
import { type DragStartEvent, type DragEndEvent } from '@dnd-kit/core';

/**
 * useDiaryModalLogic.ts
 * DiaryModal 컴포넌트의 비즈니스 로직을 전담하는 커스텀 훅입니다.
 * 상태 관리, 애니메이션 처리, DnD 이벤트 핸들링, 내비게이션 요청 처리를 수행합니다.
 */

interface UseDiaryModalLogicProps {
  date: string;
  isOpen: boolean;
  onClose: () => void;
}

export const useDiaryModalLogic = ({ date, isOpen, onClose }: UseDiaryModalLogicProps) => {
  const entries = useDiaryStore(state => state.entries);
  const deleteItem = useDiaryStore(state => state.deleteItem);
  const toggleTodo = useDiaryStore(state => state.toggleTodo);
  const reorderItems = useDiaryStore(state => state.reorderItems);

  const navigationEntryId = useUIStore(state => state.navigationEntryId);
  const isEditMode = useUIStore(state => state.isEditMode);
  const clearNavigation = useUIStore(state => state.clearNavigation);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const hasNavigated = useRef(false);

  const dayItems = useMemo(() => {
    const dailyItems = entries[date] || [];
    
    // 반복 기념일 찾기 (다른 연도의 같은 월/일)
    const currentMonthDay = date.slice(5); // "MM-dd"
    const recurringAnnis: any[] = [];
    
    Object.keys(entries).forEach(dateStr => {
      if (dateStr === date) return;
      if (dateStr.endsWith(currentMonthDay)) {
        const annis = entries[dateStr].filter(item => item.type === 'anniversary' && item.is_recurring);
        recurringAnnis.push(...annis);
      }
    });

    const combined = [...dailyItems, ...recurringAnnis];

    // 기념일 최상단, 그 외에는 시작일(오래된 순) 정렬
    return combined.sort((a, b) => {
      // 1. 기념일 우선
      if (a.type === 'anniversary' && b.type !== 'anniversary') return -1;
      if (a.type !== 'anniversary' && b.type === 'anniversary') return 1;
      
      // 2. 시작일 기준 정렬 (오래된 순)
      const aStart = a.start_date || '9999-99-99';
      const bStart = b.start_date || '9999-99-99';
      
      if (aStart !== bStart) {
        return aStart.localeCompare(bStart);
      }
      
      return 0;
    });
  }, [entries, date]);

  const selectedDetailItem = useMemo(() => {
    if (!selectedDetailId) return null;
    return dayItems.find(item => item.id === selectedDetailId) || null;
  }, [selectedDetailId, dayItems]);

  const activeItem = useMemo(() => {
    if (!activeId) return null;
    return dayItems.find(item => item.id === activeId) || null;
  }, [activeId, dayItems]);

  const form = useDiaryForm({ 
    initialDate: date, 
    onClose: () => setIsFormOpen(false) 
  });

  const { resetForm, handleEdit } = form.actions;

  // 1. 초기화 로직
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setIsFormOpen(false);
      setSelectedDetailId(null);
      hasNavigated.current = false;
      resetForm();
    }
  }, [isOpen, resetForm]);

  // 2. 내비게이션 요청 처리
  useEffect(() => {
    if (isOpen && navigationEntryId && !hasNavigated.current) {
      const itemToSelect = dayItems.find(item => item.id === navigationEntryId);
      if (itemToSelect) {
        setSelectedDetailId(navigationEntryId);
        if (isEditMode) {
          handleEdit(itemToSelect);
          setIsFormOpen(true);
        }
        hasNavigated.current = true;
        clearNavigation();
      }
    }
  }, [isOpen, navigationEntryId, isEditMode, dayItems, handleEdit, clearNavigation]);

  // 애니메이션 포함 종료
  const handleDelayedClose = useCallback(() => {
    setIsClosing(true);
    setSelectedDetailId(null);
    setIsFormOpen(false);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 400); 
  }, [onClose]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderItems(date, active.id as string, over.id as string);
    }
    setActiveId(null);
  }, [date, reorderItems]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleDelayedClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, handleDelayedClose]);

  return {
    state: {
      isClosing,
      isFormOpen,
      selectedDetailId,
      selectedDetailItem,
      activeId,
      activeItem,
      dayItems,
    },
    actions: {
      setIsFormOpen,
      setSelectedDetailId,
      handleDelayedClose,
      handleDragStart,
      handleDragEnd,
      deleteItem,
      toggleTodo,
    },
    form
  };
};

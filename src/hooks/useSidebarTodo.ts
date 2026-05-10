/**
 * useSidebarTodo.ts
 * 사이드바에 표시될 할 일 목록을 월별/일별로 그룹화하고,
 * 목록 내에서의 빠른 편집 및 선택 상태를 관리하는 커스텀 훅입니다.
 */
import { useState, useMemo, useCallback } from 'react';
import { useDiaryStore, type EntryItem } from '../store/diaryStore';
import { PRESET_COLORS } from '../constants/colors';

interface EditFormState {
  title: string;
  date: string;
  color: string;
  originalDate: string;
}

export const useSidebarTodo = () => {
  const entries = useDiaryStore((state) => state.entries);
  const updateItem = useDiaryStore((state) => state.updateItem);
  const moveItem = useDiaryStore((state) => state.moveItem);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({
    title: '',
    date: '',
    color: '',
    originalDate: '',
  });

  const groupedTodos = useMemo(() => {
    const groups: { [month: string]: { [date: string]: EntryItem[] } } = {};

    // 1. 모든 고유한 Todo 추출 (ID 중복 제거)
    const allUniqueTodos = new Map<string, { item: EntryItem, date: string }>();
    Object.entries(entries).forEach(([date, items]) => {
      items.filter(i => i.type === 'todo').forEach(todo => {
        if (!allUniqueTodos.has(todo.id)) {
          allUniqueTodos.set(todo.id, { item: todo, date });
        }
      });
    });

    // 2. 그룹화 로직
    allUniqueTodos.forEach(({ item, date }, _id) => {
      const isRange = item.start_date && item.end_date && item.start_date !== item.end_date;
      
      // 기준 월 결정 (기간형은 시작일 기준, 단일형은 등록일 기준)
      const targetDate = isRange ? item.start_date! : date;
      const month = targetDate.substring(0, 7);
      
      if (!groups[month]) groups[month] = {};

      if (isRange) {
        // 기간형 항목은 해당 월의 'range' 섹션에 모음
        if (!groups[month]['range']) groups[month]['range'] = [];
        groups[month]['range'].push(item);
      } else {
        // 단일 날짜 항목은 기존처럼 일별 분류
        if (!groups[month][date]) groups[month][date] = [];
        groups[month][date].push(item);
      }
    });

    return groups;
  }, [entries]);

  const selectedTodoInfo = useMemo(() => {
    if (!selectedTodoId) return null;
    for (const [date, items] of Object.entries(entries)) {
      const item = items.find(i => i.id === selectedTodoId);
      if (item) return { item, date };
    }
    return null;
  }, [selectedTodoId, entries]);

  const sortedMonths = useMemo(
    () => Object.keys(groupedTodos).sort((a, b) => b.localeCompare(a)),
    [groupedTodos]
  );
// ... rest of the hook stays the same

  const toggleTodo = useDiaryStore((state) => state.toggleTodo);

  const startEditing = useCallback((date: string, item: EntryItem) => {
    setEditingId(item.id);
    setEditForm({
      title: item.title,
      date: date,
      color: item.color || PRESET_COLORS[0],
      originalDate: date,
    });
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingId || !editForm.title.trim() || !editForm.date) return;

    updateItem(editForm.originalDate, editingId, {
      title: editForm.title,
      color: editForm.color,
    });

    if (editForm.originalDate !== editForm.date) {
      moveItem(editingId, editForm.originalDate, editForm.date);
    }

    setEditingId(null);
  }, [editingId, editForm, updateItem, moveItem]);

  const cancelEditing = useCallback(() => {
    setEditingId(null);
  }, []);

  return {
    groupedTodos,
    sortedMonths,
    editingId,
    selectedTodoId,
    setSelectedTodoId,
    selectedTodo: selectedTodoInfo,
    editForm,
    setEditForm,
    actions: {
      startEditing,
      handleSaveEdit,
      cancelEditing,
      toggleTodo,
    },
  };
};

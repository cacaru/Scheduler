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

    Object.entries(entries).forEach(([date, items]) => {
      const todos = items.filter((item) => item.type === 'todo');
      if (todos.length === 0) return;

      const month = date.substring(0, 7);
      if (!groups[month]) groups[month] = {};
      groups[month][date] = todos;
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
    },
  };
};

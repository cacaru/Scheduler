import { useState, useCallback, useEffect } from 'react';
import { useDiaryStore, type EntryType, type EntryItem } from '@project/shared/src/store/diaryStore';
import { PRESET_COLORS } from '@project/shared/src/constants/colors';
import { useUIStore } from '@project/shared/src/store/uiStore';


/**
 * useDiaryForm.ts
 * 일기 및 할 일의 등록/수정 폼의 상태와 비즈니스 로직을 관리하는 커스텀 훅입니다.
 */

interface UseDiaryFormProps {
  initialDate: string;
  onClose: () => void;
}

export const useDiaryForm = ({ initialDate, onClose }: UseDiaryFormProps) => {
  const addItem = useDiaryStore((state) => state.addItem);
  const updateItem = useDiaryStore((state) => state.updateItem);

  const [type, setType] = useState<EntryType>('diary');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(initialDate);
  const [startDate, setStartDate] = useState(initialDate);
  const [endDate, setEndDate] = useState(initialDate);
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [selectedLocation, setSelectedLocation] = useState<EntryItem['location'] | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);

  // 초기 날짜 동기화 (모달이 열릴 때)
  useEffect(() => {
    setDate(initialDate);
    setStartDate(initialDate);
    setEndDate(initialDate);
  }, [initialDate]);

  const resetForm = useCallback(() => {
    setType('diary');
    setTitle('');
    setContent('');
    setDate(initialDate);
    setStartDate(initialDate);
    setEndDate(initialDate);
    setSelectedColor(PRESET_COLORS[0]);
    setSelectedLocation(undefined);
    setEditingId(null);
    setShowMap(false);
  }, [initialDate]);

  const handleEdit = useCallback((item: EntryItem) => {
    setType(item.type);
    setTitle(item.title);
    setContent(item.content);
    setSelectedColor(item.color || PRESET_COLORS[0]);
    setSelectedLocation(item.location);
    setEditingId(item.id);
    setShowMap(!!item.location);
    
    if (item.start_date && item.end_date) {
      setStartDate(item.start_date);
      setEndDate(item.end_date);
    } else {
      setStartDate(initialDate);
      setEndDate(initialDate);
    }
  }, [initialDate]);

  const handleAddOrUpdate = useCallback(() => {
    if (!title.trim()) {
      useUIStore.getState().showToast('제목을 입력해주세요.', 'error');
      return;
    }

    const itemData: any = {
      type,
      title,
      content,
      color: selectedColor,
      location: selectedLocation,
    };

    if (type === 'todo') {
      itemData.start_date = startDate;
      itemData.end_date = endDate;
    }

    if (editingId) {
      updateItem(initialDate, editingId, itemData);
    } else {
      addItem(
        date, 
        type, 
        title, 
        content, 
        selectedColor, 
        selectedLocation,
        false,
        undefined,
        itemData.start_date,
        itemData.end_date
      );
    }

    resetForm();
    onClose();
  }, [date, initialDate, type, title, content, selectedColor, selectedLocation, editingId, startDate, endDate, addItem, updateItem, resetForm, onClose]);

  return {
    formState: { type, title, content, date, startDate, endDate, selectedColor, selectedLocation, editingId, showMap },
    setters: { setType, setTitle, setContent, setDate, setStartDate, setEndDate, setSelectedColor, setSelectedLocation, setShowMap },
    actions: { handleEdit, handleAddOrUpdate, resetForm }
  };
};

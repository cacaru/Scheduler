import { useState, useCallback } from 'react';
import { useDiaryStore, type EntryItem, type EntryType } from '../../../store/diaryStore';
import { PRESET_COLORS } from '../../../constants/colors';

/**
 * useDiaryForm.ts
 * 일기 및 할 일의 등록/수정 폼의 상태와 비즈니스 로직을 관리하는 커스텀 훅입니다.
 */

interface UseDiaryFormProps {
  date: string;
  onClose: () => void;
}

export const useDiaryForm = ({ date, onClose }: UseDiaryFormProps) => {
  const addItem = useDiaryStore((state) => state.addItem);
  const updateItem = useDiaryStore((state) => state.updateItem);

  const [type, setType] = useState<EntryType>('diary');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [selectedLocation, setSelectedLocation] = useState<EntryItem['location'] | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);

  const resetForm = useCallback(() => {
    setType('diary');
    setTitle('');
    setContent('');
    setSelectedColor(PRESET_COLORS[0]);
    setSelectedLocation(undefined);
    setEditingId(null);
    setShowMap(false);
  }, []);

  const handleEdit = useCallback((item: EntryItem) => {
    setType(item.type);
    setTitle(item.title);
    setContent(item.content);
    setSelectedColor(item.color || PRESET_COLORS[0]);
    setSelectedLocation(item.location);
    setEditingId(item.id);
    setShowMap(!!item.location);
  }, []);

  const handleAddOrUpdate = useCallback(() => {
    if (!title.trim()) return;

    const itemData = {
      type,
      title,
      content: type === 'diary' ? content : '',
      color: selectedColor,
      location: selectedLocation,
    };

    if (editingId) {
      updateItem(date, editingId, itemData);
    } else {
      // diaryStore의 addItem은 positional arguments를 기대함
      addItem(
        date, 
        type, 
        title, 
        type === 'diary' ? content : '', 
        selectedColor, 
        selectedLocation
      );
    }

    resetForm();
    onClose();
  }, [date, type, title, content, selectedColor, selectedLocation, editingId, addItem, updateItem, resetForm, onClose]);

  return {
    formState: { type, title, content, selectedColor, selectedLocation, editingId, showMap },
    setters: { setType, setTitle, setContent, setSelectedColor, setSelectedLocation, setShowMap },
    actions: { handleEdit, handleAddOrUpdate, resetForm }
  };
};

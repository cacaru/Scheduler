import { useState, useCallback, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { useDiaryStore, type EntryItem } from '../store/diaryStore';
import { ANNI_COLORS as COLORS } from '../constants/colors';

interface UseAnniversaryFormProps {
  isOpen: boolean;
  initialDate?: string;
  onClose: () => void;
}

export const useAnniversaryForm = ({ isOpen, initialDate, onClose }: UseAnniversaryFormProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [viewMonth, setViewMonth] = useState(new Date());
  const [selectedIcon, setSelectedIcon] = useState('Gift');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isRecurring, setIsRecurring] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<EntryItem['location']>();
  const [showMap, setShowMap] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const addItem = useDiaryStore(state => state.addItem);

  // 모달이 열릴 때 초기 날짜 동기화
  useEffect(() => {
    if (isOpen) {
      const targetDate = initialDate || format(new Date(), 'yyyy-MM-dd');
      setDate(targetDate);
      setViewMonth(parseISO(targetDate));
    }
  }, [isOpen, initialDate]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    setIsLoading(true);
    try {
      await addItem(
        date,
        'anniversary',
        title,
        content,
        selectedColor,
        selectedLocation,
        isRecurring,
        selectedIcon
      );
      onClose();
      // Reset form
      setTitle('');
      setContent('');
      setSelectedIcon('Gift');
      setIsRecurring(true);
      setSelectedLocation(undefined);
      setShowMap(false);
    } catch (error: any) {
      console.error('Failed to add anniversary:', error);
      alert('기념일 저장에 실패했습니다: ' + (error.message || '알 수 없는 에러'));
    } finally {
      setIsLoading(false);
    }
  }, [title, date, content, selectedColor, selectedLocation, isRecurring, selectedIcon, addItem, onClose]);

  return {
    state: {
      title,
      content,
      date,
      viewMonth,
      selectedIcon,
      selectedColor,
      isRecurring,
      selectedLocation,
      showMap,
      isLoading
    },
    setters: {
      setTitle,
      setContent,
      setDate,
      setViewMonth,
      setSelectedIcon,
      setSelectedColor,
      setIsRecurring,
      setSelectedLocation,
      setShowMap
    },
    actions: {
      handleSubmit
    }
  };
};

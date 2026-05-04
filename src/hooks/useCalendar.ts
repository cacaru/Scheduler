import { useState, useCallback, useMemo } from 'react';
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from 'date-fns';

export type CalendarViewMode = 'calendar' | 'months' | 'years';

export const useCalendar = (initialDate: Date = new Date()) => {
  const [currentMonth, setCurrentMonth] = useState(initialDate);
  const [animationClass, setAnimationClass] = useState('');
  const [viewMode, setViewMode] = useState<CalendarViewMode>('months');

  const nextMonth = useCallback(() => {
    if (viewMode === 'calendar') {
      setAnimationClass('slide-left');
      setTimeout(() => {
        setCurrentMonth((prev) => addMonths(prev, 1));
        setAnimationClass('');
      }, 50);
    } else if (viewMode === 'years') {
      setCurrentMonth((prev) => addMonths(prev, 12));
    } else if (viewMode === 'months') {
      setCurrentMonth((prev) => addMonths(prev, 1));
    }
  }, [viewMode]);

  const prevMonth = useCallback(() => {
    if (viewMode === 'calendar') {
      setAnimationClass('slide-right');
      setTimeout(() => {
        setCurrentMonth((prev) => subMonths(prev, 1));
        setAnimationClass('');
      }, 50);
    } else if (viewMode === 'years') {
      setCurrentMonth((prev) => subMonths(prev, 12));
    } else if (viewMode === 'months') {
      setCurrentMonth((prev) => subMonths(prev, 1));
    }
  }, [viewMode]);

  const setMonth = useCallback((month: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), month, 1));
    setViewMode('calendar');
  }, []);

  const setYear = useCallback((year: number) => {
    setCurrentMonth(prev => new Date(year, prev.getMonth(), 1));
    setViewMode('months');
  }, []);

  const monthStart = useMemo(() => startOfMonth(currentMonth), [currentMonth]);
  
  const calendarDays = useMemo(() => {
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(endOfMonth(monthStart));
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [monthStart]);

  return {
    currentMonth,
    calendarDays,
    monthStart,
    nextMonth,
    prevMonth,
    animationClass,
    viewMode,
    setViewMode,
    setMonth,
    setYear
  };
};

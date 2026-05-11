import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth,
  parseISO
} from 'date-fns';
import styles from './MiniCalendar.module.css';
import clsx from 'clsx';

interface MiniCalendarProps {
  selectedDate: string; // "yyyy-MM-dd"
  onDateSelect: (date: string) => void;
  viewMonth: Date;
  onMonthChange: (date: Date) => void;
  activeColor?: string;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({
  selectedDate,
  onDateSelect,
  viewMonth,
  onMonthChange,
  activeColor = '#ffadad'
}) => {
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(viewMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [viewMonth]);

  const selectedDateObj = useMemo(() => parseISO(selectedDate), [selectedDate]);

  return (
    <div className={styles.miniCalendar}>
      <div className={styles.miniCalHeader}>
        <button type="button" onClick={() => onMonthChange(subMonths(viewMonth, 1))}>
          <ChevronLeft size={16} />
        </button>
        <span>{format(viewMonth, 'yyyy년 MM월')}</span>
        <button type="button" onClick={() => onMonthChange(addMonths(viewMonth, 1))}>
          <ChevronRight size={16} />
        </button>
      </div>
      <div className={styles.miniCalGrid}>
        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
          <div key={day} className={styles.miniCalDayName}>{day}</div>
        ))}
        {calendarDays.map(day => {
          const isSelected = isSameDay(day, selectedDateObj);
          const isCurrentMonth = isSameMonth(day, viewMonth);
          const dateStr = format(day, 'yyyy-MM-dd');
          
          return (
            <button
              key={day.toISOString()}
              type="button"
              className={clsx(
                styles.miniCalDay,
                isSelected && styles.active,
                !isCurrentMonth && styles.otherMonth
              )}
              style={isSelected ? { backgroundColor: activeColor, boxShadow: `0 4px 10px ${activeColor}66` } : {}}
              onClick={() => onDateSelect(dateStr)}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendar;

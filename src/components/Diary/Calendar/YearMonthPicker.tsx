import React from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format, addMonths, subMonths, eachYearOfInterval, startOfYear, endOfYear } from 'date-fns';
import './YearMonthPicker.css';

/**
 * YearMonthPicker.tsx
 * 달력 상단의 연/월을 클릭했을 때 나타나는 빠른 이동 모달입니다.
 * 특정 연도와 월을 직접 선택하여 달력 시점을 변경할 수 있습니다.
 */

interface YearMonthPickerProps {
  isOpen: boolean;
  onClose: () => void;
  viewMode: 'months' | 'years';
  setViewMode: (mode: 'months' | 'years') => void;
  currentMonth: Date;
  onMonthSelect: (month: Date) => void;
  onYearSelect: (year: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

const YearMonthPicker: React.FC<YearMonthPickerProps> = ({
  isOpen,
  onClose,
  viewMode,
  setViewMode,
  currentMonth,
  onMonthSelect,
  onYearSelect,
  onPrev,
  onNext
}) => {
  if (!isOpen) return null;

  const years = eachYearOfInterval({
    start: startOfYear(subMonths(currentMonth, 60)),
    end: endOfYear(addMonths(currentMonth, 60))
  });

  return (
    <div className="jump-modal-overlay" onClick={onClose}>
      <div className="jump-modal-content" onClick={e => e.stopPropagation()}>
        <div className="jump-modal-header">
          <button onClick={onPrev} className="jump-nav-btn"><ChevronLeft size={20} /></button>
          <span className="jump-current-view" onClick={() => setViewMode(viewMode === 'months' ? 'years' : 'months')}>
            {viewMode === 'months' ? format(currentMonth, 'yyyy년') : '연도 선택'}
          </span>
          <button onClick={onNext} className="jump-nav-btn"><ChevronRight size={20} /></button>
          <button onClick={onClose} className="jump-close-btn"><X size={20} /></button>
        </div>

        <div className="jump-modal-body">
          {viewMode === 'months' ? (
            <div className="month-grid">
              {Array.from({ length: 12 }).map((_, i) => {
                const monthDate = new Date(currentMonth.getFullYear(), i, 1);
                const isSelected = currentMonth.getMonth() === i;
                return (
                  <button
                    key={i}
                    className={`month-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => onMonthSelect(monthDate)}
                  >
                    {i + 1}월
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="year-grid">
              {years.map((yearDate) => {
                const year = yearDate.getFullYear();
                const isSelected = currentMonth.getFullYear() === year;
                return (
                  <button
                    key={year}
                    className={`year-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      onYearSelect(year);
                      setViewMode('months');
                    }}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YearMonthPicker;

import React from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import './YearMonthPicker.css';

/**
 * YearMonthPicker.tsx
 * 통합형 레이아웃: 연도 그리드(상단)와 월 그리드(하단)를 한 화면에 표시
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
  currentMonth,
  onMonthSelect,
  onYearSelect,
  onPrev,
  onNext
}) => {
  if (!isOpen) return null;

  const currentYear = currentMonth.getFullYear();
  const currentMonthIdx = currentMonth.getMonth();

  // 연도 그리드 계산 (12개 연도 표시)
  const startYear = Math.floor(currentYear / 12) * 12;
  const years = Array.from({ length: 12 }, (_, i) => startYear + i);

  return (
    <div className="ymcp-modal-overlay" onClick={onClose}>
      <div className="ymcp-modal-content" onClick={e => e.stopPropagation()}>
        
        {/* [상단: 연도 선택 섹션] */}
        <div className="ymcp-section-header">
          <button onClick={onPrev} className="ymcp-mini-nav-btn"><ChevronLeft size={18} /></button>
          <h4>연도 선택</h4>
          <button onClick={onNext} className="ymcp-mini-nav-btn"><ChevronRight size={18} /></button>
        </div>
        <div className="ymcp-section-content">
          <div className="ymcp-picker-grid years">
            {years.map((y) => (
              <button
                key={y}
                className={`ymcp-picker-item ${currentYear === y ? 'ymcp-active' : ''}`}
                onClick={() => onYearSelect(y)}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        <div className="ymcp-divider" />

        {/* [하단: 월 선택 섹션] */}
        <div className="ymcp-section-header">
          <div style={{ width: 26 }} />
          <h4>월 선택 ({currentYear}년)</h4>
          <button onClick={onClose} className="ymcp-close-btn"><X size={18} /></button>
        </div>
        <div className="ymcp-section-content">
          <div className="ymcp-picker-grid months">
            {Array.from({ length: 12 }).map((_, i) => (
              <button
                key={i}
                className={`ymcp-picker-item ${currentMonthIdx === i ? 'ymcp-active' : ''}`}
                onClick={() => onMonthSelect(new Date(currentYear, i, 1))}
              >
                {i + 1}월
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearMonthPicker;

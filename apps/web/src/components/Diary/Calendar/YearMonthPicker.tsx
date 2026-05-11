import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import styles from './YearMonthPicker.module.css';
import clsx from 'clsx';

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
}

const YearMonthPicker: React.FC<YearMonthPickerProps> = ({
  isOpen,
  onClose,
  currentMonth,
  onMonthSelect,
  onYearSelect
}) => {
  if (!isOpen) return null;

  const currentYear = currentMonth.getFullYear();
  const currentMonthIdx = currentMonth.getMonth();

  // 연도 그리드 계산 (12개 연도 표시)
  const [startYear, setStartYear] = useState<number>(Math.floor(currentYear / 10) * 10);
  const [years, setYears] = useState<Array<number>>(Array.from({ length: 10 }, (_, i) => startYear + i));

  const onPrev = () => {
    setStartYear(startYear - 10);
  }

  const onNext = () => {
    setStartYear(startYear + 10);
  }

  useEffect( () => {
    setYears(Array.from({length: 10}, (_, i) => startYear + i));
  }, [startYear]);

  return (
    <div className={styles.ymcpModalOverlay} onClick={onClose}>
      <div className={styles.ymcpModalContent} onClick={e => e.stopPropagation()}>
        
        {/* [상단: 연도 선택 섹션] */}
        <div className={styles.ymcpSectionHeader}>
          <button onClick={onPrev} className={styles.ymcpMiniNavBtn}><ChevronLeft size={18} /></button>
          <h4>연도 선택</h4>
          <button onClick={onNext} className={styles.ymcpMiniNavBtn}><ChevronRight size={18} /></button>
        </div>
        <div className={styles.ymcpSectionContent}>
          <div className={clsx(styles.ymcpPickerGrid, styles.years)}>
            {years.map((y) => (
              <button
                key={y}
                className={clsx( styles.ymcpPickerItem, currentYear === y && styles.ymcpActive)}
                onClick={() => onYearSelect(y)}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.ymcpDivider} />

        {/* [하단: 월 선택 섹션] */}
        <div className={styles.ymcpSectionHeader}>
          <div style={{ width: 26 }} />
          <h4>월 선택 ({currentYear}년)</h4>
          <button onClick={onClose} className={styles.ymcpCloseBtn}><X size={18} /></button>
        </div>
        <div className={styles.ymcpSectionContent}>
          <div className={clsx(styles.ymcpPickerGrid, styles.months)}>
            {Array.from({ length: 12 }).map((_, i) => (
              <button
                key={i}
                className={clsx(styles.ymcpPickerItem, currentMonthIdx === i && styles.ymcpActive)}
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

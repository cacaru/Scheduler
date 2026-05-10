import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  format,
  isSameMonth,
  isSameDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Gift } from 'lucide-react';
import { 
  DndContext, 
  type DragEndEvent, 
  useDraggable, 
  useDroppable, 
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useDiaryStore, type EntryItem } from '../../../store/diaryStore';
import { formatYearMonth } from '../../../utils/dateUtils';
import { useCalendar } from '../../../hooks/useCalendar';
import DiaryModal from '../Modal/DailyList/DiaryModal';
import YearMonthPicker from './YearMonthPicker';
import { useUIStore } from '../../../store/uiStore';
import './Diary.css';
import { ANNIVERSARY_ICONS } from '../../../constants/anniversary';

/**
 * DiaryCalendar.tsx
 * 메인 달력 인터페이스를 렌더링하고 관리합니다.
 * 드래그 앤 드롭을 통한 항목 이동, 스와이프를 통한 월 전환, 날짜별 모달 오픈을 처리합니다.
 */

// 드래그 가능한 항목
const DraggableEntry = React.memo<{activate: boolean, item: EntryItem; date: string }>(({activate, item, date }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: { date, id: item.id },
  });

  const isRange = item.type === 'todo' && item.start_date && item.end_date && item.start_date !== item.end_date;
  const isStart = isRange && item.start_date === date;
  const isEnd = isRange && item.end_date === date;
  const isMiddle = isRange && !isStart && !isEnd;

  const { theme } = useUIStore();

  const style = useMemo(() => {
    const bgColor = item.color;
    const s: React.CSSProperties = {
      opacity: isDragging ? 0.3 : 1,
      borderLeft: isRange && !isStart ? 'none' : `4px solid ${bgColor}`,
      backgroundColor: bgColor + '90',
      color: theme === 'dark' ? 'white' : 'black',
      fontWeight: 'normal',
      position: 'relative',
      zIndex: isRange ? 5 : 1,
    };

    if (isRange) {
      s.borderRadius = '0px';
      if (isStart) {
        s.borderTopLeftRadius = '8px';
        s.borderBottomLeftRadius = '8px';
        s.marginRight = '-13px'; // 부모 패딩 12px + 미세 보정
        s.paddingRight = '13px';
      } else if (isEnd) {
        s.borderTopRightRadius = '8px';
        s.borderBottomRightRadius = '8px';
        s.marginLeft = '-13px';
        s.paddingLeft = '13px';
      } else if (isMiddle) {
        s.marginLeft = '-13px';
        s.marginRight = '-13px';
        s.paddingLeft = '13px';
        s.paddingRight = '13px';
      }
    }

    return s;
  }, [isDragging, item.color, item.type, isRange, isStart, isEnd, isMiddle]);

  if (item.type === 'anniversary') return null;

  return (
    activate ? 
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={`summary-item ${item.type} ${item.completed ? 'completed' : ''} ${isRange ? 'range-item' : ''}`}>
      {(isRange && !isStart) ? '' : (item.type === 'todo' ? '• ' : '✎ ')}
      {(isRange && !isStart) ? '\u00A0' : item.title}
    </div>
    :
    <div style={style} className={`summary-item ${item.type} ${item.completed ? 'completed' : ''} ${isRange ? 'range-item' : ''}`}>
      {(isRange && !isStart) ? '' : (item.type === 'todo' ? '• ' : '✎ ')}
      {(isRange && !isStart) ? '\u00A0' : item.title}
    </div>
  );
});

// 드롭 가능한 날짜
const DroppableDay = React.memo<{
  day: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  items: EntryItem[];
  allEntries: Record<string, EntryItem[]>;
  onClick: (day: Date) => void;
}>(({ day, isCurrentMonth, isToday, items, allEntries, onClick }) => {
  const formattedDate = useMemo(() => format(day, 'yyyy-MM-dd'), [day]);
  const dayNumber = useMemo(() => format(day, 'd'), [day]);
  
  // 기념일 필터링
  const anniversaries = useMemo(() => {
    const dailyAnnis = items.filter(item => item.type === 'anniversary');
    const currentMonthDay = format(day, 'MM-dd');
    const recurringAnnis: EntryItem[] = [];
    
    Object.keys(allEntries).forEach(dateStr => {
      if (dateStr === formattedDate) return;
      if (dateStr.endsWith(currentMonthDay)) {
        const annis = allEntries[dateStr].filter(item => item.type === 'anniversary' && item.is_recurring);
        recurringAnnis.push(...annis);
      }
    });
    
    return [...dailyAnnis, ...recurringAnnis];
  }, [items, allEntries, day, formattedDate]);

  // 일기/할 일 정렬 (시작일이 빠를수록 우선, 그 다음 기간형 우선)
  const nonAnniversaryItems = useMemo(() => {
    return items
      .filter(item => item.type !== 'anniversary')
      .sort((a, b) => {
        // 1. 시작일 기준 정렬 (오래된 순)
        const aStart = a.start_date || '9999-99-99';
        const bStart = b.start_date || '9999-99-99';
        
        if (aStart !== bStart) {
          return aStart.localeCompare(bStart);
        }

        // 2. 시작일이 같으면 기간형을 우선
        const aIsRange = a.type === 'todo' && a.start_date && a.end_date && a.start_date !== a.end_date;
        const bIsRange = b.type === 'todo' && b.start_date && b.end_date && b.start_date !== b.end_date;
        
        if (aIsRange && !bIsRange) return -1;
        if (!aIsRange && bIsRange) return 1;
        
        // 3. 나머지는 ID로 고정 순서 유지
        return a.id.localeCompare(b.id);
      });
  }, [items]);

  const { isOver, setNodeRef } = useDroppable({
    id: `droppable-${formattedDate}`,
    data: { date: formattedDate }
  });

  const glowStyle = anniversaries.length > 0 ? {
    '--anni-color': anniversaries[0].color,
  } as React.CSSProperties : {};

  return (
    <div
      ref={setNodeRef}
      className={`calendar-day ${!isCurrentMonth ? 'not-current-month' : ''} ${isToday ? 'today' : ''} ${isOver ? 'drag-over' : ''} ${anniversaries.length > 0 ? 'has-anniversary' : ''}`}
      onClick={() => onClick(day)}
    >
      <div className="day-number-wrapper">
        <span className="day-number" style={glowStyle}>{dayNumber}</span>
        {anniversaries.length > 0 && (
          <div className="anniversary-badge-group">
            {anniversaries.map((anni, idx) => {
              const Icon = ANNIVERSARY_ICONS[anni.icon || 'Gift'] || Gift;
              return (
                <div 
                  key={`${anni.id}-${idx}`} 
                  className="floating-anni-icon-wrapper"
                  style={{ color: anni.color }}
                  title={anni.title}
                >
                  <Icon size={14} className="floating-anni-icon" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="entry-list-summary">
        {nonAnniversaryItems.slice(0, 4).map((item) => (
          <DraggableEntry activate={item.start_date === item.end_date} key={item.id} item={item} date={formattedDate} />
          
        ))}
        {nonAnniversaryItems.length > 4 && <div className="summary-item more-indicator">+{nonAnniversaryItems.length - 4}개 더보기</div>}
      </div>
    </div>
  );
});

const DiaryCalendar: React.FC = () => {
  const {
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
  } = useCalendar();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJumpModalOpen, setIsJumpModalOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [startX, setStartX] = useState<number | null>(null);
  const [dragDiff, setDragDiff] = useState<number>(0);
  
  const entries = useDiaryStore(state => state.entries);
  const moveItem = useDiaryStore(state => state.moveItem);

  const navigationDate = useUIStore(state => state.navigationDate);
  const setModalOpen = useUIStore(state => state.setModalOpen);

  // 모달 상태 변경 시 스크롤 잠금 제어
  useEffect(() => {
    if (isModalOpen) {
      setModalOpen(true);
      return () => setModalOpen(false);
    }
  }, [isModalOpen, setModalOpen]);

  useEffect(() => {
    if (isJumpModalOpen) {
      setModalOpen(true);
      return () => setModalOpen(false);
    }
  }, [isJumpModalOpen, setModalOpen]);

  // 외부(사이드바 등)에서의 날짜 이동 요청 처리
  useEffect(() => {
    if (navigationDate) {
      // "yyyy-MM-dd" 형식을 안전하게 파싱하기 위해 split 사용
      const [year, month, day] = navigationDate.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      if (!isNaN(date.getTime())) {
        // 년도와 월 이동 (setMonth는 0-11 기반)
        setYear(year);
        setMonth(month - 1);
        
        // 날짜 선택 및 모달 오픈
        setSelectedDate(date);
        setIsModalOpen(true);
        
        // UIStore의 클리어는 DiaryModal이 띄워진 후 수행되도록 함
      }
    }
  }, [navigationDate, setMonth, setYear]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // 드래그 시작 (마우스/터치)
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (activeId) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    setDragDiff(0);
  };

  // 드래그 중 (마우스/터치)
  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (startX === null || activeId) return;
    const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragDiff(startX - currentX);
  };

  // 드래그 종료 (마우스/터치)
  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (startX === null || activeId) return;

    const endX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const diff = startX - endX;
    const threshold = 50; // 이동 거리 임계값

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextMonth();
      } else {
        prevMonth();
      }
    }
    setStartX(null);
    setDragDiff(0);
  };

  const onDateClick = useCallback((day: Date) => {
    setSelectedDate(day);
    setIsModalOpen(true);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (over) {
      const fromDate = active.data.current?.date;
      const toDate = over.data.current?.date;
      if (fromDate && toDate && fromDate !== toDate) {
        moveItem(active.id as string, fromDate, toDate);
      }
    }
  }, [moveItem]);

  const handleHeaderClick = () => {
    setViewMode('months');
    setIsJumpModalOpen(true);
  };

  const activeItem = useMemo(() => {
    if (!activeId) return null;
    return Object.values(entries).flat().find(item => item.id === activeId) || null;
  }, [activeId, entries]);

  // 화살표 투명도 계산 (최대 100px 이동 시 opacity 1)
  const leftArrowOpacity = Math.min(Math.max(-dragDiff / 100, 0), 0.8);
  const rightArrowOpacity = Math.min(Math.max(dragDiff / 100, 0), 0.8);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={e => setActiveId(e.active.id as string)} onDragEnd={handleDragEnd}>
      <div className="diary-container">
        <div className="calendar-header">
          <button className="nav-btn" onClick={prevMonth}><ChevronLeft size={24} /></button>
          <h2 onClick={handleHeaderClick} className="clickable-header">{formatYearMonth(currentMonth)}</h2>
          <button className="nav-btn" onClick={nextMonth}><ChevronRight size={24} /></button>
        </div>
        <div 
          className="calendar-wrapper"
          onMouseDown={handleTouchStart}
          onMouseMove={handleTouchMove}
          onMouseUp={handleTouchEnd}
          onMouseLeave={() => { setStartX(null); setDragDiff(0); }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ userSelect: 'none' }} // 드래그 시 텍스트 선택 방지
        >
          {/* 드래그 지시 화살표 */}
          {leftArrowOpacity > 0.1 && (
            <div className="swipe-indicator left" style={{ opacity: leftArrowOpacity }}>
              <ChevronLeft size={60} strokeWidth={3} />
            </div>
          )}
          {rightArrowOpacity > 0.1 && (
            <div className="swipe-indicator right" style={{ opacity: rightArrowOpacity }}>
              <ChevronRight size={60} strokeWidth={3} />
            </div>
          )}

          <div className="calendar-grid">
            {['일', '월', '화', '수', '목', '금', '토'].map(d => <div className="calendar-day-name" key={d}>{d}</div>)}
          </div>
          <div className={`calendar-content ${animationClass}`}>
            {calendarDays.map((day) => (
              <DroppableDay
                key={format(day, 'yyyy-MM-dd')}
                day={day}
                isCurrentMonth={isSameMonth(day, monthStart)}
                isToday={isSameDay(day, new Date())}
                items={entries[format(day, 'yyyy-MM-dd')] || []}
                allEntries={entries}
                onClick={onDateClick}
              />
            ))}
          </div>
        </div>
        
        <YearMonthPicker 
          isOpen={isJumpModalOpen} 
          onClose={() => setIsJumpModalOpen(false)}
          viewMode={viewMode as 'months' | 'years'} 
          setViewMode={(mode) => setViewMode(mode as any)}
          currentMonth={currentMonth}
          onMonthSelect={(monthDate) => {
            setMonth(monthDate.getMonth());
            setIsJumpModalOpen(false);
          }}
          onYearSelect={(year) => {
            setYear(year);
          }}
          onPrev={prevMonth}
          onNext={nextMonth}
        />

        {selectedDate && (
          <DiaryModal date={format(selectedDate, 'yyyy-MM-dd')} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        )}
      </div>
      <DragOverlay dropAnimation={null}>{activeItem ? <div className="summary-item dragging-preview">{activeItem.title}</div> : null}</DragOverlay>
    </DndContext>
  );
};

export default DiaryCalendar;

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  format,
  isSameMonth,
  isSameDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
import DiaryModal from '../Modal/DiaryModal';
import YearMonthPicker from './YearMonthPicker';
import { useUIStore } from '../../../store/uiStore';
import './Diary.css';

/**
 * DiaryCalendar.tsx
 * 메인 달력 인터페이스를 렌더링하고 관리합니다.
 * 드래그 앤 드롭을 통한 항목 이동, 스와이프를 통한 월 전환, 날짜별 모달 오픈을 처리합니다.
 */

// 드래그 가능한 항목
const DraggableEntry = React.memo<{ item: EntryItem; date: string }>(({ item, date }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: { date, id: item.id },
  });

  const style = useMemo(() => ({
    opacity: isDragging ? 0.3 : 1,
    borderLeft: `3px solid ${item.color || (item.type === 'diary' ? '#4a5568' : '#3182ce')}`,
    backgroundColor: (item.color || (item.type === 'diary' ? '#4a5568' : '#3182ce')) + '15',
  }), [isDragging, item.color, item.type]);

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={`summary-item ${item.type} ${item.completed ? 'completed' : ''}`}>
      {item.type === 'todo' ? '• ' : '✎ '}{item.title}
    </div>
  );
});

// 드롭 가능한 날짜
const DroppableDay = React.memo<{
  day: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  items: EntryItem[];
  onClick: (day: Date) => void;
}>(({ day, isCurrentMonth, isToday, items, onClick }) => {
  const formattedDate = useMemo(() => format(day, 'yyyy-MM-dd'), [day]);
  const dayNumber = useMemo(() => format(day, 'd'), [day]);
  const { isOver, setNodeRef } = useDroppable({
    id: `droppable-${formattedDate}`,
    data: { date: formattedDate }
  });

  return (
    <div
      ref={setNodeRef}
      className={`calendar-day ${!isCurrentMonth ? 'not-current-month' : ''} ${isToday ? 'today' : ''} ${isOver ? 'drag-over' : ''}`}
      onClick={() => onClick(day)}
    >
      <span className="day-number">{dayNumber}</span>
      <div className="entry-list-summary">
        {items.slice(0, 3).map((item) => (
          <DraggableEntry key={item.id} item={item} date={formattedDate} />
        ))}
        {items.length > 3 && <div className="summary-item more-indicator">+{items.length - 3}개 더보기</div>}
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

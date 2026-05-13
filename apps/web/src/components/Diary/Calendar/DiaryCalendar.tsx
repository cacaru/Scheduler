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
import { useDiaryStore, type EntryItem } from '@project/shared/src/store/diaryStore';
import { formatYearMonth } from '@project/shared/src/utils/dateUtils';
import { useCalendar } from '@project/shared/src/hooks/useCalendar';
import DiaryModal from '../Modal/DailyList/DiaryModal';
import YearMonthPicker from './YearMonthPicker';
import { useUIStore } from '@project/shared/src/store/uiStore';
import styles from './Diary.module.css';
import { ANNIVERSARY_ICONS } from '../../../icons/anniversary';
import clsx from 'clsx';

/**
 * DiaryCalendar.tsx
 * 메인 달력 인터페이스를 렌더링하고 관리합니다.
 * 드래그 앤 드롭을 통한 항목 이동, 스와이프를 통한 월 전환, 날짜별 모달 오픈을 처리합니다.
 */

/**
 * 글로벌 track 할당
 * - 같은 항목이 일자마다 같은 row(track)에 그려지도록 그리디 배치한다.
 * - 정렬 우선순위: 시작일 ↑ → 길이(다중일) ↓ → id (안정)
 * - 결과: 셀 안 항목 순서가 다른 셀과 정합 → 범위 todo가 가로 한 줄로 안정.
 */
const MAX_TRACKS = 4;
type TrackMap = Map<string, (string | null)[]>;

function allocateTracks(entries: Record<string, EntryItem[]>): {
  tracks: TrackMap;
  itemMap: Map<string, EntryItem>;
} {
  const itemMap = new Map<string, EntryItem>();
  const itemDates = new Map<string, string[]>();

  for (const [date, items] of Object.entries(entries)) {
    for (const item of items) {
      if (item.type === 'anniversary') continue; // 기념일은 별도 배지로 그려짐
      if (!itemMap.has(item.id)) itemMap.set(item.id, item);
      let arr = itemDates.get(item.id);
      if (!arr) {
        arr = [];
        itemDates.set(item.id, arr);
      }
      arr.push(date);
    }
  }
  for (const dates of itemDates.values()) dates.sort();

  const sortedIds = Array.from(itemDates.keys()).sort((a, b) => {
    const ad = itemDates.get(a)!;
    const bd = itemDates.get(b)!;
    if (ad[0] !== bd[0]) return ad[0].localeCompare(bd[0]);
    if (ad.length !== bd.length) return bd.length - ad.length;
    return a.localeCompare(b);
  });

  const tracks: TrackMap = new Map();
  for (const id of sortedIds) {
    const dates = itemDates.get(id)!;
    let t = 0;
    while (true) {
      const free = dates.every((d) => {
        const dt = tracks.get(d);
        return !dt || !dt[t];
      });
      if (free) break;
      t++;
    }
    for (const d of dates) {
      let dt = tracks.get(d);
      if (!dt) {
        dt = [];
        tracks.set(d, dt);
      }
      dt[t] = id;
    }
  }
  return { tracks, itemMap };
}

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
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} 
      className={clsx(
        styles.summaryItem,
        item.completed && styles.completed,
        isRange && styles.rangeItem )}>
      {(isRange && !isStart) ? '' : (item.type === 'todo' ? '• ' : '✎ ')}
      {(isRange && !isStart) ? '\u00A0' : item.title}
    </div>
    :
    <div style={style} 
        className={clsx(
        styles.summaryItem,
        item.completed && styles.completed,
        isRange && styles.rangeItem )}>
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
  dayTracks: (string | null)[];
  itemMap: Map<string, EntryItem>;
  onClick: (day: Date) => void;
}>(({ day, isCurrentMonth, isToday, items, allEntries, dayTracks, itemMap, onClick }) => {
  const formattedDate = useMemo(() => format(day, 'yyyy-MM-dd'), [day]);
  const dayNumber = useMemo(() => format(day, 'd'), [day]);

  // 기념일 필터링 (트랙과 무관 — 기념일은 별도 배지로 그려짐)
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

  // MAX_TRACKS를 초과해 잘려나가는 항목 수 (옅은 +N 표시용)
  const hiddenCount = useMemo(
    () => dayTracks.slice(MAX_TRACKS).filter(Boolean).length,
    [dayTracks]
  );

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
      className={ clsx(
        styles.calendarDay,
        !isCurrentMonth && styles.notCurrentMonth,
        isToday && styles.today,
        isOver && styles.dragOver,
        anniversaries.length > 0 && styles.hasAnniversary)}
      onClick={() => onClick(day)}
    >
      <div className={styles.dayNumberWrapper}>
        <span className={styles.dayNumber} style={glowStyle}>{dayNumber}</span>
        {anniversaries.length > 0 && (
          <div className={styles.anniversaryBadgeGroup}>
            {anniversaries.map((anni, idx) => {
              const Icon = ANNIVERSARY_ICONS[anni.icon || 'Gift'] || Gift;
              return (
                <div 
                  key={`${anni.id}-${idx}`} 
                  className={styles.floatingAnniIconWrapper}
                  style={{ color: anni.color }}
                  title={anni.title}
                >
                  <Icon size={14} className={styles.floatingAnniIcon} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.entryListSummary}>
        {Array.from({ length: MAX_TRACKS }, (_, idx) => {
          const itemId = dayTracks[idx];
          const item = itemId ? itemMap.get(itemId) : undefined;
          if (!item) {
            // 빈 track은 placeholder로 자리만 차지 → 같은 항목이 일자마다 같은 row 유지
            return (
              <div
                key={`ph-${idx}`}
                className={styles.summaryItem}
                style={{ visibility: 'hidden', pointerEvents: 'none' }}
                aria-hidden
              >
                {' '}
              </div>
            );
          }
          return (
            <DraggableEntry
              activate={item.start_date === item.end_date}
              key={item.id}
              item={item}
              date={formattedDate}
            />
          );
        })}
        {hiddenCount > 0 && (
          <div className={clsx(styles.summaryItem, styles.moreIndicator)}>+{hiddenCount}개 더보기</div>
        )}
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

  // 글로벌 track 할당 — 같은 항목이 일자마다 같은 row에 나오게 함
  const { tracks, itemMap } = useMemo(() => allocateTracks(entries), [entries]);

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
      <div className={styles.diaryContainer}>
        <div className={styles.calendarHeader}>
          <button className={styles.navBtn} onClick={prevMonth}><ChevronLeft size={24} /></button>
          <h2 onClick={handleHeaderClick} className={styles.clickableHeader}>{formatYearMonth(currentMonth)}</h2>
          <button className={styles.navBtn} onClick={nextMonth}><ChevronRight size={24} /></button>
        </div>
        <div 
          className={styles.calendarWrapper}
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
            <div className={ clsx(styles.swipeIndicator, styles.left)} style={{ opacity: leftArrowOpacity }}>
              <ChevronLeft size={60} strokeWidth={3} />
            </div>
          )}
          {rightArrowOpacity > 0.1 && (
            <div className={clsx(styles.swipeIndicator, styles.right)} style={{ opacity: rightArrowOpacity }}>
              <ChevronRight size={60} strokeWidth={3} />
            </div>
          )}

          <div className={styles.calendarGrid}>
            {['일', '월', '화', '수', '목', '금', '토'].map(d => <div className={styles.calendarDayName} key={d}>{d}</div>)}
          </div>
          <div className={clsx(styles.calendarContent, animationClass)}>
            {calendarDays.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              return (
                <DroppableDay
                  key={dateStr}
                  day={day}
                  isCurrentMonth={isSameMonth(day, monthStart)}
                  isToday={isSameDay(day, new Date())}
                  items={entries[dateStr] || []}
                  allEntries={entries}
                  dayTracks={tracks.get(dateStr) || []}
                  itemMap={itemMap}
                  onClick={onDateClick}
                />
              );
            })}
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
        />

        {selectedDate && (
          <DiaryModal date={format(selectedDate, 'yyyy-MM-dd')} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        )}
      </div>
      <DragOverlay dropAnimation={null}>{activeItem ? <div className={clsx(styles.summaryItem, styles.draggingPreview)}>{activeItem.title}</div> : null}</DragOverlay>
    </DndContext>
  );
};

export default DiaryCalendar;

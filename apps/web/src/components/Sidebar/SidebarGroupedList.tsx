import { Calendar, ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';
import { formatDateWithDay } from '@project/shared/src/utils/dateUtils';
import styles from './Sidebar.module.css';
import clsx from 'clsx';

interface SidebarGroupedListProps<T> {
  title: string;
  emptyMessage: string;
  groupedData: { [month: string]: { [date: string]: T[] } };
  sortedMonths: string[];
  expandedMonths: string[];
  onToggleMonth: (month: string) => void;
  renderItem: (item: T, date: string) => React.ReactNode;
  onClose: () => void;
  isResizing: boolean;
  onResizerMouseDown: (e: React.MouseEvent) => void;
  width: number;
  isVisible: boolean;
  className?: string;
}

const SidebarGroupedList = <T extends { id: string, start_date?: string, end_date?: string }>({
  title,
  emptyMessage,
  groupedData,
  sortedMonths,
  expandedMonths,
  onToggleMonth,
  renderItem,
  onClose,
  isResizing,
  onResizerMouseDown,
  width,
  isVisible,
  className = ""
}: SidebarGroupedListProps<T>) => {
  return (
    <div 
      className={clsx(styles.sideTodoExtension, isVisible && styles.visible, isResizing && styles.resizing, className)} 
      style={{ width: isVisible ? `${width}px` : '0' }}
    >
      <div className={styles.sideExtensionResizer} onMouseDown={onResizerMouseDown} />
      <div className={styles.sideExtensionHeader}>
        <h3>{title}</h3>
        <button className={styles.sideCloseBtn} onClick={onClose} aria-label="Collapse panel">
          <ChevronLeft size={20} />
        </button>
      </div>
      <div className={styles.sideExtensionContent}>
        {sortedMonths.length === 0 ? (
          <div className="side-empty-state">
            <p className="side-empty-msg">{emptyMessage}</p>
          </div>
        ) : (
          <div className="side-grouped-todo-container">
            {sortedMonths.map((month: string) => {
              const isExpanded = expandedMonths.includes(month);
              const monthData = groupedData[month];
              const dateKeys = Object.keys(monthData).sort((a, b) => a.localeCompare(b));
              
              // 'range' 키를 가진 항목들 분리 (최상단 노출용)
              const rangeItems = monthData['range'] || [];
              const dailyKeys = dateKeys.filter(k => k !== 'range');

              return (
                <div key={month} className={clsx(styles.sideMonthGroup, isExpanded && styles.expanded)}>
                  <div className={styles.sideMonthHeader} onClick={() => onToggleMonth(month)}>
                    <h4 style={{margin: '0px'}} className={styles.sideMonthTitle}>{month.replace('-', '년 ')}월</h4>
                    <ChevronRight size={14} className={clsx(styles.sideMonthArrow, isExpanded && styles.rotated)} />
                  </div>
                  
                  <div className={styles.sideMonthContent}>
                    {/* 1. 기간형 할 일 (최상단 고정) */}
                    {rangeItems.length > 0 && (
                      <div className={clsx("side-date-group", styles.rangeGroup)}>
                        <div className={clsx(styles.sideDateBadge, styles.rangeBadge)}>
                          <Calendar size={12} />
                          <span>기간형 일정</span>
                        </div>
                        <ul className={styles.sideTodoList}>
                          {rangeItems.map((item) => (
                            <div key={item.id} className={styles.sideRangeItemWrapper}>
                              <div className={styles.sideRangeDuration}>
                                <span>{item.start_date?.slice(5)}</span>
                                <ArrowRight size={10} />
                                <span>{item.end_date?.slice(5)}</span>
                              </div>
                              {renderItem(item, item.start_date!)}
                            </div>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 2. 일반 일별 할 일 */}
                    {dailyKeys.map(date => (
                        <div key={date} className="side-date-group">
                          <div className={styles.sideDateBadge}>
                            <Calendar size={12} />
                            <span>{formatDateWithDay(date)}</span>
                          </div>
                          <ul className={styles.sideTodoList}>
                            {monthData[date].map((item) => renderItem(item, date))}
                          </ul>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarGroupedList;

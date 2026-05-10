import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Book, Check, GripVertical, Gift } from 'lucide-react';
import { type EntryItem } from '../../../../store/diaryStore';
import { ANNIVERSARY_ICONS } from '../../../../constants/anniversary';

/**
 * SortableEntryCard.tsx
 * DiaryModal 목록 내에서 정렬 및 드래그가 가능한 개별 일기/할 일 카드입니다.
 * dnd-kit을 활용하여 드래그 핸들 및 선택 상태를 렌더링합니다.
 */

interface SortableEntryCardProps {
  item: EntryItem;
  date: string;
  isActive: boolean;
  onSelect: (id: string) => void;
  onToggle: (date: string, id: string) => void;
  onDelete: (date: string, id: string) => void;
  isOverlay?: boolean;
}

const SortableEntryCard: React.FC<SortableEntryCardProps> = ({ 
  item, 
  date, 
  isActive, 
  onSelect, 
  onToggle, 
  onDelete,
  isOverlay = false
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id, disabled: isOverlay });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  const itemColor = item.color || '#cbd5e0';

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`entry-card ${isActive ? 'active' : ''} ${isDragging ? 'dragging' : ''} ${isOverlay ? 'overlay' : ''}`}
      onClick={() => onSelect(item.id)}
    >
      <div className="card-color-bar" style={{ backgroundColor: itemColor }} />
      
      <div className="card-drag-handle" {...attributes} {...listeners}>
        <GripVertical size={16} color="#cbd5e0" />
      </div>
      
      <div className="entry-card-main">
        <div className="prefix-area">
          {item.type === 'todo' ? (
            <button className="todo-check-btn" onClick={(e) => { e.stopPropagation(); onToggle(date, item.id); }}>
              {item.completed ? 
                <div className="checked-circle" style={{ backgroundColor: itemColor }}><Check size={14} color="white" /></div> : 
                <div className="empty-circle" style={{ borderColor: itemColor }} />
              }
            </button>
          ) : item.type === 'anniversary' ? (
            (() => {
              const Icon = ANNIVERSARY_ICONS[item.icon || 'Gift'] || Gift;
              return <Icon size={20} style={{ color: itemColor }} />;
            })()
          ) : (
            <Book className="diary-icon" size={20} style={{ color: itemColor }} />
          )}
        </div>
        <div className="entry-info" style={{ flex: 1, minWidth: 0 }}>
          <strong className={item.completed ? 'done' : ''}>{item.title}</strong>
        </div>
        <div className="entry-btns">
          <button className="del-btn" onClick={(e) => { e.stopPropagation(); onDelete(date, item.id); }}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SortableEntryCard);

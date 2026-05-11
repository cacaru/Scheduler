/**
 * SidebarTodoItem.tsx
 * 사이드바의 전체 할 일 목록에 표시되는 개별 할 일 카드입니다.
 * 완료 여부 토글, 편집 모드 진입, 달력으로 이동(수정 모드 포함) 기능을 담당합니다.
 */
import React from 'react';
import { CheckCircle, Circle, Edit2, Check, X as CloseIcon } from 'lucide-react';
import { PRESET_COLORS } from '@project/shared/src/constants/colors';
import { type EntryItem } from '@project/shared/src/store/diaryStore';
import styles from './Sidebar.module.css';
import clsx from 'clsx';

interface EditFormState {
  title: string;
  date: string;
  color: string;
  originalDate: string;
}

interface SidebarTodoItemProps {
  item: EntryItem;
  date: string;
  isEditing: boolean;
  isSelected: boolean;
  onToggle: (date: string, id: string) => void;
  onNavigateEdit: (date: string, id: string) => void;
  onSelect: (id: string) => void;
  editState: EditFormState;
  setEditState: (state: EditFormState) => void;
  onSave: () => void;
  onCancel: () => void;
}

const SidebarTodoItem: React.FC<SidebarTodoItemProps> = ({ 
  item, date, isEditing, isSelected, onToggle, onNavigateEdit, onSelect, editState, setEditState, onSave, onCancel 
}) => {
  if (isEditing) {
    return (
      <li 
        className={clsx(styles.sideTodoItem, "editing")}
        style={{ borderLeft: `3px solid ${editState.color}`, backgroundColor: editState.color + '10' }}
      >
        <div className="side-todo-edit-form">
          <input 
            type="text" 
            value={editState.title} 
            onChange={(e) => setEditState({ ...editState, title: e.target.value })}
            className="side-edit-input"
            autoFocus
          />
          <div className="side-edit-options">
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)', marginBottom: '-4px' }}>
              날짜 변경
            </div>
            <input 
              type="date" 
              value={editState.date} 
              onChange={(e) => setEditState({ ...editState, date: e.target.value })}
              className="side-edit-date-input"
            />
            <div className="side-edit-color-picker">
              {PRESET_COLORS.map(c => (
                <button 
                  key={c} 
                  className={clsx("side-edit-color-dot", editState.color === c && "active")}
                  style={{ backgroundColor: c }}
                  onClick={() => setEditState({ ...editState, color: c })}
                />
              ))}
            </div>
          </div>
          <div className="side-edit-actions">
            <button onClick={onSave} className="side-edit-btn save" aria-label="Save"><Check size={16} /></button>
            <button onClick={onCancel} className="side-edit-btn cancel" aria-label="Cancel"><CloseIcon size={16} /></button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li 
      className={clsx(styles.sideTodoItem, item.completed && styles.completed, isSelected && styles.selected)}
      style={{ 
        borderLeft: `3px solid ${item.color || '#cbd5e0'}`, 
        backgroundColor: isSelected ? (item.color || '#cbd5e0') + '25' : (item.color || '#cbd5e0') + '10' 
      }}
      onClick={() => onSelect(item.id)}
    >
      <div className={styles.sideTodoItemHeader}>
        <button 
          className={styles.sideTodoToggleBtn}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(date, item.id);
          }}
          aria-label={item.completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {item.completed ? 
            <CheckCircle size={18} color={item.color || "#38a169"} /> : 
            <Circle size={18} color="#cbd5e0" />
          }
        </button>
        <p className={styles.sideTodoTitle}>{item.title}</p>
        <button 
          className={styles.sideTodoEditBtn} 
          onClick={(e) => {
            e.stopPropagation();
            onNavigateEdit(date, item.id);
          }} 
          aria-label="Edit todo in calendar"
        >
          <Edit2 size={14} />
        </button>
      </div>
    </li>
  );
};

export default React.memo(SidebarTodoItem);

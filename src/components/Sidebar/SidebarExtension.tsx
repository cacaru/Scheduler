import React from 'react';
import { Gift, Heart, Star, Cake, PartyPopper } from 'lucide-react';
import { type EntryItem } from '../../store/diaryStore';
import { type SidebarPanelType } from '../../hooks/useSidebarUI';
import SidebarGroupedList from './SidebarGroupedList';
import SidebarTodoItem from './SidebarTodoItem';

interface SidebarExtensionProps {
  expandedPanel: SidebarPanelType;
  onClose: () => void;
  isResizing: boolean;
  onResizerMouseDown: (e: React.MouseEvent) => void;
  width: number;
  
  // Todo data
  todoData: {
    grouped: { [month: string]: { [date: string]: EntryItem[] } };
    sortedMonths: string[];
    expandedMonths: string[];
    editingId: string | null;
    selectedTodoId: string | null;
    editForm: any;
    setEditForm: (state: any) => void;
    actions: {
      handleSaveEdit: () => void;
      cancelEditing: () => void;
    }
  };
  
  // Anniversary data
  anniData: {
    grouped: { [month: string]: { [date: string]: EntryItem[] } };
    sortedMonths: string[];
    expandedMonths: string[];
  };
  
  // Diary data
  diaryData: {
    grouped: { [month: string]: { [date: string]: EntryItem[] } };
    sortedMonths: string[];
    expandedMonths: string[];
  };
  
  // Actions
  actions: {
    toggleTodoMonth: (month: string) => void;
    toggleAnniMonth: (month: string) => void;
    toggleDiaryMonth: (month: string) => void;
    toggleTodo: (date: string, id: string) => Promise<void>;
    handleNavigate: (date: string, id: string, isEdit?: boolean) => void;
    setSelectedTodoId: (id: string | null) => void;
  };
}

const ANNIVERSARY_ICONS: Record<string, React.ElementType> = {
  Gift,
  Heart,
  Star,
  Cake,
  Party: PartyPopper,
};

const SidebarExtension: React.FC<SidebarExtensionProps> = ({
  expandedPanel,
  onClose,
  isResizing,
  onResizerMouseDown,
  width,
  todoData,
  anniData,
  diaryData,
  actions
}) => {
  if (!expandedPanel) return null;

  return (
    <>
      {/* To-do Extension */}
      <SidebarGroupedList
        title="전체 To-do"
        emptyMessage="등록된 할 일이 없습니다."
        groupedData={todoData.grouped}
        sortedMonths={todoData.sortedMonths}
        expandedMonths={todoData.expandedMonths}
        onToggleMonth={actions.toggleTodoMonth}
        isVisible={expandedPanel === 'todo'}
        width={width}
        isResizing={isResizing}
        onResizerMouseDown={onResizerMouseDown}
        onClose={onClose}
        renderItem={(item, date) => (
          <SidebarTodoItem 
            key={item.id}
            item={item}
            date={date}
            isEditing={todoData.editingId === item.id}
            isSelected={todoData.selectedTodoId === item.id}
            onToggle={actions.toggleTodo}
            onNavigateEdit={(d, id) => actions.handleNavigate(d, id, true)}
            onSelect={actions.setSelectedTodoId}
            editState={todoData.editForm}
            setEditState={todoData.setEditForm}
            onSave={todoData.actions.handleSaveEdit}
            onCancel={todoData.actions.cancelEditing}
          />
        )}
      />

      {/* Diary Extension */}
      <SidebarGroupedList
        title="전체 일기"
        emptyMessage="등록된 일기가 없습니다."
        groupedData={diaryData.grouped}
        sortedMonths={diaryData.sortedMonths}
        expandedMonths={diaryData.expandedMonths}
        onToggleMonth={actions.toggleDiaryMonth}
        isVisible={expandedPanel === 'diary'}
        width={width}
        isResizing={isResizing}
        onResizerMouseDown={onResizerMouseDown}
        onClose={onClose}
        className="side-diary-extension"
        renderItem={(item, date) => (
          <li 
            key={item.id} 
            className="side-todo-item side-diary-item"
            onClick={() => actions.handleNavigate(date, item.id)}
            style={{ borderLeft: `4px solid ${item.color || '#4a5568'}` }}
          >
            <div className="side-todo-item-header">
              <p className="side-todo-title">✎ {item.title}</p>
            </div>
          </li>
        )}
      />

      {/* Anniversary Extension */}
      <SidebarGroupedList
        title="기념일 목록"
        emptyMessage="등록된 기념일이 없습니다."
        groupedData={anniData.grouped}
        sortedMonths={anniData.sortedMonths}
        expandedMonths={anniData.expandedMonths}
        onToggleMonth={actions.toggleAnniMonth}
        isVisible={expandedPanel === 'anniversary'}
        width={width}
        isResizing={isResizing}
        onResizerMouseDown={onResizerMouseDown}
        onClose={onClose}
        className="side-anni-extension"
        renderItem={(item, date) => {
          const Icon = ANNIVERSARY_ICONS[item.icon || 'Gift'] || Gift;
          return (
            <li 
              key={item.id} 
              className="side-todo-item side-anni-item"
              onClick={() => actions.handleNavigate(date, item.id)}
              style={{ borderLeft: `4px solid ${item.color || '#ffadad'}` }}
            >
              <div className="side-todo-item-header">
                <div className="side-anni-icon-wrapper" style={{ color: item.color || '#ffadad' }}>
                  <Icon size={18} />
                </div>
                <p className="side-todo-title">{item.title}</p>
              </div>
            </li>
          );
        }}
      />
    </>
  );
};

export default SidebarExtension;

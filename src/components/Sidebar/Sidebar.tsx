import React, { useState, useCallback, useEffect } from 'react';
import { useDiaryStore, type EntryItem } from '../../store/diaryStore';
import { 
  ListTodo, 
  Calendar, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Map as MapIcon,
  Settings,
  Palette
} from 'lucide-react';
import { formatDateWithDay } from '../../utils/dateUtils';
import { useSidebarTodo } from '../../hooks/useSidebarTodo';
import { type ViewType } from '../../App';
import { useUIStore } from '../../store/uiStore';

// 분리된 컴포넌트들
import SidebarTodoItem from './SidebarTodoItem';
import TodoDetailModal from './TodoDetailModal';

import './Sidebar.css';

/**
 * Sidebar.tsx
 * 서비스의 메인 메뉴와 전체 할 일 목록 패널을 포함하는 통합 사이드바 컴포넌트입니다.
 * 뷰 전환(다이어리/지도), 테마 변경, 패널 리사이징 기능을 제공합니다.
 */

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const THEME_COLORS = [
  { name: 'Lavender', primary: '#b8c1ec', light: '#eebbc315' },
  { name: 'Mint', primary: '#a7dbd8', light: '#a7dbd820' },
  { name: 'Sky Blue', primary: '#a0c4ff', light: '#a0c4ff20' },
  { name: 'Soft Rose', primary: '#ffadad', light: '#ffadad20' },
  { name: 'Mellow Gold', primary: '#ffd6a5', light: '#ffd6a520' },
  { name: 'Sage Green', primary: '#caffbf', light: '#caffbf20' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentView, onViewChange }) => {
  const [isTodoExpanded, setIsTodoExpanded] = useState(false);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState<string[]>([]);
  const [extensionWidth, setExtensionWidth] = useState(340);
  const [isResizing, setIsResizing] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('#b8c1ec');

  const {
    groupedTodos,
    sortedMonths,
    editingId,
    selectedTodoId,
    setSelectedTodoId,
    selectedTodo,
    editForm,
    setEditForm,
    actions: { handleSaveEdit, cancelEditing }
  } = useSidebarTodo();

  const toggleTodo = useDiaryStore(state => state.toggleTodo);
  const navigateAndOpenModal = useUIStore(state => state.navigateAndOpenModal);

  const handleNavigate = useCallback((date: string, id: string, isEdit: boolean = false) => {
    navigateAndOpenModal(date, id, isEdit);
    onViewChange('diary');
    onClose();
    setIsTodoExpanded(false);
    setSelectedTodoId(null);
  }, [navigateAndOpenModal, onViewChange, onClose, setSelectedTodoId]);

  const changeTheme = (primary: string, light: string) => {
    document.documentElement.style.setProperty('--accent', primary);
    document.documentElement.style.setProperty('--accent-light', light);
    setCurrentTheme(primary);
  };

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newWidth = e.clientX - 260;
      if (newWidth > 280 && newWidth < 600) {
        setExtensionWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  const toggleMonth = (month: string) => {
    setExpandedMonths(prev => 
      prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
    );
  };

  const handleClose = useCallback(() => {
    setIsTodoExpanded(false);
    setSelectedTodoId(null);
    cancelEditing();
    onClose();
  }, [onClose, cancelEditing, setSelectedTodoId]);

  const handleViewChange = (view: ViewType) => {
    setIsTodoExpanded(false);
    setSelectedTodoId(null);
    onViewChange(view);
  };

  return (
    <>
      <div className={`side-sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={handleClose} />
      
      <div className={`side-sidebar-container ${isOpen ? 'open' : ''} ${isTodoExpanded ? 'expanded' : ''}`}>
        <aside className="side-menu">
          <div className="side-menu-header">
            <div className="side-logo">
              <Calendar className="logo-icon" size={24} />
              <span>Scheduler</span>
            </div>
            <button className="side-close-btn" onClick={handleClose} aria-label="Close sidebar">
              <X size={20} />
            </button>
          </div>

          <div className="side-menu-body">
            <nav className="side-menu-nav">
              <button className={`side-menu-item ${currentView === 'diary' ? 'active' : ''}`} onClick={() => handleViewChange('diary')}>
                <Calendar size={24} />
                <span>다이어리</span>
              </button>

              <button className={`side-menu-item ${currentView === 'map' ? 'active' : ''}`} onClick={() => handleViewChange('map')}>
                <MapIcon size={24} />
                <span>지도 뷰</span>
              </button>

              <div className="side-nav-divider" />

              <button 
                className={`side-menu-item ${isTodoExpanded ? 'active' : ''}`}
                onClick={() => {
                  setIsTodoExpanded(!isTodoExpanded);
                  if (isTodoExpanded) setSelectedTodoId(null);
                  setIsSettingsExpanded(false);
                }}
              >
                <ListTodo size={24} />
                <span>전체 할 일</span>
                <ChevronRight size={16} className={`arrow ${isTodoExpanded ? 'rotated' : ''}`} />
              </button>
            </nav>

            <div className="side-menu-footer">
              <div className={`side-settings-accordion ${isSettingsExpanded ? 'expanded' : ''}`}>
                <button className={`side-menu-item settings-trigger ${isSettingsExpanded ? 'active' : ''}`} onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}>
                  <Settings size={24} />
                  <span>설정</span>
                  <ChevronRight size={16} className={`arrow ${isSettingsExpanded ? 'rotated' : ''}`} />
                </button>
                
                <div className="side-settings-content">
                  <div className="side-theme-picker">
                    <div className="side-theme-label"><Palette size={12} /><span>테마 색상</span></div>
                    <div className="side-theme-options">
                      {THEME_COLORS.map((color) => (
                        <button
                          key={color.primary}
                          className={`side-theme-dot ${currentTheme === color.primary ? 'active' : ''}`}
                          style={{ backgroundColor: color.primary }}
                          onClick={() => changeTheme(color.primary, color.light)}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className={`side-todo-extension ${isTodoExpanded ? 'visible' : ''} ${isResizing ? 'resizing' : ''}`} style={{ width: isTodoExpanded ? `${extensionWidth}px` : '0' }}>
          <div className="side-extension-resizer" onMouseDown={startResizing} />
          <div className="side-extension-header">
            <h3>전체 To-do</h3>
            <button className="side-collapse-btn" onClick={() => { setIsTodoExpanded(false); setSelectedTodoId(null); }} aria-label="Collapse panel">
              <ChevronLeft size={20} />
            </button>
          </div>
          <div className="side-extension-content" >
            {sortedMonths.length === 0 ? (
              <div className="side-empty-state"><p className="side-empty-msg">등록된 할 일이 없습니다.</p></div>
            ) : (
              <div className="side-grouped-todo-container">
                {sortedMonths.map((month: string) => {
                  const isExpanded = expandedMonths.includes(month);
                  return (
                    <div key={month} className={`side-month-group ${isExpanded ? 'expanded' : ''}`}>
                      <div className="side-month-header" onClick={() => toggleMonth(month)}>
                        <h4 className="side-month-title">{month.replace('-', '년 ')}월</h4>
                        <ChevronRight size={14} className={`side-month-arrow ${isExpanded ? 'rotated' : ''}`} />
                      </div>
                      
                      <div className="side-month-content">
                        {Object.keys(groupedTodos[month])
                          .sort((a, b) => b.localeCompare(a))
                          .map(date => (
                            <div key={date} className="side-date-group">
                              <div className="side-date-badge"><Calendar size={12} /><span>{formatDateWithDay(date)}</span></div>
                              <ul className="side-todo-list">
                                {groupedTodos[month][date].map((item: EntryItem) => (
                                  <SidebarTodoItem 
                                    key={item.id}
                                    item={item}
                                    date={date}
                                    isEditing={editingId === item.id}
                                    isSelected={selectedTodoId === item.id}
                                    onToggle={toggleTodo}
                                    onNavigateEdit={(d, id) => handleNavigate(d, id, true)}
                                    onSelect={setSelectedTodoId}
                                    editState={editForm}
                                    setEditState={setEditForm}
                                    onSave={handleSaveEdit}
                                    onCancel={cancelEditing}
                                  />
                                ))}
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
      </div>

      {selectedTodo && (
        <TodoDetailModal 
          item={selectedTodo.item} 
          date={selectedTodo.date} 
          onClose={() => setSelectedTodoId(null)} 
          onNavigate={handleNavigate}
        />
      )}
    </>
  );
};

export default Sidebar;

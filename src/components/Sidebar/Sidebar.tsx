import React, { useState, useCallback, useEffect } from 'react';
import { type EntryItem } from '../../store/diaryStore';
import { Calendar, X, CheckCircle, Book, Gift, LogOut, ChevronRight, MapPin, Settings } from 'lucide-react';
import { useSidebarTodo } from '../../hooks/useSidebarTodo';
import SettingsModal from './SettingsModal';
import SidebarTodoItem from './SidebarTodoItem';
import SidebarGroupedList from './SidebarGroupedList';
import SideDetailModal from './SideDetailModal';
import { useSidebarUI } from '../../hooks/useSidebarUI';
import { useSidebarDiary } from '../../hooks/useSidebarDiary';
import { useSidebarAnniversary } from '../../hooks/useSidebarAnniversary';
import { useUIStore } from '../../store/uiStore';
import { type ViewType } from '../../App';
import { supabase } from '../../utils/supabase';
import './Sidebar.css';
import { ANNIVERSARY_ICONS } from '../../constants/anniversary';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose,
  currentView,
  onViewChange
}) => {
  const { 
    expandedPanel, 
    extensionWidth, 
    isResizing,
    expandedTodoMonths,
    expandedDiaryMonths,
    expandedAnniMonths,
    actions 
  } = useSidebarUI();

  const todoData = useSidebarTodo();
  const diaryData = useSidebarDiary();
  const anniData = useSidebarAnniversary();
  
  const navigateAndOpenModal = useUIStore(state => state.navigateAndOpenModal);
  const setModalOpen = useUIStore(state => state.setModalOpen);

  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isAnniversaryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // 항목 선택 및 미리보기 모달 제어 (할 일, 일기, 기념일 통합)
  const [selectedItem, setSelectedItem] = useState<EntryItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');

  // 사이드바 상태 변경 시 스크롤 잠금 제어
  useEffect(() => {
    if (isOpen) {
      setModalOpen(true);
      return () => setModalOpen(false);
    } else {
      // 사이드바가 닫힐 때 상세 모달도 닫기
      setSelectedItem(null);
    }
  }, [isOpen, setModalOpen]);

  // 모달 상태 변경 시 스크롤 잠금 제어
  useEffect(() => {
    if (isAnniversaryModalOpen) {
      setModalOpen(true);
      return () => setModalOpen(false);
    }
  }, [isAnniversaryModalOpen, setModalOpen]);

  useEffect(() => {
    if (selectedItem) {
      setModalOpen(true);
      return () => setModalOpen(false);
    }
  }, [selectedItem, setModalOpen]);

  useEffect(() => {
    if (isLogoutConfirmOpen) {
      setModalOpen(true);
      return () => setModalOpen(false);
    }
  }, [isLogoutConfirmOpen, setModalOpen]);

  useEffect(() => {
    if (isSettingsModalOpen) {
      setModalOpen(true);
      return () => setModalOpen(false);
    }
  }, [isSettingsModalOpen, setModalOpen]);

  const handleSelectItem = useCallback((item: EntryItem, date: string) => {
    setSelectedItem(item);
    setSelectedDate(date);
  }, []);

  const handleNavigateFromModal = useCallback((date: string, id: string, isEdit: boolean) => {
    onViewChange('diary');
    navigateAndOpenModal(date, id, isEdit);
    setSelectedItem(null);
    onClose(); 
  }, [navigateAndOpenModal, onClose]);

  const handleClose = useCallback(() => {
    actions.closeAllPanels();
    onClose();
  }, [actions, onClose]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <>
      <div className={`side-sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={handleClose} />
      
      <div className={`side-sidebar-container ${isOpen ? 'open' : ''}`}>
        <div className="side-menu">
          <div className="side-menu-header">
            <div className="side-logo">
              <Calendar size={24} strokeWidth={3} />
              <span>다이어리</span>
            </div>
            <button className="side-close-btn" onClick={handleClose} aria-label="Close sidebar">
              <X size={20} />
            </button>
          </div>

          <div className="side-menu-body">
            <nav className="side-menu-nav">
              {/* 메인 뷰 전환 메뉴 */}
              <button 
                className={`side-menu-item ${currentView === 'diary' ? 'active' : ''}`} 
                onClick={() => onViewChange('diary')}
              >
                <Calendar size={24} />
                <span>다이어리</span>
              </button>

              <button 
                className={`side-menu-item ${currentView === 'map' ? 'active' : ''}`} 
                onClick={() => onViewChange('map')}
              >
                <MapPin size={24} />
                <span>지도 보기</span>
              </button>

              <div className="side-nav-divider" />

              {/* 데이터 요약/관리 메뉴 */}
              <button 
                className={`side-menu-item ${expandedPanel === 'todo' ? 'active' : ''}`} 
                onClick={() => actions.togglePanel('todo')}
              >
                <CheckCircle size={24} />
                <span>전체 할 일</span>
                <ChevronRight size={16} className={`arrow ${expandedPanel === 'todo' ? 'rotated' : ''}`} />
              </button>

              <button 
                className={`side-menu-item ${expandedPanel === 'diary' ? 'active' : ''}`} 
                onClick={() => actions.togglePanel('diary')}
              >
                <Book size={24} />
                <span>일기 모아보기</span>
                <ChevronRight size={16} className={`arrow ${expandedPanel === 'diary' ? 'rotated' : ''}`} />
              </button>

              <button 
                className={`side-menu-item ${expandedPanel === 'anniversary' ? 'active' : ''}`} 
                onClick={() => actions.togglePanel('anniversary')}
              >
                <Gift size={24} />
                <span>기념일 목록</span>
                <ChevronRight size={16} className={`arrow ${expandedPanel === 'anniversary' ? 'rotated' : ''}`} />
              </button>

              <div className="side-nav-divider" />
              
              <button className="side-menu-item" onClick={() => setIsSettingsModalOpen(true)}>
                <Settings size={24} />
                <span>환경 설정</span>
              </button>

              <button className="side-menu-item logout-btn" onClick={() => setIsLogoutConfirmOpen(true)}>
                <LogOut size={24} />
                <span>로그아웃</span>
              </button>
            </nav>
          </div>
        </div>

        {/* 1. 할 일 확장 패널 */}
        <SidebarGroupedList<EntryItem>
          title="전체 할 일"
          emptyMessage="등록된 할 일이 없습니다."
          isVisible={expandedPanel === 'todo'}
          width={extensionWidth}
          isResizing={isResizing}
          onResizerMouseDown={actions.startResizing}
          groupedData={todoData.groupedTodos}
          sortedMonths={todoData.sortedMonths}
          expandedMonths={expandedTodoMonths}
          onToggleMonth={actions.toggleTodoMonth}
          onClose={actions.closeAllPanels}
          renderItem={(item, date) => (
            <SidebarTodoItem
              key={item.id}
              item={item}
              date={date}
              isEditing={todoData.editingId === item.id}
              isSelected={selectedItem?.id === item.id}
              onToggle={todoData.actions.toggleTodo}
              onNavigateEdit={navigateAndOpenModal}
              onSelect={() => handleSelectItem(item, date)}
              editState={todoData.editForm}
              setEditState={todoData.setEditForm}
              onSave={todoData.actions.handleSaveEdit}
              onCancel={todoData.actions.cancelEditing}
            />
          )}
        />

        {/* 2. 일기 확장 패널 */}
        <SidebarGroupedList<EntryItem>
          title="일기 모아보기"
          emptyMessage="작성된 일기가 없습니다."
          isVisible={expandedPanel === 'diary'}
          width={extensionWidth}
          isResizing={isResizing}
          onResizerMouseDown={actions.startResizing}
          groupedData={diaryData.groupedDiaries}
          sortedMonths={diaryData.sortedMonths}
          expandedMonths={expandedDiaryMonths}
          onToggleMonth={actions.toggleDiaryMonth}
          onClose={actions.closeAllPanels}
          renderItem={(item, date) => (
            <li 
              key={item.id} 
              className={`side-todo-item ${selectedItem?.id === item.id ? 'selected' : ''}`}
              style={{ 
                borderLeft: `3px solid ${item.color || 'var(--accent)'}`,
                backgroundColor: selectedItem?.id === item.id ? (item.color || 'var(--accent)') + '25' : 'transparent'
              }}
              onClick={() => handleSelectItem(item, date)}
            >
              <div className="side-todo-item-header">
                <Book size={16} className="diary-icon" style={{ color: item.color || 'var(--accent)' }} />
                <p className="side-todo-title">{item.title}</p>
              </div>
            </li>
          )}
        />

        {/* 3. 기념일 확장 패널 */}
        <SidebarGroupedList<EntryItem>
          title="기념일 목록"
          emptyMessage="등록된 기념일이 없습니다."
          isVisible={expandedPanel === 'anniversary'}
          width={extensionWidth}
          isResizing={isResizing}
          onResizerMouseDown={actions.startResizing}
          groupedData={anniData.groupedAnniversaries}
          sortedMonths={anniData.sortedMonths}
          expandedMonths={expandedAnniMonths}
          onToggleMonth={actions.toggleAnniMonth}
          onClose={actions.closeAllPanels}
          renderItem={(item, date) => (
            <li 
              key={item.id} 
              className={`side-todo-item side-anni-item ${selectedItem?.id === item.id ? 'selected' : ''}`}
              style={{ borderLeft: `4px solid ${item.color}` }}
              onClick={() => handleSelectItem(item as EntryItem, date)}
            >
              <div className="side-todo-item-header">
                <div className="side-anni-icon-wrapper">
                   {React.createElement(ANNIVERSARY_ICONS[(item as EntryItem).icon || 'Gift'] || Gift, { size: 16, style: { color: (item as EntryItem).color } })}
                </div>
                <p className="side-todo-title">{(item as EntryItem).title}</p>
              </div>
            </li>
          )}
        />
      </div>

      {/* 공통 상세 미리보기 모달 */}
      {selectedItem && (
        <SideDetailModal
          item={selectedItem}
          date={selectedDate}
          onClose={() => setSelectedItem(null)}
          onNavigate={handleNavigateFromModal}
        />
      )}

      {/* 로그아웃 확인 모달 */}
      {isLogoutConfirmOpen && (
        <div className="logout-confirm-overlay" onClick={() => setIsLogoutConfirmOpen(false)}>
          <div className="logout-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>로그아웃 하시겠습니까?</h3>
            <p>다음에 다시 만나요!</p>
            <div className="logout-confirm-buttons">
              <button className="logout-btn-cancel" onClick={() => setIsLogoutConfirmOpen(false)}>취소</button>
              <button className="logout-btn-confirm" onClick={handleLogout}>로그아웃</button>
            </div>
          </div>
        </div>
      )}

      {/* 환경 설정 모달 */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </>
  );
};

export default Sidebar;

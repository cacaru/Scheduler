import React from 'react';
import { Calendar, Map as MapIcon, ListTodo, Gift, LogOut, BookOpen, ChevronRight } from 'lucide-react';
import { type ViewType } from '../../App';
import { type SidebarPanelType } from '../../hooks/useSidebarUI';

interface SidebarMenuProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  expandedPanel: SidebarPanelType;
  onTogglePanel: (panel: SidebarPanelType) => void;
  onLogout: () => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({
  currentView,
  onViewChange,
  expandedPanel,
  onTogglePanel,
  onLogout
}) => {
  return (
    <nav className="side-menu-nav">
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
        <MapIcon size={24} />
        <span>지도 뷰</span>
      </button>

      <div className="side-nav-divider" />

      <button 
        className={`side-menu-item ${expandedPanel === 'todo' ? 'active' : ''}`}
        onClick={() => onTogglePanel('todo')}
      >
        <ListTodo size={24} />
        <span>전체 할 일</span>
        <ChevronRight size={16} className={`arrow ${expandedPanel === 'todo' ? 'rotated' : ''}`} />
      </button>

      <button 
        className={`side-menu-item ${expandedPanel === 'diary' ? 'active' : ''}`}
        onClick={() => onTogglePanel('diary')}
      >
        <BookOpen size={24} />
        <span>전체 일기</span>
        <ChevronRight size={16} className={`arrow ${expandedPanel === 'diary' ? 'rotated' : ''}`} />
      </button>

      <button 
        className={`side-menu-item anniversary-btn ${expandedPanel === 'anniversary' ? 'active' : ''}`} 
        onClick={() => onTogglePanel('anniversary')}
      >
        <Gift size={24} />
        <span>기념일 목록</span>
        <ChevronRight size={16} className={`arrow ${expandedPanel === 'anniversary' ? 'rotated' : ''}`} />
      </button>

      <div className="side-nav-divider" />
      
      <button className="side-menu-item logout-btn" onClick={onLogout}>
        <LogOut size={24} />
        <span>로그아웃</span>
      </button>
    </nav>
  );
};

export default SidebarMenu;

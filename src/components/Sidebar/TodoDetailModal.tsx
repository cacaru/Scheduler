import React from 'react';
import { MapPin, Calendar, X, Book, Check, Gift, Heart, Star, Cake, PartyPopper } from 'lucide-react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import { type EntryItem } from '../../store/diaryStore';
import { formatDateWithDay } from '../../utils/dateUtils';

interface TodoDetailModalProps {
  item: EntryItem;
  date: string;
  onClose: () => void;
  onNavigate: (date: string, id: string, isEdit: boolean) => void;
}

const ANNIVERSARY_ICONS: Record<string, React.ElementType> = {
  Gift,
  Heart,
  Star,
  Cake,
  Party: PartyPopper,
};

const TodoDetailModal: React.FC<TodoDetailModalProps> = ({ item, date, onClose, onNavigate }) => {
  const itemColor = item.color || '#cbd5e0';
  
  const renderTypeBadge = () => {
    let Icon: React.ElementType = Book;
    let label = '일기';
    
    if (item.type === 'todo') {
      Icon = Check;
      label = '할 일';
    } else if (item.type === 'anniversary') {
      Icon = ANNIVERSARY_ICONS[item.icon || 'Gift'] || Gift;
      label = '기념일';
    }
    
    return (
      <div 
        className="side-detail-type-badge" 
        style={{ 
          borderColor: itemColor,
          boxShadow: `0 0 10px ${itemColor}30`,
          backgroundColor: `${itemColor}15`,
          color: 'black' /* 텍스트는 항상 검은색 */
        }}
      >
        <Icon size={12} strokeWidth={3} style={{ color: itemColor }} />
        <span style={{ color: 'black' }}>{label}</span>
      </div>
    );
  };

  return (
    <div className="side-modal-overlay" onClick={onClose}>
      <div className="side-todo-modal" onClick={(e) => e.stopPropagation()}>
        <div className="side-detail-header">
          <div className="side-detail-header-left">
            {renderTypeBadge()}
            <h4>{item.title}</h4>
          </div>
          <button className="side-close-btn" onClick={onClose} aria-label="닫기"><X size={20} /></button>
        </div>
        
        <div className="side-detail-body">
          <div className="side-detail-item">
            <label>날짜</label>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent)' }}>{formatDateWithDay(date)}</span>
              
            </div>
          </div>
                  
          {item.content && (
            <div className="side-detail-item">
              <label>내용</label>
              <div className="side-detail-content-text">
                {item.content}
              </div>
            </div>
          )}
          
          {item.location && (
            <div className="side-detail-item">
              <label>위치 정보</label>
              <div className="side-location-info-badge">
                <MapPin size={14} />
                <span>{item.location.name || item.location.address}</span>
              </div>
              <div className="side-detail-map-wrapper">
                <Map 
                  center={{ lat: item.location.lat, lng: item.location.lng }} 
                  style={{ width: '100%', height: '220px', borderRadius: '20px' }}
                  level={4}
                  draggable={true}
                >
                  <MapMarker position={{ lat: item.location.lat, lng: item.location.lng }} />
                </Map>
              </div>
            </div>
          )}
        </div>
        <div className="side-detail-footer">
          <div className="side-detail-footer-btn-wrapper">
            <button 
              className="side-navigate-date-btn"
              onClick={() => onNavigate(date, item.id, false)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            >
              <Calendar size={14} />
              이 날짜로 이동
            </button>
          </div>
          <div className="side-detail-footer-btn-wrapper">
            <button 
              className="side-navigate-date-btn"
              onClick={() => onNavigate(date, item.id, true)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'var(--accent-heavy)',
                color: 'white',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            >
              <Calendar size={14} />
              수정하러 가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoDetailModal;

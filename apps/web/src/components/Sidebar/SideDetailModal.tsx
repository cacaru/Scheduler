import React from 'react';
import { MapPin, Calendar, X, Book, Check, Gift } from 'lucide-react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import { type EntryItem } from '@project/shared/src/store/diaryStore';
import { formatDateWithDay } from '@project/shared/src/utils/dateUtils';
import './SideDetailModal.css';
import { ANNIVERSARY_ICONS } from '@project/shared/src/constants/anniversary';

interface TodoDetailModalProps {
  item: EntryItem;
  date: string;
  onClose: () => void;
  onNavigate: (date: string, id: string, isEdit: boolean) => void;
}

const SideDetailModal: React.FC<TodoDetailModalProps> = ({ 
  item,
  date,
  onClose,
  onNavigate 
}) => {
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
        }}
      >
        <Icon size={12} strokeWidth={3} style={{ color: itemColor }} />
        <span>{label}</span>
      </div>
    );
  };

  return (
      <div className="side-modal-overlay" onClick={onClose} >
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
              <div className="side-detail-date-wrapper">
                <span className="side-detail-date-text">{formatDateWithDay(date)}</span>
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
                    style={{ width: '100%', height: '220px' }}
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
                className="side-navigate-date-btn primary"
                onClick={() => onNavigate(date, item.id, false)}
              >
                <Calendar size={14} />
                이 날짜로 이동
              </button>
            </div>
            <div className="side-detail-footer-btn-wrapper">
              <button 
                className="side-navigate-date-btn heavy"
                onClick={() => onNavigate(date, item.id, true)}
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

export default SideDetailModal;

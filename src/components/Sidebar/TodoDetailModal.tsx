/**
 * TodoDetailModal.tsx
 * 사이드바에서 할 일을 클릭했을 때 나타나는 상세 정보 팝업입니다.
 * 날짜 확인, 내용 열람, 위치 정보 지도 확인 및 해당 날짜로 이동하는 기능을 제공합니다.
 */
import React from 'react';
import { MapPin, Calendar, X } from 'lucide-react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import { type EntryItem } from '../../store/diaryStore';
import { formatDateWithDay } from '../../utils/dateUtils';

interface TodoDetailModalProps {
  item: EntryItem;
  date: string;
  onClose: () => void;
  onNavigate: (date: string, id: string) => void;
}

const TodoDetailModal: React.FC<TodoDetailModalProps> = ({ item, date, onClose, onNavigate }) => (
  <div className="side-modal-overlay" onClick={onClose}>
    <div className="side-todo-modal" onClick={(e) => e.stopPropagation()}>
      <div className="side-detail-header">
        <div className="side-detail-header-left">
          <span className="side-detail-badge">상세 내용</span>
          <h4>{item.title}</h4>
        </div>
        <button className="side-close-btn" onClick={onClose} aria-label="닫기"><X size={20} /></button>
      </div>
      
      <div className="side-detail-body">
        <div className="side-detail-item">
          <label>날짜</label>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent)' }}>{formatDateWithDay(date)}</span>
            <button 
              className="side-navigate-date-btn"
              onClick={() => onNavigate(date, item.id)}
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
    </div>
  </div>
);

export default TodoDetailModal;

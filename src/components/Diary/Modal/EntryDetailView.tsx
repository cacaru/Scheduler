import React from 'react';
import { X as CloseIcon, MapPin, Edit2 } from 'lucide-react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import { type EntryItem } from '../../../store/diaryStore';

/**
 * EntryDetailView.tsx
 * 선택된 일기 또는 할 일의 상세 내용을 보여주는 독립 패널입니다.
 * 내용 텍스트와 등록된 위치 정보를 카카오 지도로 함께 표시합니다.
 */

interface EntryDetailViewProps {
  item: EntryItem | null; // null 허용으로 변경 (항상 렌더링을 위해)
  isOpen: boolean;
  onClose: () => void;
  onEdit: (item: EntryItem) => void;
}

const EntryDetailView: React.FC<EntryDetailViewProps> = ({ item, isOpen, onClose, onEdit }) => {
  return (
    <div 
      className={`independent-modal detail-modal ${isOpen ? 'is-open' : ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      {item && (
        <>
          <div className="modal-header">
            <button className="icon-btn" onClick={onClose}><CloseIcon size={20} /></button>
            <h3>상세 내용</h3>
            <div style={{ width: 40 }} />
          </div>
          <div className="modal-body scrollable">
            <h2 className="detail-main-title">{item.title}</h2>
            <div className="detail-text-box">
              {item.content || "기록된 내용이 없습니다."}
            </div>

            {item.location && (
              <div style={{ marginTop: '25px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b8c1ec', fontWeight: 800, fontSize: '0.9rem', marginBottom: '12px' }}>
                  <MapPin size={16} /> {item.location.name}
                </div>
                <div style={{ height: '220px', borderRadius: '24px', overflow: 'hidden', border: '1px solid #eee' }}>
                  <Map center={{ lat: item.location.lat, lng: item.location.lng }} style={{ width: '100%', height: '100%' }} level={3}>
                    <MapMarker position={{ lat: item.location.lat, lng: item.location.lng }} />
                  </Map>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="edit-btn" onClick={() => onEdit(item)}>
              <Edit2 size={16} /> 수정하기
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EntryDetailView;

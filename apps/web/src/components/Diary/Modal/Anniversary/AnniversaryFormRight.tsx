import React from 'react';
import { MapPin } from 'lucide-react';
import MapPicker from '../../../Map/MapPicker';
import { type EntryItem } from '@project/shared/src/store/diaryStore';

interface AnniversaryFormRightProps {
  title: string;
  onTitleChange: (value: string) => void;
  content: string;
  onContentChange: (value: string) => void;
  showMap: boolean;
  onShowMapToggle: () => void;
  selectedLocation?: EntryItem['location'];
  onLocationSelect: (location: EntryItem['location']) => void;
}

const AnniversaryFormRight: React.FC<AnniversaryFormRightProps> = ({
  title, onTitleChange, content, onContentChange,
  showMap, onShowMapToggle, selectedLocation, onLocationSelect
}) => {
  return (
    <div className="anni-form-right">
      <div className="form-section">
        <label>기념일 이름</label>
        <input
          type="text"
          placeholder="예: 내 생일, 우리 만난 날"
          value={title}
          onChange={e => onTitleChange(e.target.value)}
          className="anni-input"
          required
        />
      </div>

      <div className="form-section">
        <label>기념일 내용</label>
        <textarea
          placeholder="기념일에 대한 설명을 적어주세요"
          value={content}
          onChange={e => onContentChange(e.target.value)}
          className="anni-input anni-textarea"
          rows={3}
        />
      </div>

      <div className="form-section">
        <label>장소 기록</label>
        <button 
          type="button"
          className={`map-toggle-btn ${showMap ? 'active' : ''}`} 
          onClick={onShowMapToggle}
        >
          <MapPin size={18} /> {showMap ? '지도 닫기' : '장소 기억하기'}
        </button>
        
        {showMap && (
          <div className="anni-map-container">
            <MapPicker 
              onLocationSelect={onLocationSelect} 
              initialLocation={selectedLocation} 
            />
          </div>
        )}
        {selectedLocation?.name && (
          <div className="selected-location-info">
            <MapPin size={14} />
            <span>{selectedLocation.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnniversaryFormRight;

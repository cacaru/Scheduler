import React from 'react';
import { X as CloseIcon, MapPin } from 'lucide-react';
import MapPicker from '../../Map/MapPicker';
import { PRESET_COLORS } from '../../../constants/colors';
import { type EntryType, type EntryItem } from '../../../store/diaryStore';

/**
 * EntryEditForm.tsx
 * 일기 및 할 일을 새롭게 작성하거나 기존 내용을 수정하는 입력 폼 패널입니다.
 * 타입 선택, 색상 지정, 위치 검색(MapPicker) 기능을 포함합니다.
 */

interface EntryEditFormProps {
  isOpen: boolean;
  isEditing: boolean;
  type: EntryType;
  title: string;
  content: string;
  selectedColor: string;
  selectedLocation?: EntryItem['location'];
  showMap: boolean;
  onClose: () => void;
  setType: (type: EntryType) => void;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setSelectedColor: (color: string) => void;
  setSelectedLocation: (location: EntryItem['location']) => void;
  setShowMap: (show: boolean) => void;
  onSubmit: () => void;
}

const EntryEditForm: React.FC<EntryEditFormProps> = ({
  isOpen, isEditing, type, title, content, selectedColor, selectedLocation, showMap,
  onClose, setType, setTitle, setContent, setSelectedColor, setSelectedLocation, setShowMap, onSubmit
}) => {
  // if (!isOpen) return null; // CSS transition을 위해 제거

  return (
    <div 
      className={`independent-modal form-modal ${isOpen ? 'is-open' : ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="modal-header">
        <div style={{ width: 40 }} />
        <h3>{isEditing ? '기록 수정' : '새 기록'}</h3>
        <button className="icon-btn" onClick={onClose}><CloseIcon size={20} /></button>
      </div>
      <div className="modal-body scrollable">
        <div className="form-tabs">
          <button className={`type-btn ${type === 'diary' ? 'active' : ''}`} onClick={() => setType('diary')} disabled={isEditing}>일기</button>
          <button className={`type-btn ${type === 'todo' ? 'active' : ''}`} onClick={() => setType('todo')} disabled={isEditing}>할 일</button>
        </div>

        <div className="color-palette-box">
          {PRESET_COLORS.map(c => (
            <button key={c} className={`color-circle ${selectedColor === c ? 'active' : ''}`} style={{ backgroundColor: c }} onClick={() => setSelectedColor(c)} />
          ))}
        </div>

        <input className="title-input" type="text" placeholder="제목을 입력하세요" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
        {type === 'diary' && <textarea className="content-input" placeholder="상세 내용을 입력하세요" value={content} onChange={e => setContent(e.target.value)} />}
        
        <button className={`map-toggle-btn ${showMap ? 'active' : ''}`} onClick={() => setShowMap(!showMap)}>
          <MapPin size={18} /> {showMap ? '지도 닫기' : '장소 기억하기'}
        </button>
        
        {showMap && (
          <div style={{ marginTop: '20px', height: '300px', borderRadius: '24px', overflow: 'hidden', border: '1px solid #eee' }}>
            <MapPicker onLocationSelect={setSelectedLocation} initialLocation={selectedLocation} />
          </div>
        )}
      </div>
      <div className="modal-footer">
        <button className="save-btn" onClick={onSubmit}>기록 저장하기</button>
      </div>
    </div>
  );
};

export default EntryEditForm;

import React, { useState, useEffect } from 'react';
import { X as CloseIcon, MapPin, Calendar } from 'lucide-react';
import MapPicker from '../../../Map/MapPicker';
import MiniCalendar from '../../../common/MiniCalendar/MiniCalendar';
import { PRESET_COLORS } from '../../../../constants/colors';
import { type EntryType, type EntryItem } from '../../../../store/diaryStore';
import { parseISO } from 'date-fns';

/**
 * EntryEditForm.tsx
 * 일기 및 할 일을 새롭게 작성하거나 기존 내용을 수정하는 입력 폼 패널입니다.
 * 타입 선택, 날짜 변경, 색상 지정, 위치 검색(MapPicker) 기능을 포함합니다.
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
  currentDate: string; // 현재 폼의 날짜
  startDate: string;
  endDate: string;
  onClose: () => void;
  setType: (type: EntryType) => void;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setSelectedColor: (color: string) => void;
  setSelectedLocation: (location: EntryItem['location']) => void;
  setShowMap: (show: boolean) => void;
  onDateChange: (date: string) => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  onSubmit: () => void;
}

const EntryEditForm: React.FC<EntryEditFormProps> = ({
  isOpen, isEditing, type, title, content, selectedColor, selectedLocation, showMap, currentDate,
  startDate, endDate,
  onClose, setType, setTitle, setContent, setSelectedColor, setSelectedLocation, setShowMap, onDateChange,
  setStartDate, setEndDate, onSubmit
}) => {
  const [viewMonth, setViewMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState<'single' | 'start' | 'end' | null>(null);

  useEffect(() => {
    if (isOpen && currentDate) {
      setViewMonth(parseISO(currentDate));
    }
  }, [isOpen, currentDate]);

  const titleText = isEditing 
    ? (type === 'diary' ? '일기 수정' : '할 일 수정') 
    : (type === 'diary' ? '새 일기' : '새 할 일');

  return (
    <div 
      className={`independent-modal form-modal ${isOpen ? 'is-open' : ''}`}
      onClick={(e) => e.stopPropagation()}
      style={{ '--bg-color': selectedColor } as React.CSSProperties}
    >
      <h2 
        className="form-floating-title capsule header-style-neon" 
        style={{ backgroundColor: selectedColor, color: 'black' }}
      >
        {titleText}
      </h2>

      <div className="modal-header">
        <div style={{ width: 40 }} />
        <button className="icon-btn" onClick={onClose}><CloseIcon size={20} /></button>
      </div>
      <div className="modal-body scrollable">
        <div className="form-tabs">
          <button className={`type-btn ${type === 'diary' ? 'active' : ''}`} onClick={() => setType('diary')} disabled={isEditing}>일기</button>
          <button className={`type-btn ${type === 'todo' ? 'active' : ''}`} onClick={() => setType('todo')} disabled={isEditing}>할 일</button>
        </div>

        <div className="form-section-label">기록 테마</div>
        <div className="color-palette-box simple">
          {PRESET_COLORS.map(c => (
            <button key={c} className={`color-circle ${selectedColor === c ? 'active' : ''}`} style={{ backgroundColor: c }} onClick={() => setSelectedColor(c)} />
          ))}
        </div>

        {type === 'todo' ? (
          <>
            <div className="form-section-label" style={{ marginTop: '20px' }}>기간 설정</div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button 
                type="button" 
                className={`date-toggle-btn ${showCalendar === 'start' ? 'active' : ''}`}
                onClick={() => setShowCalendar(showCalendar === 'start' ? null : 'start')}
                style={{ flex: 1 }}
              >
                <Calendar size={16} /> {startDate}
              </button>
              <span style={{ color: '#cbd5e0', fontWeight: 800 }}>~</span>
              <button 
                type="button" 
                className={`date-toggle-btn ${showCalendar === 'end' ? 'active' : ''}`}
                onClick={() => setShowCalendar(showCalendar === 'end' ? null : 'end')}
                style={{ flex: 1 }}
              >
                <Calendar size={16} /> {endDate}
              </button>
            </div>
            {showCalendar === 'start' && (
              <div className="inline-calendar-container">
                <MiniCalendar 
                  selectedDate={startDate}
                  onDateSelect={(d) => { setStartDate(d); setShowCalendar(null); }}
                  viewMonth={viewMonth}
                  onMonthChange={setViewMonth}
                  activeColor={selectedColor}
                />
              </div>
            )}
            {showCalendar === 'end' && (
              <div className="inline-calendar-container">
                <MiniCalendar 
                  selectedDate={endDate}
                  onDateSelect={(d) => { setEndDate(d); setShowCalendar(null); }}
                  viewMonth={viewMonth}
                  onMonthChange={setViewMonth}
                  activeColor={selectedColor}
                />
              </div>
            )}
          </>
        ) : (
          <>
            <div className="form-section-label" style={{ marginTop: '20px' }}>날짜 선택</div>
            <button 
              type="button" 
              className={`date-toggle-btn ${showCalendar === 'single' ? 'active' : ''}`}
              onClick={() => setShowCalendar(showCalendar === 'single' ? null : 'single')}
            >
              <Calendar size={18} /> {currentDate}
            </button>

            {showCalendar === 'single' && (
              <div className="inline-calendar-container">
                <MiniCalendar 
                  selectedDate={currentDate}
                  onDateSelect={(d) => { onDateChange(d); setShowCalendar(null); }}
                  viewMonth={viewMonth}
                  onMonthChange={setViewMonth}
                  activeColor={selectedColor}
                />
              </div>
            )}
          </>
        )}

        <div className="form-section-label" style={{ marginTop: '20px' }}>내용 입력</div>
        <input className="title-input" type="text" placeholder="제목을 입력하세요" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
        <textarea className="content-input" placeholder="상세 내용을 입력하세요" value={content} onChange={e => setContent(e.target.value)} />
        
        <div className="form-section-label" style={{ marginTop: '20px' }}>장소 기록</div>
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

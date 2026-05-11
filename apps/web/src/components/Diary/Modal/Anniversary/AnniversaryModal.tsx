import React from 'react';
import { X, Gift } from 'lucide-react';
import { useAnniversaryForm } from '@project/shared/src/hooks/useAnniversaryForm';
import AnniversaryForm from './AnniversaryForm';
import './AnniversaryModal.css';

interface AnniversaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string; // "yyyy-MM-dd" 형식
}

const AnniversaryModal: React.FC<AnniversaryModalProps> = ({ isOpen, onClose, initialDate }) => {
  const { state, setters, actions } = useAnniversaryForm({ isOpen, initialDate, onClose });

  // ESC 키로 모달 닫기
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="anniversary-modal-overlay" onClick={onClose}>
      <form 
        className="anniversary-modal-container" 
        onClick={e => e.stopPropagation()}
        onSubmit={actions.handleSubmit}
      >
        <div className="anniversary-modal-header">
          <div className="header-title">
            <Gift className="title-icon" size={24} />
            <h3>새 기념일 등록</h3>
          </div>
          <button className="close-btn" type="button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="anniversary-modal-body">
          <AnniversaryForm 
            date={state.date}
            onDateChange={setters.setDate}
            viewMonth={state.viewMonth}
            onMonthChange={setters.setViewMonth}
            isRecurring={state.isRecurring}
            onRecurringChange={setters.setIsRecurring}
            selectedColor={state.selectedColor}
            onColorSelect={setters.setSelectedColor}
            selectedIcon={state.selectedIcon}
            onIconSelect={setters.setSelectedIcon}
            title={state.title}
            onTitleChange={setters.setTitle}
            content={state.content}
            onContentChange={setters.setContent}
            showMap={state.showMap}
            onShowMapToggle={() => setters.setShowMap(!state.showMap)}
            selectedLocation={state.selectedLocation}
            onLocationSelect={setters.setSelectedLocation}
          />
        </div>

        <div className="anniversary-modal-footer">
          <button type="submit" className="submit-btn" disabled={state.isLoading}>
            {state.isLoading ? '저장 중...' : '기념일 추가하기'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AnniversaryModal;

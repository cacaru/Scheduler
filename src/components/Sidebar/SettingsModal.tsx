import React, { useEffect } from 'react';
import { X, Palette, Sun, Moon } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { THEME_COLORS } from '../../constants/colors';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  onChangeTheme: (primary: string, light: string, heavy: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onChangeTheme
}) => {
  const { theme, toggleTheme, setModalOpen } = useUIStore();

  // 스크롤 잠금 제어
  useEffect(() => {
    if (isOpen) {
      setModalOpen(true);
      return () => setModalOpen(false);
    }
  }, [isOpen, setModalOpen]);

  // ESC 키로 모달 닫기
  useEffect(() => {
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
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal-header">
          <div className="settings-title">
            <Palette size={20} className="title-icon" />
            <h3>환경 설정</h3>
          </div>
          <button className="settings-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-modal-body">
          {/* 다크 모드 섹션 */}
          <div className="settings-section">
            <div className="section-label">화면 테마</div>
            <div className="settings-row">
              <div className="setting-info">
                <div className="setting-name">
                  {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                  <span>{theme === 'light' ? '다크 모드 사용' : '라이트 모드 사용'}</span>
                </div>
                <div className="setting-desc">애플리케이션의 밝기를 조절합니다.</div>
              </div>
              <button 
                className={`settings-toggle ${theme === 'dark' ? 'active' : ''}`} 
                onClick={toggleTheme}
              >
                <div className="toggle-knob">
                   {theme === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
                </div>
              </button>
            </div>
          </div>

          {/* 테마 색상 섹션 */}
          <div className="settings-section">
            <div className="section-label">포인트 색상</div>
            <div className="setting-desc" style={{ marginBottom: '16px' }}>
              다이어리의 주요 강조 색상을 변경합니다.
            </div>
            <div className="theme-grid">
              {THEME_COLORS.map((color) => (
                <button
                  key={color.primary}
                  className={`theme-option-card ${currentTheme.toLowerCase() === color.primary.toLowerCase() ? 'active' : ''}`}
                  onClick={() => onChangeTheme(color.primary, color.light, color.heavy)}
                >
                  <div 
                    className="color-preview" 
                    style={{ backgroundColor: color.primary }} 
                  />
                  <span className="color-name">{color.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="settings-modal-footer">
          <button className="settings-done-btn" onClick={onClose}>확인</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

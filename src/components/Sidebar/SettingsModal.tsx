import React, { useEffect } from 'react';
import { X, Palette, Sun, Moon, Type } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { THEME_COLORS } from '../../constants/colors';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  onChangeTheme: (primary: string, light: string, heavy: string) => void;
}

const FONTS = [
  { name: '교보손글씨', value: 'KyoboHandwriting2019' },
  { name: '리디바탕', value: 'Ridibatang' },
  { name: '프리텐다드', value: 'Pretendard' },
  { name: '주아체', value: 'Juache' },
  { name: '카페24 서라운드', value: 'Cafe24Surround' },
  { name: '나눔스퀘어 네오', value: 'NanumSquareNeo' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onChangeTheme
}) => {
  const { 
    theme: globalTheme, 
    toggleTheme: globalToggleTheme, 
    setModalOpen, 
    bodyFont: globalBodyFont, 
    titleFont: globalTitleFont, 
    setFonts: globalSetFonts,
    theme_primary,
    theme_light,
    theme_heavy,
    setThemeColors
  } = useUIStore();

  // 로컬 임시 상태 (확인 버튼을 누르기 전까지 유지)
  const [tempTheme, setTempTheme] = React.useState(globalTheme);
  const [tempColors, setTempColors] = React.useState({
    primary: theme_primary,
    light: theme_light,
    heavy: theme_heavy
  });
  const [tempBodyFont, setTempBodyFont] = React.useState(globalBodyFont);
  const [tempTitleFont, setTempTitleFont] = React.useState(globalTitleFont);

  // 모달이 열릴 때 현재 전역 상태로 로컬 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setTempTheme(globalTheme);
      setTempColors({
        primary: theme_primary,
        light: theme_light,
        heavy: theme_heavy
      });
      setTempBodyFont(globalBodyFont);
      setTempTitleFont(globalTitleFont);
    }
  }, [isOpen, globalTheme, theme_primary, theme_light, theme_heavy, globalBodyFont, globalTitleFont]);

  // 임시 변경사항을 실시간으로 화면에 미리보기 (단, 저장은 하지 않음)
  useEffect(() => {
    if (isOpen) {
      document.documentElement.setAttribute('data-theme', tempTheme);
      document.documentElement.style.setProperty('--accent', tempColors.primary);
      document.documentElement.style.setProperty('--accent-light', tempColors.light);
      document.documentElement.style.setProperty('--accent-heavy', tempColors.heavy);
      document.documentElement.style.setProperty('--font-body', `"${tempBodyFont}", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif`);
      document.documentElement.style.setProperty('--font-title', `"${tempTitleFont}", sans-serif`);
    }
  }, [isOpen, tempTheme, tempColors, tempBodyFont, tempTitleFont]);

  // 스크롤 잠금 제어
  useEffect(() => {
    if (isOpen) {
      setModalOpen(true);
      return () => setModalOpen(false);
    }
  }, [isOpen, setModalOpen]);

  // 취소 시 (X 버튼, 배경 클릭 등) 원래 상태로 복구하고 닫기
  const handleCancel = () => {
    document.documentElement.setAttribute('data-theme', globalTheme);
    document.documentElement.style.setProperty('--accent', theme_primary);
    document.documentElement.style.setProperty('--accent-light', theme_light);
    document.documentElement.style.setProperty('--accent-heavy', theme_heavy);
    document.documentElement.style.setProperty('--font-body', `"${globalBodyFont}", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif`);
    document.documentElement.style.setProperty('--font-title', `"${globalTitleFont}", sans-serif`);
    onClose();
  };

  // 확인 시 전역 상태 및 로컬스토리지 업데이트
  const handleConfirm = () => {
    // 테마가 바뀌었을 때만 토글 (globalToggleTheme는 내부적으로 토글 방식이므로 주의 필요)
    if (tempTheme !== globalTheme) {
      globalToggleTheme();
    }
    
    setThemeColors(tempColors.primary, tempColors.light, tempColors.heavy);
    globalSetFonts(tempBodyFont, tempTitleFont);
    onClose();
  };

  // ESC 키로 모달 닫기 (취소 처리)
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, handleCancel]);

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay" onClick={handleCancel}>
      <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal-header">
          <div className="settings-title">
            <Palette size={20} className="title-icon" />
            <h3>환경 설정</h3>
          </div>
          <button className="settings-close-btn" onClick={handleCancel}>
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
                  {tempTheme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                  <span>{tempTheme === 'light' ? '다크 모드 사용' : '라이트 모드 사용'}</span>
                </div>
                <div className="setting-desc">애플리케이션의 밝기를 조절합니다.</div>
              </div>
              <button 
                className={`settings-toggle ${tempTheme === 'dark' ? 'active' : ''}`} 
                onClick={() => setTempTheme(prev => prev === 'light' ? 'dark' : 'light')}
              >
                <div className="toggle-knob">
                   {tempTheme === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
                </div>
              </button>
            </div>
          </div>

          {/* 하단 설정 영역 (색상 + 폰트 가로 배치) */}
          <div className="settings-flex-container">
            {/* 테마 색상 섹션 */}
            <div className="settings-section flex-1">
              <div className="section-label">포인트 색상</div>
              <div className="setting-desc" style={{ marginBottom: '16px' }}>
                강조 색상을 변경합니다.
              </div>
              <div className="theme-grid">
                {THEME_COLORS.map((color) => (
                  <button
                    key={color.primary}
                    className={`theme-option-card ${tempColors.primary.toLowerCase() === color.primary.toLowerCase() ? 'active' : ''}`}
                    onClick={() => setTempColors({ primary: color.primary, light: color.light, heavy: color.heavy })}
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

            {/* 폰트 설정 섹션 */}
            <div className="settings-section flex-1">
              <div className="section-label">글씨체 설정</div>
              
              <div className="font-setting-group">
                <div className="font-setting-label">
                  <Type size={14} />
                  <span>기본 글씨체 (본문)</span>
                </div>
                <div className="font-grid">
                  {FONTS.map((font) => (
                    <button
                      key={`body-${font.value}`}
                      className={`font-option-card ${tempBodyFont === font.value ? 'active' : ''}`}
                      style={{ fontFamily: font.value }}
                      onClick={() => setTempBodyFont(font.value)}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="font-setting-group" style={{ marginTop: '20px' }}>
                <div className="font-setting-label">
                  <Type size={14} />
                  <span>포인트 글씨체 (제목)</span>
                </div>
                <div className="font-grid">
                  {FONTS.map((font) => (
                    <button
                      key={`title-${font.value}`}
                      className={`font-option-card ${tempTitleFont === font.value ? 'active' : ''}`}
                      style={{ fontFamily: font.value }}
                      onClick={() => setTempTitleFont(font.value)}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-modal-footer">
          <button className="settings-done-btn" onClick={handleConfirm}>확인</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

import React, { useEffect, useState } from 'react';
import { X, Palette, Sun, Moon, Type } from 'lucide-react';
import { useUIStore } from '@project/shared/src/store/uiStore';
import { THEME_COLORS } from '@project/shared/src/constants/colors';
import styles from './SettingsModal.module.css';
import clsx from 'clsx';
import { useSidebarUI } from '@project/shared/src/hooks/useSidebarUI';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  } = useUIStore();

  const { actions } = useSidebarUI();

  // 로컬 임시 상태 (확인 버튼을 누르기 전까지 유지)
  const [tempTheme, setTempTheme] = useState(globalTheme);
  const [tempColors, setTempColors] = useState({
    primary: theme_primary,
    light: theme_light,
    heavy: theme_heavy
  });
  const [tempBodyFont, setTempBodyFont] = useState(globalBodyFont);
  const [tempTitleFont, setTempTitleFont] = useState(globalTitleFont);

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
    // 테마가 바뀌었을 때만 토글
    if (tempTheme !== globalTheme) {
      globalToggleTheme();
    }
    
    actions.changeTheme(tempColors.primary, tempColors.light, tempColors.heavy);
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
    <div className={styles.settingsModalOverlay} onClick={handleCancel}>
      <div className={styles.settingsModalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.settingsModalHeader}>
          <div className={styles.settingsTitle}>
            <Palette size={20} className={styles.titleIcon} />
            <h3>환경 설정</h3>
          </div>
          <button className={styles.settingsCloseBtn} onClick={handleCancel}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.settingsModalBody}>
          {/* 다크 모드 섹션 */}
          <div className={styles.settingsSection}>
            <div className={styles.sectionLabel}>화면 테마</div>
            <div className={styles.settingsRow}>
              <div className={styles.settingInfo}>
                <div className={styles.settingName}>
                  {tempTheme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                  <span>{tempTheme === 'light' ? '다크 모드 사용' : '라이트 모드 사용'}</span>
                </div>
                <div className={styles.settingDesc}>애플리케이션의 밝기를 조절합니다.</div>
              </div>
              <button 
                className={clsx(styles.settingsToggle, tempTheme === 'dark' && styles.active)} 
                onClick={() => setTempTheme(prev => prev === 'light' ? 'dark' : 'light')}
              >
                <div className={styles.toggleKnob}>
                   {tempTheme === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
                </div>
              </button>
            </div>
          </div>

          {/* 하단 설정 영역 (색상 + 폰트 가로 배치) */}
          <div className={styles.settingsFlexContainer}>
            {/* 테마 색상 섹션 */}
            <div className={clsx(styles.settingsSection, styles.flex1)}>
              <div className={styles.sectionLabel}>포인트 색상</div>
              <div className={styles.settingDesc} style={{ marginBottom: '16px' }}>
                강조 색상을 변경합니다.
              </div>
              <div className={styles.themeGrid}>
                {THEME_COLORS.map((color) => (
                  <button
                    key={color.primary}
                    className={clsx(styles.themeOptionCard, tempColors.primary.toLowerCase() === color.primary.toLowerCase() && styles.active)}
                    onClick={() => setTempColors({ primary: color.primary, light: color.light, heavy: color.heavy })}
                  >
                    <div 
                      className={styles.colorPreview} 
                      style={{ backgroundColor: color.primary }} 
                    />
                    <span className={styles.colorName}>{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 폰트 설정 섹션 */}
            <div className={clsx(styles.settingsSection, styles.flex1)}>
              <div className={styles.sectionLabel}>글씨체 설정</div>
              
              <div className={styles.fontSettingGroup}>
                <div className={styles.fontSettingLabel}>
                  <Type size={14} />
                  <span>기본 글씨체 (본문)</span>
                </div>
                <div className={styles.fontGrid}>
                  {FONTS.map((font) => (
                    <button
                      key={`body-${font.value}`}
                      className={clsx(styles.fontOptionCard, tempBodyFont === font.value && styles.active)}
                      style={{ fontFamily: font.value }}
                      onClick={() => setTempBodyFont(font.value)}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.fontSettingGroup} style={{ marginTop: '20px' }}>
                <div className={styles.fontSettingLabel}>
                  <Type size={14} />
                  <span>포인트 글씨체 (제목)</span>
                </div>
                <div className={styles.fontGrid}>
                  {FONTS.map((font) => (
                    <button
                      key={`title-${font.value}`}
                      className={clsx(styles.fontOptionCard, tempTitleFont === font.value && styles.active)}
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

        <div className={styles.settingsModalFooter}>
          <button className={styles.settingsDoneBtn} onClick={handleConfirm}>확인</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

/**
 * colors.ts
 * 애플리케이션 전반에서 사용되는 통합 색상 상수 관리 파일입니다.
 */

// 1. 다이어리 항목(일기, 할 일)용 16가지 프리셋 색상 (Soft & Deep 톤 온 톤)
export const PRESET_COLORS = [
  // Tone 1: Soft & Muted (For regular items)
  '#f9d5d5', // Soft Rose
  '#f9e2d5', // Soft Peach
  '#f9f0d5', // Soft Cream
  '#e2f9d5', // Soft Sage
  '#d5f9e2', // Soft Mint
  '#d5e2f9', // Soft Sky
  '#e2d5f9', // Soft Lavender
  '#e1e5eb', // Soft Slate

  // Tone 2: Deep & Subdued (For important items)
  '#e59a9a', // Deep Rose
  '#e5af9a', // Deep Peach
  '#e5c99a', // Deep Gold
  '#add694', // Deep Sage
  '#94d6ad', // Deep Mint
  '#94add6', // Deep Blue
  '#ad94d6', // Deep Purple
  '#9ea7b3', // Deep Slate
];

// 2. 전체 앱 배경 및 테마를 위한 12가지 색 조합 (Primary & Accent)
export const THEME_COLORS = [
  // Row 1: Classic Pastels
  { name: '소프트 로즈', primary: '#f9d5d5', light: '#f9d5d525', heavy: '#c4a4a4' },
  { name: '복숭아', primary: '#f9e2d5', light: '#f9e2d525', heavy: '#c4b1a4' },
  { name: '크림', primary: '#f9f0d5', light: '#f9f0d525', heavy: '#c4bc9e' },
  { name: '세이지', primary: '#e2f9d5', light: '#e2f9d525', heavy: '#aec49e' },
  { name: '민트', primary: '#d5f9e2', light: '#d5f9e225', heavy: '#9ec4af' },
  { name: '스카이 블루', primary: '#d5e2f9', light: '#d5e2f925', heavy: '#a4b1c4' },
  
  // Row 2: Muted Elegance
  { name: '라벤더', primary: '#e2d5f9', light: '#e2d5f925', heavy: '#ac9ec4' },
  { name: '더스티 로즈', primary: '#e59a9a', light: '#e59a9a20', heavy: '#b37878' },
  { name: '차분한 금', primary: '#e5c99a', light: '#e5c99a20', heavy: '#b39d78' },
  { name: '바다', primary: '#94add6', light: '#94add620', heavy: '#6d84ab' },
  { name: '딥 퍼플', primary: '#ad94d6', light: '#ad94d620', heavy: '#846dab' },
  { name: '은', primary: '#9ea7b3', light: '#9ea7b320', heavy: '#747d8a' },
];

export const ANNI_COLORS = [
  // Row 1: Soft & Muted (8 Hues)
  '#f9d5d5', '#f9e2d5', '#f9f0d5', '#e2f9d5', '#d5f9e2', '#d5e2f9', '#e2d5f9', '#e1e5eb',
  // Row 2: Deep & Subdued (8 Hues)
  '#e59a9a', '#e5af9a', '#e5c99a', '#add694', '#94d6ad', '#94add6', '#ad94d6', '#9ea7b3',
];
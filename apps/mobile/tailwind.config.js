/** @type {import('tailwindcss').Config} */
module.exports = {
  // 모바일 앱 + 워크스페이스 shared의 클래스명까지 스캔.
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    '../../packages/shared/src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#e2d5f9',
          light: '#e2d5f925',
          heavy: '#ac9ec4',
        },
      },
      fontFamily: {
        body: ['KyoboHandwriting2019', 'system-ui', 'sans-serif'],
        title: ['Cafe24Surround', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

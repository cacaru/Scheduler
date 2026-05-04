# 📅 Scheduler (나만의 일정 관리 앱)

> **React와 Kakao Map API를 활용한 맞춤형 일정 및 일기 관리 도구**

사용자의 위치를 기반으로 장소를 기록하고, 그날의 일기와 할 일을 체계적으로 관리할 수 있는 웹 애플리케이션입니다.

## 🚀 주요 기능

- **🗓️ 스마트 캘린더**: 월별 일정 확인 및 일기 작성 상태를 한눈에 파악
- **🗺️ 장소 기반 기록**: Kakao Map을 연동하여 특정 위치와 함께 일기 저장
- **✅ 할 일 관리 (Todo)**: 사이드바를 통한 간편한 할 일 체크 및 관리
- **📝 다이어리**: 드래그 앤 드롭(Sortable) 기능을 포함한 깔끔한 일기 작성 및 편집
- **📍 내 위치 찾기**: GPS를 이용한 현재 위치 기반 장소 지정

## 🛠️ 기술 스택

- **Frontend**: `React`, `TypeScript`, `Vite`
- **State Management**: `Zustand`
- **Styling**: `Vanilla CSS`
- **Map API**: `Kakao Maps SDK`
- **Deployment**: `Vercel`

## 📦 설치 및 실행 방법

1. **저장소 클론**
   ```bash
   git clone https://github.com/your-username/Scheduler.git
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **환경 변수 설정**
   `.env` 파일을 생성하고 Kakao API 키를 입력하세요.
   ```env
   VITE_KAKAO_MAP_API_KEY=your_api_key_here
   ```

4. **로컬 서버 실행**
   ```bash
   npm run dev
   ```

## 📂 프로젝트 구조

- `src/components`: UI 컴포넌트 (Diary, Map, Sidebar 등)
- `src/store`: 상태 관리 로직
- `src/hooks`: 커스텀 훅
- `src/utils`: 날짜 및 데이터 처리 유틸리티

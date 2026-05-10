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
   git clone https://github.com/cacaru/Scheduler.git
   ```

2. **환경 변수 설정**
   `.env` 파일을 생성하고 Kakao API 키를 입력하세요.
   ```env
   VITE_KAKAO_MAP_API_KEY=your_kakao_javascript_api_key_here
   VITE_SUPABASE_URL=your_supabase_URL
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_api_key_here
   ```

## 📦 의존성 관리

이 프로젝트는 생산성과 최적화된 성능을 위해 다음과 같은 핵심 라이브러리들을 사용합니다.

- **핵심 프레임워크**: `React 19`, `Vite 8`, `TypeScript`
- **백엔드 & DB**: `Supabase` (인증 및 데이터 스토리지)
- **상태 관리**: `Zustand` (슬라이스 패턴 기반의 전역 상태 관리)
- **UI & 인터랙션**: 
  - `@dnd-kit`: 일기/할 일 목록의 드래그 앤 드롭 정렬 및 이동
  - `Lucide-React`: 일관된 디자인의 아이콘 시스템
  - `Vanilla CSS`: 컴포넌트 기반의 순수 CSS 스타일링
- **날짜 및 유틸리티**: `date-fns` (복잡한 날짜 연산 및 포맷팅)
- **지도 서비스**: `react-kakao-maps-sdk` (카카오 맵 API 연동)

## 📂 프로젝트 구조

```text
src/
├── components/          # UI 컴포넌트
│   ├── Auth/           # 인증 관련 (로그인/회원가입 모달)
│   ├── common/         # 공통 컴포넌트 (미니 캘린더 등)
│   ├── Diary/          # 다이어리 핵심 기능
│   │   ├── Calendar/   # 메인 캘린더 및 날짜 선택기
│   │   └── Modal/      # 다이어리 상세 및 기념일 관리 모달
│   ├── Map/            # 카카오 맵 연동 및 위치 기반 기능
│   └── Sidebar/        # 사이드바 메뉴 및 할 일(Todo) 목록
├── constants/           # 테마 색상 및 기념일 등 상수 관리
├── hooks/              # 비즈니스 로직 분리 및 상태 관리용 커스텀 훅
├── store/              # Zustand를 이용한 전역 상태 관리
│   └── slices/         # 기능별로 분할된 상태 슬라이스
├── utils/              # 날짜 처리, Supabase 클라이언트 등 유틸리티
├── styles/             # 전역 스타일 및 공통 CSS
└── main.tsx            # 엔트리 포인트
```

# 📅 나의 작은 스케쥴러 (Scheduler)

> **React 웹과 React Native 모바일을 단일 모노레포로 운영하는 위치 기반 일정·일기 관리 앱**
> 같은 데이터 모델 위에 두 플랫폼이 각자의 UX로 동작하며, 모바일은 오프라인 우선 동기화까지 지원합니다.

![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-SDK_54-000020?logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)
![NativeWind](https://img.shields.io/badge/NativeWind-4-38BDF8?logo=tailwindcss&logoColor=white)
![Kakao Maps](https://img.shields.io/badge/Kakao_Maps-FEE500?logo=kakaotalk&logoColor=black)

---

## 📑 목차
- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [아키텍처](#-아키텍처)
- [기술적 하이라이트](#-기술적-하이라이트)
- [기술 스택](#-기술-스택)
- [디렉토리 구조](#-디렉토리-구조)
- [설치 및 실행](#-설치-및-실행)

---

## 🎯 프로젝트 소개

캘린더 위에 **일기·할 일·기념일**을 한 곳에서 관리하고, 각 항목에 **위치 정보**를 첨부할 수 있는 개인용 스케쥴러입니다.
처음에는 React 웹 앱으로 시작했으며, 같은 코드베이스의 비즈니스 로직을 재사용해 **React Native 모바일 앱으로 확장**한 모노레포 프로젝트입니다.

**개인 프로젝트** — 풀스택/크로스 플랫폼 학습 목적.

### 한눈에 보기
| 항목 | 내용 |
|---|---|
| 플랫폼 | Web (Vercel) · Android APK (EAS Build) |
| 코드 공유 | Zustand 스토어, Supabase 클라이언트, 비즈니스 훅, 타입 — `packages/shared` |
| 데이터 | Supabase (PostgreSQL + Auth) — `entries` 단일 테이블 (type으로 3종 구분) + `profiles` |
| 모바일 오프라인 | SQLite 로컬 캐시 + oplog 쓰기 큐 + NetInfo 기반 자동 sync |
| 지도 | Kakao Maps — 웹은 SDK 직결, 모바일은 동일 웹을 WebView로 임베드 + 메시지 브릿지 |

---

## ✨ 주요 기능

| 기능 | 웹 | 모바일 |
|---|:---:|:---:|
| 월간 캘린더 + 다중 항목 마커 | ✅ | ✅ |
| 일기 / 할 일 / 기념일 CRUD | ✅ | ✅ |
| 기간형 할 일 (start_date ~ end_date) | ✅ | ✅ |
| 매년 반복 기념일 (MM-DD 자동 표시) | ✅ | ✅ |
| 항목에 위치 첨부 (검색·지도 탭·역지오코딩) | ✅ | ✅ |
| 카카오맵 위 항목 마커 보기 | ✅ | ✅ (WebView) |
| 마커 탭 → 항목 정보 카드 + 일자 이동 | ✅ | ✅ |
| 드래그앤드롭으로 일자 간 이동 | ✅ | ⏳ |
| 테마 색상 12종 + 다크모드 | ✅ | ✅ |
| 폰트 변경 (한글 웹폰트 4종) | ✅ | ⏳ |
| **오프라인 모드 (비행기 모드에서도 CRUD)** | — | ✅ |
| **재연결 시 자동 sync** | — | ✅ |

---

## 🏛️ 아키텍처

### 모노레포 구조
```
scheduler-monorepo/
├── apps/
│   ├── web/      # React 19 + Vite — 데스크톱 + 모바일 WebView 임베드 모드 겸용
│   └── mobile/   # React Native + Expo SDK 54
└── packages/
    └── shared/   # 플랫폼 비종속 비즈니스 로직 (Zustand, Supabase, 타입, 훅)
```

### 어댑터 패턴으로 플랫폼 비종속화
`packages/shared`는 어떤 플랫폼 API에도 직접 의존하지 않습니다. 진입점에서 각 앱이 자신의 구현을 주입합니다.

```
┌─────────────────┐        ┌──────────────────────┐
│  apps/web       │        │  apps/mobile         │
│  bootstrap.ts   │        │  bootstrap.ts        │
└────────┬────────┘        └──────────┬───────────┘
         │ inject                     │ inject
         ▼                            ▼
┌────────────────────────────────────────────────┐
│  packages/shared                               │
│  ─ StorageAdapter   (localStorage / AsyncStorage)│
│  ─ ThemeApplier     (CSS vars / NativeWind)    │
│  ─ EntryRepository  (Supabase / SQLite + sync) │
│  ─ Supabase Client  (createClient + auth)      │
└────────────────────────────────────────────────┘
```

추상화 항목:
- **`StorageAdapter`** — 동기 KV 인터페이스 (테마/폰트 영속화). 모바일은 부팅 시 AsyncStorage를 메모리로 hydrate
- **`ThemeApplier`** — 색·폰트·다크모드의 실제 적용. 웹은 `document.documentElement.style.setProperty`, 모바일은 후속 구현
- **`EntryRepository`** — CRUD 인터페이스. 웹은 `RemoteEntryRepository`(Supabase 직결), 모바일은 `SqliteEntryRepository`(로컬 우선)
- **Icon name 분리** — `shared`는 `IconName` 유니언만 export, 각 앱이 `lucide-react` / `lucide-react-native`로 자체 매핑

---

## 💡 기술적 하이라이트

### 1. 오프라인 우선 동기화 (모바일)

비행기 모드에서도 모든 CRUD가 정상 동작합니다.

```
[UI]  ──┐
        ▼
[SqliteEntryRepository] ── SQLite INSERT/UPDATE/DELETE ──→ 즉시 화면 반영
        │
        └─ oplog enqueue ──→ NetInfo 온라인 감지 ──→ Supabase로 push
                                       ▲
                                       └─ 재연결 시 자동 트리거
```

- **client-side UUID + UPSERT** 로 멱등성 보장 (재시도 안전)
- **oplog 순서 보존** — 첫 실패 시 중단하고 다음 시도에서 처음부터 재개
- **단순 LWW** 충돌 해결 — 1인 사용자 + 단일 디바이스 가정으로 합리화
- 로컬에만 두는 `updated_at` 컬럼은 원격 페이로드에서 자동 제거 (스키마 정합)

### 2. 카카오맵 WebView 임베드 (모바일)

네이티브 SDK 브리지를 직접 짜는 대신, **같은 웹 코드베이스를 임베드용 모드로 재사용**합니다.

| URL | 렌더 |
|---|---|
| `https://app/` | 일반 데스크톱/모바일 웹 (App) |
| `https://app/?embed=1` | 마커 보기 모드 (MapEmbed) — 인증/사이드바 없음 |
| `https://app/?embed=picker` | 위치 선택 모드 (MapPickerEmbed) — 검색 + 역지오코딩 |

RN ↔ Web 통신:
- **RN → Web**: `injectJavaScript`로 `window.handleRNMessage(json)` 호출 → `setMarkers`, `setCenter`, `setInitial` 등
- **Web → RN**: `window.ReactNativeWebView.postMessage()` → `ready`, `markerTap`, `locationPicked`

장점: Kakao SDK 키 일원화, 코드 중복 0, 웹과 동일한 검색/역지오코딩/내 위치 UX를 모바일에서도 그대로.

### 3. 캘린더 글로벌 Track Allocation (웹)

기간형 할 일이 일자별로 다른 row에 그려져 들썩이는 문제를 그리디 배치 알고리즘으로 해결.

```
변경 전:                       변경 후:
─────┬─────┬─────             ─────┬─────┬─────
[A]  │     │[A]               [A   ▶▶▶▶▶▶  A]   ← 같은 row 고정
     │[B]  │                  [   ][B][   ]
─────┴─────┴─────             ─────┴─────┴─────
```

각 항목을 `(start_date ↑, length ↓, id)` 순으로 정렬 후, **모든 점유 일자에서 비어 있는 가장 낮은 track**에 그리디 배치. 빈 track은 `visibility: hidden` placeholder로 자리만 차지해 일자 간 vertical 정렬 유지.

### 4. 슬라이스 기반 Zustand 스토어

`useDiaryStore`를 BaseSlice / MovementSlice / TodoSlice / OriSlice로 분할. 각 슬라이스는 `EntryRepository` 인터페이스 통해서만 외부와 통신해 테스트·교체 용이.

---

## 🛠️ 기술 스택

### 공통 (`packages/shared`)
- **언어** — TypeScript
- **상태 관리** — Zustand
- **백엔드** — Supabase
- **유틸** — date-fns

### 웹 (`apps/web`)
- **프레임워크** — React 19, Vite 8
- **스타일링** — CSS Modules
- **UI** — @dnd-kit, lucide-react
- **지도** — react-kakao-maps-sdk
- **배포** — Vercel

### 모바일 (`apps/mobile`)
- **프레임워크** — React Native 0.81, Expo SDK 54, expo-router
- **로컬 DB** — expo-sqlite, AsyncStorage
- **스타일링** — NativeWind
- **UI** — react-native-calendars, datetimepicker, lucide-react-native
- **동기화** — NetInfo + 자체 oplog 큐
- **지도** — react-native-webview, expo-location
- **빌드** — EAS Build (APK / AAB)

---

## 📂 디렉토리 구조

```text
scheduler-monorepo/
├── apps/
│   ├── web/
│   │   └── src/
│   │       ├── components/      # Diary / Map / Sidebar / Auth / common
│   │       ├── platform/        # 웹 어댑터 (storage, theme) + bootstrap
│   │       ├── icons/           # lucide-react 매핑
│   │       ├── hooks/           # 웹 전용 훅 (useSidebarResize)
│   │       └── main.tsx         # ?embed=picker / ?embed=1 / App 분기
│   │
│   └── mobile/
│       ├── app/                 # expo-router 라우트
│       │   ├── _layout.tsx      # 부트스트랩 + 인증 가드 + day 라우트
│       │   ├── (auth)/sign-in   # 로그인/회원가입
│       │   ├── (tabs)/          # 다이어리 / 지도 / 설정
│       │   └── day/[date].tsx   # 일자별 풀스크린
│       ├── components/          # EntryForm, EntrySections, LocationPickerModal
│       ├── platform/            # 모바일 어댑터 (AsyncStorage hydrate) + bootstrap
│       ├── icons/               # lucide-react-native 매핑
│       ├── repositories/        # SqliteEntryRepository
│       ├── sync/                # fullSync, oplog flush, NetInfo bridge
│       ├── db/                  # SQLite 스키마 + 마이그레이션 + row 매퍼
│       ├── app.config.ts        # Expo 설정 (env, plugins, EAS projectId)
│       └── eas.json             # EAS Build 프로파일 (preview=APK, production=AAB)
│
└── packages/
    └── shared/
        └── src/
            ├── adapters/        # StorageAdapter, ThemeApplier 인터페이스
            ├── repositories/    # EntryRepository, RemoteEntryRepository
            ├── store/           # Zustand 스토어 + 슬라이스
            ├── hooks/           # 캘린더/사이드바/폼 비즈니스 훅
            ├── utils/           # supabase 팩토리, dateUtils, uuid
            └── constants/       # IconName, PRESET_COLORS 등
```

---

## 📦 설치 및 실행

### 사전 요구사항
- Node.js 22+
- npm 11+ (workspaces 지원)
- (모바일) Expo 계정 + Android 폰의 Expo Go 앱
- (모바일 APK) Expo Application Services(EAS) 계정

### 클론 + 의존성 설치
```bash
git clone https://github.com/cacaru/Scheduler.git
cd Scheduler
npm install
```

### 환경 변수

**`apps/web/.env.local`**
```env
VITE_SUPABASE_URL=https://<your-supabase>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-public-key>
VITE_KAKAO_MAP_API_KEY=<kakao-javascript-app-key>
```

**`apps/mobile/.env`**
```env
EXPO_PUBLIC_SUPABASE_URL=https://<your-supabase>.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon-public-key>
EXPO_PUBLIC_KAKAO_MAP_EMBED_URL=https://<your-vercel>.vercel.app
```

> 모바일은 카카오맵을 직접 띄우지 않고 위의 Vercel URL을 WebView로 임베드합니다. 그러므로 카카오 API 키는 웹 빌드에만 들어가며, 카카오 개발자 콘솔에 Vercel 도메인을 등록해야 합니다.

### 개발 서버
```bash
# 웹 (http://localhost:5173)
npm run dev --workspace=web

# 모바일 (Expo Go에서 QR 스캔)
npm run start --workspace=mobile
```

---

## 🚀 빌드 및 배포

### 웹 → Vercel
```bash
npm run build --workspace=web
```
Vercel에 GitHub 연동 시 자동 배포. 빌드 디렉토리: `apps/web/dist`.

### 모바일 → Android APK
EAS 환경변수 등록 (1회):
```bash
cd apps/mobile
eas env:create --environment preview --name EXPO_PUBLIC_SUPABASE_URL --value "https://..."
eas env:create --environment preview --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value "..."
eas env:create --environment preview --name EXPO_PUBLIC_KAKAO_MAP_EMBED_URL --value "https://..."
```

빌드 실행:
```bash
eas build --platform android --profile preview     # APK (개인 설치/배포용)
eas build --platform android --profile production  # AAB (Play Store용, autoIncrement)
```

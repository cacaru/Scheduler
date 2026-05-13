import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import MapEmbed from './components/Map/MapEmbed'
import MapPickerEmbed from './components/Map/MapPickerEmbed'
import { bootstrapWebPlatform } from './platform/bootstrap'

// ?embed=picker  → 위치 선택 모드 (모바일 EntryForm용)
// ?embed=1 (기타 truthy) → 마커 보기 모드 (모바일 지도 탭용)
// 그 외       → 일반 데스크톱/모바일 웹 앱
const embedMode = new URLSearchParams(window.location.search).get('embed')

bootstrapWebPlatform()

function renderRoot() {
  if (embedMode === 'picker') return <MapPickerEmbed />
  if (embedMode) return <MapEmbed />
  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>{renderRoot()}</StrictMode>,
)

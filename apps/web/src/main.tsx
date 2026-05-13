import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import MapEmbed from './components/Map/MapEmbed'
import { bootstrapWebPlatform } from './platform/bootstrap'

// ?embed=1 쿼리는 모바일 WebView 전용 슬림 카카오맵 모드.
// 인증/사이드바 없이 MapEmbed만 렌더 (App 자체를 거치지 않음).
const isEmbed = new URLSearchParams(window.location.search).get('embed') === '1'

bootstrapWebPlatform()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isEmbed ? <MapEmbed /> : <App />}
  </StrictMode>,
)

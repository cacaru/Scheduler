/**
 * MapEmbed.tsx
 * 모바일(RN WebView)에서 임베드되어 사용되는 슬림 카카오맵 뷰.
 *
 * - 인증/사이드바/네비게이션 없음 — 100vh 풀블리드 지도만
 * - 마커 데이터는 RN이 주입 (window.handleRNMessage 통해)
 * - 마커 탭 / 빈 지도 탭 / 준비 완료를 RN으로 postMessage
 *
 * 메시지 프로토콜:
 *   RN → Web (injectJavaScript로 window.handleRNMessage 호출):
 *     { type: 'setMarkers', markers: [{ id, lat, lng, title, color, date }] }
 *     { type: 'setCenter', lat, lng }
 *   Web → RN (window.ReactNativeWebView.postMessage):
 *     { type: 'ready' }
 *     { type: 'markerTap', id, date }
 */
import { useEffect, useState, useRef } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';

interface EmbedMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  color?: string;
  date: string;
}

interface MarkerMessage {
  type: 'setMarkers';
  markers: EmbedMarker[];
}

interface CenterMessage {
  type: 'setCenter';
  lat: number;
  lng: number;
}

type IncomingMessage = MarkerMessage | CenterMessage;

declare global {
  interface Window {
    handleRNMessage?: (jsonString: string) => void;
    ReactNativeWebView?: { postMessage: (data: string) => void };
    kakao?: { maps: { load: (cb: () => void) => void } };
  }
}

function notifyRN(payload: object): void {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(payload));
  }
}

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 }; // 서울시청

const MapEmbed: React.FC = () => {
  const [markers, setMarkers] = useState<EmbedMarker[]>([]);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [sdkReady, setSdkReady] = useState(false);
  const readySent = useRef(false);

  // 카카오 SDK autoload=false 대응
  useEffect(() => {
    const tryLoad = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => setSdkReady(true));
        return true;
      }
      return false;
    };
    if (tryLoad()) return;
    // 스크립트가 늦게 로드될 경우 대비 폴링
    const t = setInterval(() => {
      if (tryLoad()) clearInterval(t);
    }, 100);
    return () => clearInterval(t);
  }, []);

  // RN → Web 메시지 핸들러 등록
  useEffect(() => {
    window.handleRNMessage = (jsonString: string) => {
      try {
        const data: IncomingMessage = JSON.parse(jsonString);
        if (data.type === 'setMarkers') {
          setMarkers(data.markers);
          // 첫 마커가 있으면 첫 진입 시 거기로 이동
          if (data.markers.length > 0) {
            setCenter((prev) =>
              prev.lat === DEFAULT_CENTER.lat && prev.lng === DEFAULT_CENTER.lng
                ? { lat: data.markers[0].lat, lng: data.markers[0].lng }
                : prev
            );
          }
        } else if (data.type === 'setCenter') {
          setCenter({ lat: data.lat, lng: data.lng });
        }
      } catch (err) {
        console.warn('[embed] failed to parse RN message', err);
      }
    };
    return () => {
      window.handleRNMessage = undefined;
    };
  }, []);

  // SDK 준비 완료 + RN 준비 신호 (1회만)
  useEffect(() => {
    if (sdkReady && !readySent.current) {
      readySent.current = true;
      notifyRN({ type: 'ready' });
    }
  }, [sdkReady]);

  if (!sdkReady) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <span style={{ color: '#888' }}>지도 로딩 중…</span>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Map center={center} style={{ width: '100%', height: '100%' }} level={5}>
        {markers.map((m) => (
          <MapMarker
            key={m.id}
            position={{ lat: m.lat, lng: m.lng }}
            onClick={() => notifyRN({ type: 'markerTap', id: m.id, date: m.date })}
          />
        ))}
      </Map>

      {markers.length === 0 && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255,255,255,0.92)',
            padding: '8px 14px',
            borderRadius: 16,
            fontSize: 13,
            color: '#666',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          위치 정보가 등록된 항목이 없습니다.
        </div>
      )}
    </div>
  );
};

export default MapEmbed;

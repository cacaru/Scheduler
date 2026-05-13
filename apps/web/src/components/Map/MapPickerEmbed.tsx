/**
 * MapPickerEmbed.tsx
 * 모바일 RN WebView에서 ?embed=picker로 띄워지는 위치 선택 화면.
 *
 * 기존 MapPicker.tsx를 임베드 환경에 맞게 단순화한 풀스크린 버전.
 * - 키워드 검색 (Kakao Places)
 * - 지도 탭 → 핀 + 역지오코딩
 * - 내 위치 → 좌표 + 역지오코딩
 * - "이 위치로 선택" → postMessage로 결과 전달
 *
 * 메시지 프로토콜:
 *   RN → Web: { type: 'setInitial', location: PickedLocation }
 *   Web → RN: { type: 'ready' } | { type: 'locationPicked', location: PickedLocation }
 */
import { useEffect, useRef, useState } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';

interface PickedLocation {
  lat: number;
  lng: number;
  address?: string;
  name?: string;
}

declare global {
  interface Window {
    handleRNMessage?: (jsonString: string) => void;
    ReactNativeWebView?: { postMessage: (data: string) => void };
  }
}

function notifyRN(payload: object): void {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(payload));
  }
}

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

const MapPickerEmbed: React.FC = () => {
  const [marker, setMarker] = useState<PickedLocation | undefined>(undefined);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [searchValue, setSearchValue] = useState('');
  const [sdkReady, setSdkReady] = useState(false);
  const readySent = useRef(false);

  // SDK autoload=false 대응
  useEffect(() => {
    const tryLoad = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => setSdkReady(true));
        return true;
      }
      return false;
    };
    if (tryLoad()) return;
    const t = setInterval(() => {
      if (tryLoad()) clearInterval(t);
    }, 100);
    return () => clearInterval(t);
  }, []);

  // RN의 setInitial 수신 (편집 모드일 때 기존 위치 미리 채우기)
  useEffect(() => {
    window.handleRNMessage = (jsonString: string) => {
      try {
        const data = JSON.parse(jsonString);
        if (data.type === 'setInitial' && data.location) {
          const loc = data.location as PickedLocation;
          setMarker(loc);
          setCenter({ lat: loc.lat, lng: loc.lng });
        }
      } catch (err) {
        console.warn('[picker] failed to parse RN message', err);
      }
    };
    return () => {
      window.handleRNMessage = undefined;
    };
  }, []);

  useEffect(() => {
    if (sdkReady && !readySent.current) {
      readySent.current = true;
      notifyRN({ type: 'ready' });
    }
  }, [sdkReady]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    const ps = new kakao.maps.services.Places();
    ps.keywordSearch(searchValue, (data, status) => {
      if (status === kakao.maps.services.Status.OK && data.length > 0) {
        const first = data[0];
        const newLoc: PickedLocation = {
          lat: parseFloat(first.y),
          lng: parseFloat(first.x),
          address: first.address_name,
          name: first.place_name,
        };
        setMarker(newLoc);
        setCenter({ lat: newLoc.lat, lng: newLoc.lng });
      } else {
        alert('검색 결과가 없습니다.');
      }
    });
  };

  const handleMapClick = (_t: kakao.maps.Map, mouseEvent: kakao.maps.event.MouseEvent) => {
    const latlng = mouseEvent.latLng;
    const newLoc: PickedLocation = { lat: latlng.getLat(), lng: latlng.getLng() };
    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result, status) => {
      if (status === kakao.maps.services.Status.OK && result.length > 0) {
        const addr = result[0].address;
        setMarker({
          ...newLoc,
          address: addr.address_name,
          name: addr.address_name,
        });
      } else {
        setMarker(newLoc);
      }
    });
  };

  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      alert('이 브라우저는 위치 기능을 지원하지 않습니다.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCenter({ lat, lng });
        const geocoder = new kakao.maps.services.Geocoder();
        geocoder.coord2Address(lng, lat, (result, status) => {
          if (status === kakao.maps.services.Status.OK && result.length > 0) {
            const addr = result[0].address;
            setMarker({ lat, lng, address: addr.address_name, name: addr.address_name });
          } else {
            setMarker({ lat, lng });
          }
        });
      },
      (err) => {
        console.warn('geolocation failed', err);
        alert('현재 위치를 가져올 수 없습니다.');
      }
    );
  };

  const handleConfirm = () => {
    if (!marker) {
      alert('지도를 탭하거나 검색해서 위치를 선택해 주세요.');
      return;
    }
    notifyRN({ type: 'locationPicked', location: marker });
  };

  const handleClear = () => {
    setMarker(undefined);
    setSearchValue('');
  };

  if (!sdkReady) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <span style={{ color: '#888' }}>지도 로딩 중…</span>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <form
        onSubmit={handleSearch}
        style={{ padding: 12, borderBottom: '1px solid #eee', display: 'flex', gap: 8, background: 'white' }}
      >
        <input
          type="text"
          placeholder="장소 검색..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #ddd',
            fontSize: 14,
            outline: 'none',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: '#ac9ec4',
            color: 'white',
            border: 'none',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          검색
        </button>
      </form>

      <div style={{ flex: 1, position: 'relative' }}>
        <Map center={center} style={{ width: '100%', height: '100%' }} level={3} onClick={handleMapClick}>
          {marker && <MapMarker position={{ lat: marker.lat, lng: marker.lng }} />}
        </Map>
        <button
          onClick={handleMyLocation}
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '50%',
            width: 44,
            height: 44,
            fontSize: 20,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
          title="내 위치"
        >
          📍
        </button>
      </div>

      <div style={{ padding: 12, borderTop: '1px solid #eee', background: 'white' }}>
        {marker ? (
          <div style={{ marginBottom: 10, fontSize: 13, color: '#444', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>📍</span>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {marker.name || marker.address || `${marker.lat.toFixed(4)}, ${marker.lng.toFixed(4)}`}
            </span>
            <button
              onClick={handleClear}
              style={{ border: 'none', background: 'none', color: '#e53e3e', fontSize: 12, cursor: 'pointer' }}
            >
              삭제
            </button>
          </div>
        ) : (
          <div style={{ marginBottom: 10, fontSize: 13, color: '#888' }}>
            지도를 탭하거나 검색해서 위치를 선택하세요.
          </div>
        )}
        <button
          onClick={handleConfirm}
          disabled={!marker}
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 8,
            background: marker ? '#ac9ec4' : '#ddd',
            color: 'white',
            border: 'none',
            fontSize: 15,
            fontWeight: 600,
            cursor: marker ? 'pointer' : 'not-allowed',
          }}
        >
          이 위치로 선택
        </button>
      </div>
    </div>
  );
};

export default MapPickerEmbed;

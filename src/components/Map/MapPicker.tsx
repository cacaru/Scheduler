import React, { useState } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import { MapPin, Search } from 'lucide-react';
import MyLocationButton from './MyLocationButton';

/**
 * MapPicker.tsx
 * 일기나 할 일을 등록할 때 장소 정보를 선택하기 위한 지도 컴포넌트입니다.
 * 키워드 검색, 지도 클릭을 통한 위치 선택, 현재 위치 자동 주소 변환 기능을 제공합니다.
 */

interface Location {
  lat: number;
  lng: number;
  address?: string;
  name?: string;
}

interface MapPickerProps {
  onLocationSelect: (location: Location | undefined) => void;
  initialLocation?: Location;
}

const mapContainerStyle = {
  width: '100%',
  height: '250px',
  borderRadius: '8px',
  marginTop: '10px'
};

const defaultCenter = {
  lat: 37.5665,
  lng: 126.9780
};

const MapPicker: React.FC<MapPickerProps> = ({ onLocationSelect, initialLocation }) => {
  const [marker, setMarker] = useState<Location | undefined>(initialLocation);
  const [searchValue, setSearchValue] = useState('');
  const [center, setCenter] = useState(initialLocation ? { lat: initialLocation.lat, lng: initialLocation.lng } : defaultCenter);
  const [isSdkLoaded, setIsSdkLoaded] = useState(!!window.kakao && !!window.kakao.maps);

  React.useEffect(() => {
    const initMap = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          setIsSdkLoaded(true);
        });
      }
    };

    if (!window.kakao || !window.kakao.maps) {
      const checkInterval = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          initMap();
          clearInterval(checkInterval);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    } else {
      initMap();
    }
  }, []);

  if (!isSdkLoaded) {
    return <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f7fafc', borderRadius: '8px' }}>지도 데이터를 불러오는 중...</div>;
  }

  // 검색 기능
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;

    const ps = new kakao.maps.services.Places();
    ps.keywordSearch(searchValue, (data, status) => {
      if (status === kakao.maps.services.Status.OK) {
        const firstPlace = data[0];
        const newLoc = {
          lat: parseFloat(firstPlace.y),
          lng: parseFloat(firstPlace.x),
          address: firstPlace.address_name,
          name: firstPlace.place_name
        };
        setMarker(newLoc);
        setCenter({ lat: newLoc.lat, lng: newLoc.lng });
        onLocationSelect(newLoc);
      } else {
        alert('검색 결과가 없습니다.');
      }
    });
  };

  const handleMapClick = (_t: kakao.maps.Map, mouseEvent: kakao.maps.event.MouseEvent) => {
    const latlng = mouseEvent.latLng;
    const newLoc = {
      lat: latlng.getLat(),
      lng: latlng.getLng()
    };
    
    // 주소 변환 (역지오코딩)
    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result, status) => {
      if (status === kakao.maps.services.Status.OK) {
        const addr = result[0].address;
        const locationWithAddr = {
          ...newLoc,
          address: addr.address_name,
          name: addr.address_name // 이름이 따로 없으므로 주소를 이름으로 사용
        };
        setMarker(locationWithAddr);
        onLocationSelect(locationWithAddr);
      } else {
        setMarker(newLoc);
        onLocationSelect(newLoc);
      }
    });
  };

  const onMyLocationFound = (lat: number, lng: number) => {
    const newCenter = { lat, lng };
    setCenter(newCenter);
    
    // 주소 변환 (역지오코딩)
    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.coord2Address(lng, lat, (result, status) => {
      if (status === kakao.maps.services.Status.OK) {
        const addr = result[0].address;
        const locationWithAddr = {
          ...newCenter,
          address: addr.address_name,
          name: addr.address_name
        };
        setMarker(locationWithAddr);
        onLocationSelect(locationWithAddr);
      } else {
        setMarker(newCenter);
        onLocationSelect(newCenter);
      }
    });
  };

  return (
    <div className="map-picker-container">
      <div className="search-box-wrapper" style={{ position: 'relative', marginBottom: '10px' }}>
        <form onSubmit={handleSearch} style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#718096' }} />
          <input
            type="text"
            placeholder="장소 검색..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="map-search-input"
            style={{
              width: '100%',
              padding: '10px 10px 10px 35px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '0.9rem'
            }}
          />
          <button type="submit" style={{ display: 'none' }}>검색</button>
        </form>
      </div>
      
      <div style={{ position: 'relative' }}>
        <Map
          center={center}
          style={mapContainerStyle}
          level={3}
          onClick={handleMapClick}
        >
          {marker && <MapMarker position={{ lat: marker.lat, lng: marker.lng }} />}
        </Map>
        
        <MyLocationButton 
          onLocationFound={onMyLocationFound}
          size={18}
          style={{ bottom: '10px', right: '10px' }}
        />
      </div>
      
      {marker && (
        <div className="selected-location-info" style={{ marginTop: '8px', fontSize: '0.8rem', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={14} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {marker.name || marker.address || `${marker.lat.toFixed(4)}, ${marker.lng.toFixed(4)}`}
          </span>
          <button 
            onClick={() => {
              setMarker(undefined);
              onLocationSelect(undefined);
              setSearchValue('');
            }}
            style={{ marginLeft: 'auto', border: 'none', background: 'none', color: '#e53e3e', cursor: 'pointer', fontSize: '0.75rem', flexShrink: 0 }}
          >
            삭제
          </button>
        </div>
      )}
    </div>
  );
};

export default MapPicker;

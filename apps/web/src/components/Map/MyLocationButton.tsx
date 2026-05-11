/**
 * MyLocationButton.tsx
 * 브라우저 Geolocation API를 사용하여 사용자의 현재 위도, 경도 좌표를 가져오고
 * 지도를 해당 위치로 이동시키는 공통 버튼 컴포넌트입니다.
 */
import React from 'react';
import { Navigation } from 'lucide-react';

interface MyLocationButtonProps {
  onLocationFound: (lat: number, lng: number) => void;
  style?: React.CSSProperties;
  size?: number;
  title?: string;
}

const MyLocationButton: React.FC<MyLocationButtonProps> = ({ 
  onLocationFound, 
  style, 
  size = 24,
  title = "내 위치로 이동"
}) => {
  const handleGoToMyLocation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onLocationFound(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Error getting geolocation:", error);
          let message = "위치 정보를 가져올 수 없습니다.";
          if (error.code === error.PERMISSION_DENIED) {
            message = "위치 정보 접근 권한이 거부되었습니다. 브라우저 설정을 확인해주세요.";
          }
          alert(message);
        }
      );
    } else {
      alert("이 브라우저에서는 위치 정보를 지원하지 않습니다.");
    }
  };

  const defaultStyle: React.CSSProperties = {
    position: 'absolute',
    zIndex: 10,
    background: 'white',
    border: 'none',
    borderRadius: '50%',
    width: size === 24 ? '50px' : '36px',
    height: size === 24 ? '50px' : '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    cursor: 'pointer',
    color: 'var(--accent)',
    ...style
  };

  return (
    <button 
      onClick={handleGoToMyLocation}
      type="button"
      style={defaultStyle}
      title={title}
    >
      <Navigation size={size} fill="currentColor" />
    </button>
  );
};

export default MyLocationButton;

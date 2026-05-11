import React, { useMemo, useState, useCallback } from 'react';
import { Map, MapMarker, CustomOverlayMap } from 'react-kakao-maps-sdk';
import { useDiaryStore, type EntryItem } from '@project/shared/src/store/diaryStore';
import { MapPin, Calendar, CheckCircle, Circle } from 'lucide-react';
import { formatDateWithDay } from '@project/shared/src/utils/dateUtils';
import MyLocationButton from './MyLocationButton';
import { type ViewType } from '../../App';
import { useUIStore } from '@project/shared/src/store/uiStore';

/**
 * MainMapView.tsx
 * 등록된 모든 일기 및 할 일의 위치 정보를 지도 위에 마커로 표시합니다.
 * 내 위치 찾기 기능을 포함하며, 마커 클릭 시 해당 항목의 요약 정보를 툴팁으로 보여줍니다.
 */

interface MainMapProps {
  onViewChange: (view: ViewType) => void;
}

const MainMapView: React.FC<MainMapProps> = ({ 
  onViewChange
}) => {
  const entries = useDiaryStore((state) => state.oriItem);
  const [selectedItem, setSelectedItem] = useState<{item: EntryItem, date: string} | null>(null);

  const navigateAndOpenModal = useUIStore(state => state.navigateAndOpenModal);

  const handleNavigateFromMap = useCallback((date: string, id: string, isEdit: boolean) => {
      onViewChange('diary');
      navigateAndOpenModal(date, id, isEdit);
      setSelectedItem(null);
    }, [navigateAndOpenModal]);

  // 위치 정보가 있는 모든 항목 추출
  const itemsWithLocation = useMemo(() => {
    const items: { date: string; item: EntryItem }[] = [];
    Object.entries(entries).forEach(([date, dayItems]) => {
      dayItems.forEach((item) => {
        if (item.location) {
          items.push({ date, item });
        }
      });
    });
    return items;
  }, [entries]);

  // 지도 중심점 상태
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: 37.5156, lng: 126.8149 });

  // 초기 중심점 설정
  React.useEffect(() => {
    if (itemsWithLocation.length > 0) {
      setCenter({ 
        lat: itemsWithLocation[0].item.location!.lat, 
        lng: itemsWithLocation[0].item.location!.lng 
      });
    }
  }, [itemsWithLocation.length === 0]); // 항목이 없을 때만 초기값 유지, 있을 때 처음에만 설정

  return (
    <div className="main-map-view" style={{ position: 'relative', width: '100%', height: 'calc(100vh - 200px)', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
      <Map center={center} style={{ width: '100%', height: '100%' }} level={7}>
        {itemsWithLocation.map(({ date, item }) => (
          <React.Fragment key={item.id}>
            <MapMarker
              position={{ lat: item.location!.lat, lng: item.location!.lng }}
              onClick={() => setSelectedItem({ item, date })}
              image={{
                src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
                size: { width: 24, height: 35 }
              }}
            />
            {selectedItem?.item.id === item.id && (
              <CustomOverlayMap position={{ lat: item.location!.lat, lng: item.location!.lng }} yAnchor={1.2}>
                <div className="map-tooltip" style={{ 
                  cursor: 'pointer',
                  background: 'white', 
                  padding: '12px', 
                  borderRadius: '12px', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  minWidth: '180px',
                  border: `2px solid ${item.color || 'var(--accent)'}`
                  }}
                  onClick={() => handleNavigateFromMap(date, item.id, false)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)' }}>{formatDateWithDay(date)}</span>
                    <button onClick={() => setSelectedItem(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><Calendar size={16} /></button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {item.completed ? <CheckCircle size={16} color="#38a169" /> : <Circle size={14} color="#cbd5e0" />}
                    <span style={{ fontWeight: 600, fontSize: '1rem' }}>{item.title}</span>
                  </div>
                  <div style={{ fontSize: '1rem', color: '#666', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={10} />
                    {item.location!.name}
                  </div>
                </div>
              </CustomOverlayMap>
            )}
          </React.Fragment>
        ))}
      </Map>
      
      <MyLocationButton 
        onLocationFound={(lat, lng) => setCenter({ lat, lng })}
        style={{ bottom: '20px', right: '20px' }}
      />

      {itemsWithLocation.length === 0 && (
        <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.9)', padding: '10px 20px', borderRadius: '20px', zIndex: 10, fontSize: '0.9rem', fontWeight: 600 }}>
          위치 정보가 등록된 할 일이 없습니다.
        </div>
      )}
    </div>
  );
};

export default MainMapView;

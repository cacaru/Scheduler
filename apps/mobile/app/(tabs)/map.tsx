import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';

import { useDiaryStore, type EntryType } from '@project/shared/src/store/diaryStore';
import { formatDateWithDay } from '@project/shared/src/utils/dateUtils';
import { getAnniversaryIcon } from '../../icons/anniversary';

interface EmbedMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  color?: string;
  date: string;
  entryType: EntryType;
  content?: string;
  completed?: boolean;
  locationName?: string;
}

interface MarkerTapPayload {
  type: 'markerTap';
  id: string;
  date: string;
  title: string;
  color?: string;
  entryType?: EntryType;
  icon?: string;
  content?: string;
  completed?: boolean;
  locationName?: string;
}

type IncomingFromWeb = { type: 'ready' } | MarkerTapPayload;

const TYPE_ICON: Record<EntryType, keyof typeof Ionicons.glyphMap> = {
  diary: 'create',
  todo: 'checkbox',
  anniversary: 'gift',
};

const TYPE_LABEL: Record<EntryType, string> = {
  diary: '일기',
  todo: '할 일',
  anniversary: '기념일',
};

/** RN → Web. Web 측에서 window.handleRNMessage(jsonString)을 노출해 둠. */
function sendToWeb(ref: React.RefObject<WebView | null>, payload: object): void {
  if (!ref.current) return;
  const json = JSON.stringify(payload);
  const js = `if (window.handleRNMessage) { window.handleRNMessage(${JSON.stringify(json)}); } true;`;
  ref.current.injectJavaScript(js);
}

export default function MapScreen() {
  const router = useRouter();
  const webRef = useRef<WebView>(null);
  const entries = useDiaryStore((s) => s.entries);
  const [webReady, setWebReady] = useState(false);
  const [selected, setSelected] = useState<MarkerTapPayload | null>(null);

  const rawEmbedUrl = Constants.expoConfig?.extra?.kakaoMapEmbedUrl as string | undefined;
  const embedUrl = useMemo(() => {
    if (!rawEmbedUrl) return undefined;
    try {
      const u = new URL(rawEmbedUrl);
      u.searchParams.set('embed', '1');
      return u.toString();
    } catch {
      return rawEmbedUrl;
    }
  }, [rawEmbedUrl]);

  // location이 있는 항목 → 마커
  const markers = useMemo<EmbedMarker[]>(() => {
    const seen = new Set<string>();
    const result: EmbedMarker[] = [];
    for (const [date, items] of Object.entries(entries)) {
      for (const item of items) {
        if (!item.location || seen.has(item.id)) continue;
        seen.add(item.id);
        result.push({
          id: item.id,
          lat: item.location.lat,
          lng: item.location.lng,
          title: item.title,
          color: item.color,
          date,
          entryType: item.type,
          content: item.content,
          completed: item.completed,
          locationName: item.location.name,
        });
      }
    }
    return result;
  }, [entries]);

  useEffect(() => {
    if (webReady) sendToWeb(webRef, { type: 'setMarkers', markers });
  }, [webReady, markers]);

  useEffect(() => {
    if (!webReady) return;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        sendToWeb(webRef, {
          type: 'setCenter',
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
        });
      } catch (err) {
        console.warn('[map] location fetch failed:', err);
      }
    })();
  }, [webReady]);

  const handleMessage = useCallback((e: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(e.nativeEvent.data) as IncomingFromWeb;
      if (data.type === 'ready') {
        setWebReady(true);
      } else if (data.type === 'markerTap') {
        setSelected(data);
      }
    } catch (err) {
      console.warn('[map] webview message parse failed:', err);
    }
  }, []);

  const goToDay = () => {
    if (!selected) return;
    const date = selected.date;
    setSelected(null);
    router.push(`/day/${date}` as never);
  };

  if (!embedUrl) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-lg font-semibold mb-3 text-center">지도 임베드 URL이 설정되지 않음</Text>
          <Text className="text-sm text-gray-600 text-center leading-relaxed">
            apps/mobile/.env에 다음을 추가하고 Metro를 재시작하세요:{'\n\n'}
            <Text className="text-gray-800">EXPO_PUBLIC_KAKAO_MAP_EMBED_URL=</Text>
            <Text className="text-gray-800">https://&lt;your-vercel-domain&gt;/?embed=1</Text>
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <Text className="text-lg font-semibold">지도</Text>
        <Text className="text-xs text-gray-400">마커 {markers.length}</Text>
      </View>

      <WebView
        ref={webRef}
        source={{ uri: embedUrl }}
        onMessage={handleMessage}
        style={{ flex: 1 }}
        startInLoadingState
        renderLoading={() => (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        )}
        domStorageEnabled
        javaScriptEnabled
        setSupportMultipleWindows={false}
      />

      {!webReady && (
        <Pressable
          onPress={() => webRef.current?.reload()}
          className="absolute bottom-6 right-6 bg-gray-200 rounded-full px-4 py-2 active:opacity-70"
        >
          <Text className="text-sm">재시도</Text>
        </Pressable>
      )}

      <MarkerCardModal
        marker={selected}
        onClose={() => setSelected(null)}
        onGoToDay={goToDay}
      />
    </SafeAreaView>
  );
}

interface MarkerCardModalProps {
  marker: MarkerTapPayload | null;
  onClose: () => void;
  onGoToDay: () => void;
}

function MarkerCardModal({ marker, onClose, onGoToDay }: MarkerCardModalProps) {
  const visible = !!marker;
  const type = marker?.entryType ?? 'diary';
  const color = marker?.color || '#ac9ec4';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* 배경: 탭하면 닫힘 */}
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
        onPress={onClose}
      >
        {/* 카드 본체: 탭이 배경으로 전파되지 않게 자체 Pressable로 흡수 */}
        <Pressable
          onPress={() => {}}
          className="mx-4 mb-8 bg-white rounded-2xl p-5 shadow-lg"
          style={{
            borderLeftWidth: 4,
            borderLeftColor: color,
          }}
        >
          {/* 헤더: 타입 아이콘 + 날짜 + 닫기 */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Ionicons name={TYPE_ICON[type]} size={16} color="#888" />
              <Text className="ml-2 text-xs text-gray-500">{TYPE_LABEL[type]}</Text>
              <Text className="ml-3 text-xs text-gray-500">
                {marker?.date ? formatDateWithDay(marker.date) : ''}
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8} className="active:opacity-50">
              <Ionicons name="close" size={20} color="#888" />
            </Pressable>
          </View>

          {/* 제목 (todo 완료 시 strikethrough) */}
          <View className="flex-row items-center mb-2">
            {type === 'todo' && (
              <Ionicons
                name={marker?.completed ? 'checkmark-circle' : 'ellipse-outline'}
                size={18}
                color={marker?.completed ? '#22c55e' : '#bbb'}
                style={{ marginRight: 6 }}
              />
            )}
            {type === 'anniversary' && marker?.icon ? (() => {
                const AnniIcon = getAnniversaryIcon(marker.icon);
                return <AnniIcon size={16} color={marker.color || '#888'} />;
              })() : (
                <Ionicons name={TYPE_ICON[type]} size={16} color="#888" />
            )}
            <Text
              className="text-lg font-semibold flex-1"
              style={{
                textDecorationLine: marker?.completed ? 'line-through' : 'none',
                color: marker?.completed ? '#888' : '#222',
              }}
            >
              {marker?.title}
            </Text>
          </View>

          {/* 본문 (있을 때만, 최대 2줄) */}
          {marker?.content ? (
            <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
              {marker.content}
            </Text>
          ) : null}

          {/* 위치명 */}
          {marker?.locationName ? (
            <View className="flex-row items-center mb-4">
              <Ionicons name="location" size={14} color="#888" />
              <Text className="ml-1 text-xs text-gray-500" numberOfLines={1}>
                {marker.locationName}
              </Text>
            </View>
          ) : null}

          {/* 이동 버튼 */}
          <Pressable
            onPress={onGoToDay}
            className="rounded-lg py-3 items-center active:opacity-70"
            style={{ backgroundColor: color }}
          >
            <Text className="text-white font-semibold text-sm">이 날짜로 이동</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';

import { useDiaryStore } from '@project/shared/src/store/diaryStore';

interface EmbedMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  color?: string;
  date: string;
}

type IncomingFromWeb = { type: 'ready' } | { type: 'markerTap'; id: string; date: string };

/** RN → Web. Web 측에서 window.handleRNMessage(jsonString)을 노출해 둠. */
function sendToWeb(ref: React.RefObject<WebView | null>, payload: object): void {
  if (!ref.current) return;
  const json = JSON.stringify(payload);
  // injectJavaScript는 string concat이라 escape 처리 필요 → JSON.stringify를 한 번 더
  const js = `if (window.handleRNMessage) { window.handleRNMessage(${JSON.stringify(json)}); } true;`;
  ref.current.injectJavaScript(js);
}

export default function MapScreen() {
  const router = useRouter();
  const webRef = useRef<WebView>(null);
  const entries = useDiaryStore((s) => s.entries);
  const [webReady, setWebReady] = useState(false);

  const embedUrl = Constants.expoConfig?.extra?.kakaoMapEmbedUrl as string | undefined;

  // entries에서 location 있는 항목만 마커로 변환 (반복 펼침된 동일 id 중복 제거)
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
        });
      }
    }
    return result;
  }, [entries]);

  // 웹이 ready 알리거나 markers가 갱신되면 다시 push
  useEffect(() => {
    if (webReady) {
      sendToWeb(webRef, { type: 'setMarkers', markers });
    }
  }, [webReady, markers]);

  // 첫 진입 시 사용자 위치를 받아 setCenter (실패해도 무해 — 웹은 마커 첫 지점/서울로 폴백)
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

  const handleMessage = useCallback(
    (e: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(e.nativeEvent.data) as IncomingFromWeb;
        if (data.type === 'ready') {
          setWebReady(true);
        } else if (data.type === 'markerTap') {
          router.push(`/day/${data.date}` as never);
        }
      } catch (err) {
        console.warn('[map] webview message parse failed:', err);
      }
    },
    [router]
  );

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
        // iOS는 기본 활성화, Android는 명시 필요
        domStorageEnabled
        javaScriptEnabled
        // 웹 콘텐츠 안의 외부 링크는 새 창 대신 그냥 무시 (지도만 띄움)
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
    </SafeAreaView>
  );
}

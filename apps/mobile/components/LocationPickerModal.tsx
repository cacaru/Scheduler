/**
 * LocationPickerModal — 위치 선택 모달.
 * Vercel 호스팅 ?embed=picker 페이지를 WebView로 띄우고, 결과를 onSelect로 콜백.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import type { EntryItem } from '@project/shared/src/store/diaryStore';

type PickedLocation = NonNullable<EntryItem['location']>;

interface Props {
  visible: boolean;
  initial?: EntryItem['location'];
  onSelect: (loc: PickedLocation) => void;
  onClose: () => void;
}

function buildPickerUrl(rawUrl: string): string {
  try {
    const u = new URL(rawUrl);
    u.searchParams.set('embed', 'picker');
    return u.toString();
  } catch {
    return rawUrl;
  }
}

function sendToWeb(ref: React.RefObject<WebView | null>, payload: object): void {
  if (!ref.current) return;
  const json = JSON.stringify(payload);
  const js = `if (window.handleRNMessage) { window.handleRNMessage(${JSON.stringify(json)}); } true;`;
  ref.current.injectJavaScript(js);
}

export default function LocationPickerModal({ visible, initial, onSelect, onClose }: Props) {
  const webRef = useRef<WebView>(null);
  const [webReady, setWebReady] = useState(false);

  const rawUrl = Constants.expoConfig?.extra?.kakaoMapEmbedUrl as string | undefined;
  const url = useMemo(() => (rawUrl ? buildPickerUrl(rawUrl) : undefined), [rawUrl]);

  // 닫힐 때 ready 플래그 리셋 (다음 오픈 시 새 ready 신호 대기)
  useEffect(() => {
    if (!visible) setWebReady(false);
  }, [visible]);

  // 웹이 ready되고 initial이 있으면 픽커 사전 채움
  useEffect(() => {
    if (visible && webReady && initial) {
      sendToWeb(webRef, { type: 'setInitial', location: initial });
    }
  }, [visible, webReady, initial]);

  const handleMessage = useCallback(
    (e: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(e.nativeEvent.data);
        if (data.type === 'ready') {
          setWebReady(true);
        } else if (data.type === 'locationPicked' && data.location) {
          onSelect(data.location as PickedLocation);
          onClose();
        }
      } catch (err) {
        console.warn('[picker] webview message parse failed:', err);
      }
    },
    [onSelect, onClose]
  );

  if (!url) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
          <Header title="위치 선택" onClose={onClose} />
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-sm text-gray-600 text-center">
              EXPO_PUBLIC_KAKAO_MAP_EMBED_URL을 .env에 설정해 주세요.
            </Text>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <Header title="위치 선택" onClose={onClose} />
        <WebView
          ref={webRef}
          source={{ uri: url }}
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
          // 위치 권한 (Android) — WebView 안의 navigator.geolocation 사용
          geolocationEnabled
        />
      </SafeAreaView>
    </Modal>
  );
}

function Header({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
      <Pressable onPress={onClose} hitSlop={8} className="active:opacity-50">
        <Ionicons name="close" size={24} color="#444" />
      </Pressable>
      <Text className="ml-3 text-base font-semibold">{title}</Text>
    </View>
  );
}

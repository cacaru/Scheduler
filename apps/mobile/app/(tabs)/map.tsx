import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MapScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">
        <Text className="text-xl font-semibold mb-2">지도</Text>
        <Text className="text-gray-500">Phase 5에서 카카오맵 WebView가 임베드됩니다.</Text>
      </View>
    </SafeAreaView>
  );
}

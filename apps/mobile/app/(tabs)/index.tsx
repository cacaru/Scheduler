import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DiaryScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">
        <Text className="text-xl font-semibold mb-2">다이어리</Text>
        <Text className="text-gray-500">Phase 3에서 캘린더와 일자별 작성 화면이 들어옵니다.</Text>
      </View>
    </SafeAreaView>
  );
}

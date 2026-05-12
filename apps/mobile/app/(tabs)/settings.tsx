import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@project/shared/src/store/authStore';

export default function SettingsScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-start justify-start px-6 pt-6">
        <Text className="text-xl font-semibold mb-4">설정</Text>
        <Text className="text-gray-700 mb-1">로그인됨:</Text>
        <Text className="text-gray-500 mb-6">{user?.email ?? '(unknown)'}</Text>

        <Pressable
          onPress={signOut}
          className="bg-red-500 rounded-lg px-4 py-3 active:opacity-70"
        >
          <Text className="text-white font-semibold">로그아웃</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

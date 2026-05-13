import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@project/shared/src/store/authStore';
import { useUIStore } from '@project/shared/src/store/uiStore';
import { useSidebarUI } from '@project/shared/src/hooks/useSidebarUI';
import { THEME_COLORS } from '@project/shared/src/constants/colors';

export default function SettingsScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const theme = useUIStore((s) => s.theme);
  const themePrimary = useUIStore((s) => s.theme_primary);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

  // 색상 변경은 useSidebarUI를 거쳐 로컬 스토어 + Supabase profiles 둘 다 갱신
  // (오프라인일 때 supabase 실패는 silent — 로컬은 항상 반영됨)
  const { actions: { changeTheme } } = useSidebarUI();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-6 pt-4 pb-2">
          <Text className="text-xl font-semibold">설정</Text>
        </View>

        <Section title="계정">
          <Row label="로그인됨" value={user?.email ?? '(unknown)'} />
        </Section>

        <Section title="테마">
          <View className="px-4 py-3 flex-row items-center justify-between">
            <Text className="text-sm text-gray-700">다크 모드</Text>
            <Switch value={theme === 'dark'} onValueChange={toggleTheme} />
          </View>

          <Text className="px-4 pt-2 pb-1 text-xs text-gray-500">색상 (현재: {currentColorName(themePrimary)})</Text>
          <View className="px-4 pt-1 pb-3 flex-row flex-wrap" style={{ gap: 10 }}>
            {THEME_COLORS.map(({ name, primary, light, heavy }) => {
              const selected = themePrimary === primary;
              return (
                <Pressable
                  key={name}
                  onPress={() => changeTheme(primary, light, heavy)}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: primary,
                    borderWidth: selected ? 3 : 1,
                    borderColor: selected ? '#222' : '#ddd',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {selected && (
                    <View
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        backgroundColor: heavy,
                      }}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section title="기타">
          <Pressable
            onPress={signOut}
            className="mx-4 my-3 bg-red-500 rounded-lg py-3 items-center active:opacity-70"
          >
            <Text className="text-white font-semibold">로그아웃</Text>
          </Pressable>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function currentColorName(primary: string): string {
  const found = THEME_COLORS.find((c) => c.primary === primary);
  return found?.name || '커스텀';
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mt-4">
      <Text className="px-6 pb-2 text-xs text-gray-500 uppercase tracking-wide">{title}</Text>
      <View className="bg-gray-50 mx-3 rounded-xl py-1">{children}</View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="px-4 py-3 flex-row items-center justify-between">
      <Text className="text-sm text-gray-700">{label}</Text>
      <Text className="text-sm text-gray-500">{value}</Text>
    </View>
  );
}

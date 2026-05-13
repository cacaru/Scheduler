import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUIStore } from '@project/shared/src/store/uiStore';

export default function TabLayout() {
  const heavyColor = useUIStore((s) => s.theme_heavy);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: heavyColor || '#ac9ec4',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '다이어리',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: '지도',
          tabBarIcon: ({ color, size }) => <Ionicons name="map" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

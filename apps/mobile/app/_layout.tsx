import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

import { supabase } from '@project/shared/src/utils/supabase';
import { useAuthStore } from '@project/shared/src/store/authStore';
import { bootstrapMobilePlatform } from '../platform/bootstrap';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    bootstrapMobilePlatform()
      .then(async () => {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);

        const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
          setSession(sess);
        });
        unsub = () => sub.subscription.unsubscribe();

        setReady(true);
      })
      .catch((err) => {
        console.error('[bootstrap] failed:', err);
        setReady(true); // 에러 화면을 보여주기 위해 일단 진입
      });

    return () => unsub?.();
  }, [setSession]);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <RootStackWithAuthGate />;
}

function RootStackWithAuthGate() {
  const session = useAuthStore((s) => s.session);
  const isLoading = useAuthStore((s) => s.isLoading);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!session && !inAuthGroup) {
      router.replace('/sign-in');
    } else if (session && inAuthGroup) {
      router.replace('/');
    }
  }, [session, segments, isLoading, router]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

import type { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * 동적 Expo 설정.
 * - 환경변수는 .env 또는 EAS 시크릿에서 주입.
 * - 아이콘 경로는 ./assets/images/* 안의 단일 파일을 교체하면 즉시 반영됨
 *   (어댑티브 아이콘 분리본은 추후 추가).
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: '나의 작은 스케쥴러',
  slug: 'scheduler-mobile',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'scheduler',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.cacaru.schedulerM',
  },
  android: {
    package: 'com.cacaru.schedulerM',
    adaptiveIcon: {
      backgroundColor: '#E2D5F9',
      foregroundImage: './assets/images/android-icon-foreground.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: { backgroundColor: '#000000' },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    kakaoMapEmbedUrl: process.env.EXPO_PUBLIC_KAKAO_MAP_EMBED_URL,
  },
});

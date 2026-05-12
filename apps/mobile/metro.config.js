// Expo + Metro: monorepo + NativeWind 설정.
// https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 워크스페이스 루트까지 감시 대상에 추가 (Expo 기본값을 보존하면서).
config.watchFolders = [...(config.watchFolders ?? []), workspaceRoot];

// 모듈 해석 경로: 프로젝트 → 워크스페이스 루트 순.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = withNativeWind(config, { input: './global.css' });

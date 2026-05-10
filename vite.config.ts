import { defineConfig, loadEnv, type PluginOption } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  
  return {
    plugins: [
      react(),
      visualizer({
        filename: './states.html',
        open: true,
      }) as PluginOption,
      babel({ presets: [reactCompilerPreset()] }),
      {
        name: 'html-transform',
        transformIndexHtml(html) {
          return html.replace(
            /%VITE_KAKAO_MAP_API_KEY%/g,
            env.VITE_KAKAO_MAP_API_KEY || ''
          )
        },
      },
    ],
    build : {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
              // 안전하게 모듈 이름을 추출
              const module = id.toString().split('node_modules/')[1].split('/')[0];
              
              // @로 시작하는 패키지 처리
              if (module.startsWith('@')) {
                return `vendor-${module.split('/')[0]}-${module.split('/')[1]}`;
              }
              return `vendor-${module}`;
            }
          }
        }
      }
    }
  }
})

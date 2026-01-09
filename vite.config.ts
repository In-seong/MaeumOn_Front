import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// 공통 Vite 설정
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@user': fileURLToPath(new URL('./src/user', import.meta.url)),
      '@agent': fileURLToPath(new URL('./src/agent', import.meta.url)),
      '@admin': fileURLToPath(new URL('./src/admin', import.meta.url)),
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})

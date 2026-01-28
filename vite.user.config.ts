import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default mergeConfig(baseConfig, defineConfig({
  root: '.',
  build: {
    outDir: '../MaeumOn_Back/public/user',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'user.html')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist/user',
  }
})

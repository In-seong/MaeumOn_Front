import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'html-transform',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          // Redirect root to user.html
          if (req.url === '/' || req.url === '/index.html') {
            req.url = '/user.html'
          }
          next()
        })
      }
    }
  ],
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@user': fileURLToPath(new URL('./src/user', import.meta.url)),
      '@admin': fileURLToPath(new URL('./src/admin', import.meta.url)),
      '@agent': fileURLToPath(new URL('./src/agent', import.meta.url)),
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: '../../MaeumOn_Back/public/staginguser',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'user.html')
    }
  }
})

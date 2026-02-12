import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'agent-spa-fallback',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          const url = req.url ?? ''
          // Serve agent.html for all non-asset, non-API requests (SPA fallback)
          if (
            !url.startsWith('/src/') &&
            !url.startsWith('/node_modules/') &&
            !url.startsWith('/@') &&
            !url.startsWith('/api/') &&
            !url.includes('.')
          ) {
            req.url = '/agent.html'
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
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: '../MaeumOn_Back/public/agent',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'agent.html')
    }
  }
})

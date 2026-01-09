import { defineConfig, mergeConfig } from 'vite'
import baseConfig from './vite.config'
import { resolve } from 'path'

export default mergeConfig(baseConfig, defineConfig({
  root: '.',
  build: {
    outDir: 'dist/admin',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'admin.html')
    }
  },
  server: {
    port: 5175
  }
}))

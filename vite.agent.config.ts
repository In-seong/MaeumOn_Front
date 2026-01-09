import { defineConfig, mergeConfig } from 'vite'
import baseConfig from './vite.config'
import { resolve } from 'path'

export default mergeConfig(baseConfig, defineConfig({
  root: '.',
  build: {
    outDir: 'dist/agent',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'agent.html')
    }
  },
  server: {
    port: 5174
  }
}))

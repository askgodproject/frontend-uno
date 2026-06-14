import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tsconfigPaths()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      }
    }
  },
  // resolve: {
  //   alias: {
  //     '@': fileURLToPath(new URL('./src', import.meta.url))
  //   }
  // }
}))

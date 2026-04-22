import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['manuel-lenovo-ideapad-s540-14api'],
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})

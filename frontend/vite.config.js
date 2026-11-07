import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const BACKEND_TARGET = process.env.VITE_BACKEND_PROXY_TARGET || 'http://localhost:5000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    globals: true,
  },
  server: {
    host: '127.0.0.1',
    allowedHosts: true,
    proxy: {
      '/api-rates': {
        target: 'https://bcast.rbgoldspot.com:7768',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-rates/, '/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID'),
      },
      '/api-news': {
        target: 'https://news.chirayusoft.com:9101',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-news/, ''),
      },
      '/api': {
        target: BACKEND_TARGET,
        changeOrigin: true,
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      },
      '/music': {
        target: BACKEND_TARGET,
        changeOrigin: true,
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      }
    }
  }
})

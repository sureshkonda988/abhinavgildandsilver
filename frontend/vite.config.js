import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const BACKEND_TARGET = process.env.VITE_BACKEND_PROXY_TARGET || 'https://www.abhinavgoldandsilver.com'

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
    proxy: {
      '/api-rates': {
        target: 'https://bcast.rbgoldspot.com:7768',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-rates/, '/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID'),
      },
      '/api-news': {
        target: 'https://www.investing.com',
        changeOrigin: true,
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

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api-rates': {
        target: 'https://bcast.rbgoldspot.com:7768',
        changeOrigin: true,
        secure: false, // Allow self-signed or invalid certificates often found on these broadcast servers
        rewrite: (path) => path.replace(/^\/api-rates/, '/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID'),
      },
      '/api-news': {
        target: 'https://www.investing.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-news/, ''),
      }
    }
  }
})

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
      },
      '/audio-proxy': {
        target: 'https://drive.google.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/audio-proxy/, '/uc'),
      },
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  }
})

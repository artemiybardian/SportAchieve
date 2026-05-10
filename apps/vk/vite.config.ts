import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// No vite-plugin-pwa, no manifest, no service worker — VK Mini App runs in WebView.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Point @/ to the shared package source so all shared imports resolve correctly.
      '@': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
  base: '/',
  build: {
    target: 'esnext',
  },
  server: {
    host: true,
    port: 5175,
    // Иначе Vite отдаёт 403 при запросе через https://*.ngrok-free.app
    allowedHosts: ['.ngrok-free.app', '.ngrok.io', '.ngrok.app', '.ngrok.dev', 'localhost'],
  },
});

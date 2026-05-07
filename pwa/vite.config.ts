import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'SportAchieve',
        short_name: 'SportAchieve',
        description: 'Упражнения на тренажерах — бесплатно и по подписке',
        theme_color: '#fafafa',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        /** После деплоя старый precache с чужими chunk-ими даёт белый экран на мобильных */
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        /** Иначе навигация на Django (/admin, /api/...) отдаётся как SPA index.html (см. SW в DevTools) */
        navigateFallbackDenylist: [
          /^\/api(\/|$)/,
          /^\/admin(\/|$)/,
          /^\/files(\/|$)/,
          /^\/static(\/|$)/,
          /^\/media(\/|$)/,
          /^\/v1(\/|$)/,
          /^\/editorjs(\/|$)/,
          /^\/health(\/|$)/,
        ],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\/(auth|user|trainers|exercises|invoices|subscriptions)/,
            handler: 'NetworkOnly',
          },
          {
            /** Только маршруты SPA — не перехватывать бэкенд в браузере */
            urlPattern: ({ request, url }) =>
              request.mode === 'navigate' &&
              !/^\/(api|admin|files|static|media|v1|editorjs|health)(\/|$)/.test(url.pathname),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'spa-pages',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 32,
                maxAgeSeconds: 60 * 60 * 24,
              },
            },
          },
        ],
      },
    }),
  ],
  base: '/',
  build: {
    target: 'esnext',
  },
  server: {
    host: true,
    port: 5174,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ...(process.env.NODE_ENV === 'production' ? [VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'Voice of the Ghost',
        short_name: 'VotG',
        description: 'A judgment-free platform for emotional support and community.',
        theme_color: '#aa3bff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
        runtimeCaching: [
          {
            urlPattern: /^\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 300 }
            }
          }
        ]
      }
    })] : []),
  ],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        proxyTimeout: 600000,
        timeout: 600000,
        configure: (proxy) => {
          proxy.on('error', () => {})
        },
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
        configure: (proxy) => {
          proxy.on('error', () => {})
          proxy.on('proxyReqWs', (proxyReq, req) => {
            // Set proper headers for WebSocket upgrade
          })
        },
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
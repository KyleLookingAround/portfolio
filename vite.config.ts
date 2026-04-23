/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Stockport Quest Tracker',
        short_name: 'Quest Tracker',
        description: 'Discover and complete curated quests around Stockport, UK',
        theme_color: '#4F46E5',
        background_color: '#0B0F1A',
        display: 'standalone',
        scope: '/StockportToday/',
        start_url: '/StockportToday/',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        runtimeCaching: [],
      },
    }),
  ],
  base: '/StockportToday/',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})

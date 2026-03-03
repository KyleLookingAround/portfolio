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
        name: 'Stockport Today',
        short_name: 'Stockport',
        description: 'Live local dashboard for Stockport, Greater Manchester',
        theme_color: '#003A70',
        background_color: '#f0f4f8',
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
        // Cache API responses for offline resilience (network-first strategy)
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.open-meteo\.com\/.*/,
            handler: 'NetworkFirst',
            options: { cacheName: 'open-meteo-cache', expiration: { maxAgeSeconds: 600 } },
          },
          {
            urlPattern: /^https:\/\/air-quality-api\.open-meteo\.com\/.*/,
            handler: 'NetworkFirst',
            options: { cacheName: 'air-quality-cache', expiration: { maxAgeSeconds: 600 } },
          },
          {
            urlPattern: /^https:\/\/data\.police\.uk\/.*/,
            handler: 'NetworkFirst',
            options: { cacheName: 'police-cache', expiration: { maxAgeSeconds: 3600 } },
          },
          {
            urlPattern: /^https:\/\/environment\.data\.gov\.uk\/.*/,
            handler: 'NetworkFirst',
            options: { cacheName: 'flood-cache', expiration: { maxAgeSeconds: 300 } },
          },
          {
            urlPattern: /^https:\/\/www\.planning\.data\.gov\.uk\/.*/,
            handler: 'NetworkFirst',
            options: { cacheName: 'planning-cache', expiration: { maxAgeSeconds: 86400 } },
          },
        ],
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

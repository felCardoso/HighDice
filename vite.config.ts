import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'

// Served from GitHub Pages under /HighDice/, so the base path must match the repo name.
export default defineConfig({
  base: '/HighDice/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Only the favicon files NOT already referenced by manifest.icons below —
      // those get precached automatically with their own revision hash. Do not
      // let workbox's globPatterns also match image files, or any asset present
      // in both places ends up with two different revisions for the same URL,
      // which crashes the service worker on install ("conflicting-entries").
      includeAssets: [
        'assets/favicon.ico',
        'assets/favicon.svg',
        'assets/favicon-96x96.png',
        'assets/apple-touch-icon.png',
      ],
      manifest: {
        name: 'High Dice',
        short_name: 'HighDice',
        description:
          'A poker-like dice roguelite — roll, score hands, buy jokers, and climb 25 levels.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/HighDice/',
        scope: '/HighDice/',
        icons: [
          {
            src: 'assets/web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'assets/web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'assets/web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'assets/web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        // The entire app is a client-only game with no API calls, so precaching
        // every build asset gives full offline support out of the box. Image
        // extensions are deliberately excluded here — see the comment on
        // `includeAssets` above for why.
        globPatterns: ['**/*.{js,css,html,webmanifest}'],
        navigateFallback: '/HighDice/index.html',
        cleanupOutdatedCaches: true,
        // Bundle the Workbox runtime directly into sw.js instead of a separate
        // chunk loaded via importScripts — a single self-contained file.
        inlineWorkboxRuntime: true,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})

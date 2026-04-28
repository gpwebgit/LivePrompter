import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'

const { version } = JSON.parse(readFileSync('./package.json', 'utf-8')) as { version: string }

export default defineConfig({
  base: '/prompterlive/',
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['fonts/**', 'icons/**', 'logo.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/prompterlive/index.html',
        navigateFallbackDenylist: [/^\/api/],
      },
      manifest: {
        name: 'LivePrompter',
        short_name: 'LivePrompter',
        description: 'Teleprompter per musicisti dal vivo',
        display: 'fullscreen',
        orientation: 'portrait',
        theme_color: '#121212',
        background_color: '#000000',
        start_url: '/prompterlive/',
        scope: '/prompterlive/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})

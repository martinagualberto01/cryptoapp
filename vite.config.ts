import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Crypto Portfolio & Market Assistant',
        short_name: 'CryptoPMA',
        description: 'Gerencie seu portfólio de criptomoedas e receba alertas inteligentes.',
        theme_color: '#a3e635',
        background_color: '#18181b',
        display: 'standalone',
        start_url: '.',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
});
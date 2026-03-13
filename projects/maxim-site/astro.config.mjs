// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  outDir: '/var/www/sites/gromilov.saitik.su',
  devToolbar: { enabled: false },

  server: {
    host: '0.0.0.0',
    port: 4322
  },

  vite: {
    plugins: [tailwindcss()],
    server: {
      fs: {
        allow: ['../../']
      }
    }
  }
});
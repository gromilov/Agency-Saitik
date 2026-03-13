// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  outDir: '/var/www/sites/cortex.saitik.su',
  vite: {
    plugins: [tailwindcss()],
    server: {
      fs: {
        allow: ['../../']
      }
    }
  }
});
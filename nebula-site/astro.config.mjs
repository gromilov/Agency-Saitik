import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  outDir: '/var/www/sites/nebula.saitik.su',

  server: {
    host: '0.0.0.0',
    port: 4405
  },

  vite: {
    plugins: [tailwindcss()]
  }
});
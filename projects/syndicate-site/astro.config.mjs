import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  outDir: '/var/www/sites/syndicate.saitik.su',
  server: {
    host: '0.0.0.0',
    port: 4444
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

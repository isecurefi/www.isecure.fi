import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.isecure.fi',
  base: '/',
  build: {
    sourcemap: false
  }
});

import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import image from '@astrojs/image';

export default defineConfig({
  integrations: [
    react(),
    image({
      serviceEntryPoint: '@astrojs/image/sharp'
    })
  ],
  site: 'https://www.isecure.fi',
  base: '/',
});

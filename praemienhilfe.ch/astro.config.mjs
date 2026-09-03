// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import netlify from '@astrojs/netlify';

export default defineConfig({
  integrations: [react()],

  i18n: {
    locales: ['de', 'en', 'es'],
    defaultLocale: 'de',
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
    fallback: {
      en: 'de',
      es: 'de',
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: netlify(),
});

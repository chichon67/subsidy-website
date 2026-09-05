// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: netlify({
    // The project has no Netlify Edge Functions, but the adapter's dev-mode
    // emulation spins one up anyway. The bundled Deno version it downloads
    // doesn't support the `--allow-scripts` flag the tooling passes it,
    // crashing the local dev server and breaking asset/route handling.
    devFeatures: { edgeFunctions: false }
  })
});
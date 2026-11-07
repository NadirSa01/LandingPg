// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Real domain of the site (used for canonical URLs, Open Graph share images and hreflang links)
  site: 'https://stradashop.store',
  output: 'static',
  // Hides the Astro dev toolbar (it only exists in `npm run dev`, but covers the page on phones)
  devToolbar: { enabled: false },
  vite: {
    plugins: [tailwindcss()],
  },
});

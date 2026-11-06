// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // 👉 Replace with your real domain once deployed (used for canonical + Open Graph URLs)
  site: 'https://example.com',
  output: 'static',
  // Hides the Astro dev toolbar (it only exists in `npm run dev`, but covers the page on phones)
  devToolbar: { enabled: false },
  vite: {
    plugins: [tailwindcss()],
  },
});

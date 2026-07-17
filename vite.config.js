import { defineConfig } from 'vite';

// Static-only build. Output to /dist, deployable to Netlify/Vercel/GitHub Pages.
// `base: './'` keeps asset URLs relative so it works from any subpath host.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 4096,
    target: 'es2019',
  },
});

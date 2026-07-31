import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';
import {reactRouter} from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';

/**
 * Vercel demo build.
 *
 * This is the Shopify-free twin of `../storefront`: the same app code, but the
 * Oxygen/Hydrogen Vite plugins are dropped so it builds as a plain React Router 7
 * app that Vercel can serve. The canonical Hydrogen version lives in
 * `../storefront` and remains what ships to Shopify.
 */
export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
  build: {
    assetsInlineLimit: 0,
  },
});

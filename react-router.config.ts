import type {Config} from '@react-router/dev/config';
import {vercelPreset} from '@vercel/react-router/vite';

/**
 * React Router 7 config for the Vercel demo — Hydrogen's Oxygen preset is
 * swapped for Vercel's, so the build emits a Vercel-servable SSR app.
 */
export default {
  ssr: true,
  presets: [vercelPreset()],
} satisfies Config;

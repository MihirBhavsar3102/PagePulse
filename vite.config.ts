import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx, defineManifest } from '@crxjs/vite-plugin';
import manifestJson from './public/manifest.json';

const manifest = defineManifest(manifestJson as any);

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
});

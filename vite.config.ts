import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // Project is served from https://<user>.github.io/pickIt/ on GitHub Pages,
  // so every built asset URL must be prefixed with the repo name.
  base: '/pickIt/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
  },
});

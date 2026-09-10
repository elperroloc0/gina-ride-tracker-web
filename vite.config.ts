import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // In production Caddy serves this app and proxies /api and /ws to Django,
    // so the browser only ever talks to one origin. The dev server mirrors that
    // exactly. The alternative - pointing fetch at http://localhost:8000 - would
    // make dev cross-origin and force CORS headers onto the backend that exist
    // for development only, and that production would never exercise.
    proxy: {
      '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/ws': { target: 'ws://127.0.0.1:8000', ws: true },
    },
  },
});

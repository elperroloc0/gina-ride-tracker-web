/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // design/ds is a linked local package (file:./design/ds) with its own
    // node_modules, including its own react/react-dom (peer deps, installed
    // there only so its standalone `npm run build` can type-check). Without
    // this, Node's resolution walking up from design/ds/dist/ finds that
    // copy before the root's, and two React copies in one app throws on
    // stricter identity checks (surfaced by Vitest/React 19, not by Vite's
    // own dev/build dep pre-bundling, which normally hides it).
    dedupe: ['react', 'react-dom'],
  },
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
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
});

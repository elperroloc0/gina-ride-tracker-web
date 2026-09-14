import { routes, deploymentEnv, type VercelConfig } from '@vercel/config/v1';

// The Django backend's origin (e.g. "https://gina.halobits.com") - set as a
// Vercel env var (BACKEND_ORIGIN), never committed here. Same reasoning as
// vite.config.ts's dev proxy: the browser should only ever talk to one
// origin (this deployment's), with Vercel's edge doing the cross-origin hop
// to the real backend server-side.
const backendOrigin = deploymentEnv('BACKEND_ORIGIN');
const backendSocketOrigin = backendOrigin?.replace(/^http/, 'ws');

export const config: VercelConfig = {
  framework: 'vite',
  // No rewrites (every /api and /ws call 404s) until BACKEND_ORIGIN is set -
  // fails loud rather than silently pointing at nothing.
  rewrites: backendOrigin
    ? [
        routes.rewrite('/api/:path*', `${backendOrigin}/api/:path*`),
        routes.rewrite('/ws/:path*', `${backendSocketOrigin}/ws/:path*`),
      ]
    : [],
};

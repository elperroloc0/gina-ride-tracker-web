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
  rewrites: [
    // No API/WS rewrites (every /api and /ws call 404s) until BACKEND_ORIGIN
    // is set - fails loud rather than silently pointing at nothing.
    ...(backendOrigin
      ? [
          routes.rewrite('/api/:path*', `${backendOrigin}/api/:path*`),
          routes.rewrite('/ws/:path*', `${backendSocketOrigin}/ws/:path*`),
        ]
      : []),
    // SPA fallback: a deep link like /set-password/:token (App.tsx reads the
    // token from window.location.pathname client-side) has no matching
    // static file, so without this Vercel 404s before the app's own JS ever
    // loads. Static assets still resolve first - Vercel only falls through
    // to a rewrite when no file in the build output matches the path.
    routes.rewrite('/:path*', '/index.html'),
  ],
};

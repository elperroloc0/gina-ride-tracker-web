/**
 * Base origin for API/WS requests. Empty string means same-origin (relative
 * paths) - the default for local dev (Vite proxies /api, /ws to Django) and
 * for any prod setup where one server fronts both the app and the API. Set
 * VITE_API_URL (e.g. https://api.example.com) when the frontend and backend
 * are on different origins, such as a Vercel frontend talking to a VPS.
 */
const rawBase = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export const apiBase: string = rawBase;

export const wsBase: string = rawBase
  ? rawBase.replace(/^http/, 'ws')
  : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;

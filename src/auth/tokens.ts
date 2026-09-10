/**
 * The one place that knows where tokens live.
 *
 * Storage is localStorage: it survives a reload, which a login has to. The cost
 * is that any JavaScript running on the page can read it, so an XSS becomes a
 * stolen session. The safer option is an httpOnly cookie the browser attaches
 * on its own and JS cannot read - but that needs the backend to set cookies and
 * CSRF protection to go with it. Because Caddy already puts the app and the API
 * on one origin, that switch is realistic later; it is not free today.
 *
 * Everything else in the app goes through these four functions, so moving to
 * cookies means changing this file and nothing else.
 */
const ACCESS = 'grt.access';
const REFRESH = 'grt.refresh';

export type Tokens = { access: string; refresh: string };

export function saveTokens({ access, refresh }: Tokens): void {
  localStorage.setItem(ACCESS, access);
  localStorage.setItem(REFRESH, refresh);
}

export function getAccess(): string | null {
  return localStorage.getItem(ACCESS);
}

export function getRefresh(): string | null {
  return localStorage.getItem(REFRESH);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
}

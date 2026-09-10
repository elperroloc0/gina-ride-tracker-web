import { getAccess, saveTokens, type Tokens } from '../auth/tokens';

/** Raised for any non-2xx response, carrying the status so callers can branch. */
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/**
 * Relative URLs on purpose - the app and the API share an origin (Vite proxies
 * in dev, Caddy in production), so there is no base URL to configure per
 * environment and no environment where it can be configured wrong.
 */
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const access = getAccess();

  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(access ? { Authorization: `Bearer ${access}` } : {}),
      ...init.headers,
    },
  });

  if (!res.ok) {
    throw new ApiError(res.status, `${init.method ?? 'GET'} ${path} → ${res.status}`);
  }

  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

/**
 * Exchange credentials for a token pair. SimpleJWT's access token is short-lived
 * (5 minutes here) and the refresh token lasts a day - staying signed in past
 * that window is the next step's job.
 */
export async function login(username: string, password: string): Promise<Tokens> {
  const tokens = await request<Tokens>('/api/token/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  saveTokens(tokens);
  return tokens;
}

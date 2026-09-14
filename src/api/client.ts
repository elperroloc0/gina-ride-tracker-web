import { clearTokens, getAccess, getRefresh, saveTokens, type Tokens } from '../auth/tokens';
import type {
  ArrivalEventDTO,
  ChildDTO,
  EnrollParentRequest,
  EnrollParentResponse,
  GeoFenceDTO,
  RouteDTO,
  SetPasswordResponse,
  VanDTO,
} from './types';

/** Raised for any non-2xx response, carrying the status so callers can branch. */
export class ApiError extends Error {
  // Not a constructor parameter property: erasableSyntaxOnly (tsconfig.app.json)
  // forbids that shorthand since it emits real assignment, not just erasable types.
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Exchanges the stored refresh token for a new access token. Returns null
 * (rather than throwing) on any failure - the refresh token itself can be
 * expired or already revoked, and that's an expected outcome, not an error
 * a caller needs a stack trace for.
 */
async function refreshAccess(): Promise<string | null> {
  const refresh = getRefresh();
  if (!refresh) return null;

  const res = await fetch('/api/token/refresh/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) return null;

  const { access } = (await res.json()) as { access: string };
  saveTokens({ access, refresh });
  return access;
}

/**
 * Relative URLs on purpose - the app and the API share an origin (Vite proxies
 * in dev, Caddy in production), so there is no base URL to configure per
 * environment and no environment where it can be configured wrong.
 */
async function request<T>(path: string, init: RequestInit = {}, isRetry = false): Promise<T> {
  const access = getAccess();

  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(access ? { Authorization: `Bearer ${access}` } : {}),
      ...init.headers,
    },
  });

  if (res.status === 401 && access && !isRetry) {
    // The 5-minute access token most likely just expired mid-session (e.g. a
    // parent idle on ParentIdle past that window) - one silent refresh-and-
    // retry covers that without forcing a full re-login. If the refresh
    // token is also dead, clear everything so the app falls back to Login
    // instead of quietly failing every request for the rest of the session.
    const newAccess = await refreshAccess();
    if (newAccess) {
      return request<T>(path, init, true);
    }
    clearTokens();
  }

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

/** One-time, 30-second ticket that authenticates a ws/van/ connection - see src/ws/vanSocket.ts. */
export const requestWsTicket = () => request<{ ticket: string }>('/api/ws-ticket/', { method: 'POST' });

// A parent's GET only ever returns their own children (scoped server-side in
// ChildViewSet.get_queryset()); an operator's GET returns everyone's.
export const getChildren = () => request<ChildDTO[]>('/api/children/');
export const getRoute = (id: number) => request<RouteDTO>(`/api/routes/${id}/`);
export const getGeoFence = (id: number) => request<GeoFenceDTO>(`/api/geofences/${id}/`);
export const getRoutes = () => request<RouteDTO[]>('/api/routes/');
export const getGeoFences = () => request<GeoFenceDTO[]>('/api/geofences/');
export const getVans = () => request<VanDTO[]>('/api/vans/');

/** Operator-facing roster/history read - role-scoped server-side, same as getChildren(). */
export const getArrivalEvents = () => request<ArrivalEventDTO[]>('/api/events/');

/**
 * Operator-only: creates (or reuses) a parent account and enrolls one child
 * under it. `invited: true` in the response means a set-password link was
 * just texted; `false` means the phone number already had an account and
 * this just added another child to it.
 */
export const enrollParent = (payload: EnrollParentRequest) =>
  request<EnrollParentResponse>('/api/enroll-parent/', { method: 'POST', body: JSON.stringify(payload) });

/**
 * Public - no Authorization header is required (none may even exist yet for
 * a brand new parent). The token itself, from a texted ParentInvite link, is
 * the credential.
 */
export const setPassword = (token: string, password: string) =>
  request<SetPasswordResponse>('/api/set-password/', { method: 'POST', body: JSON.stringify({ token, password }) });

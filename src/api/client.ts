import { apiBase } from './apiBase';
import { clearTokens, getAccess, getRefresh, saveTokens, type Tokens } from '../auth/tokens';
import type {
  ArrivalEventDTO,
  ChildDTO,
  ChildScheduleDTO,
  CreateChildScheduleRequest,
  CreateGeoFenceRequest,
  CreateOperatorRequest,
  CreateRouteRequest,
  CreateVanRequest,
  EnrollParentRequest,
  EnrollParentResponse,
  GeoFenceDTO,
  InviteInfoResponse,
  MeDTO,
  OperatorDTO,
  ParentDTO,
  RouteDTO,
  SetPasswordResponse,
  UpdateMeRequest,
  UpdateParentRequest,
  VanDTO,
  VerifyResetCodeResponse,
} from './types';

/** Raised for any non-2xx response, carrying the status so callers can branch. */
export class ApiError extends Error {
  // Not a constructor parameter property: erasableSyntaxOnly (tsconfig.app.json)
  // forbids that shorthand since it emits real assignment, not just erasable types.
  status: number;
  /** The backend's {"detail": "..."} body, if it sent one (e.g. GeoFenceViewSet's
   * Traccar-provisioning and ProtectedError messages) - undefined otherwise. */
  detail?: string;

  constructor(status: number, message: string, detail?: string) {
    super(message);
    this.status = status;
    this.detail = detail;
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

  const res = await fetch(`${apiBase}/api/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) return null;

  const { access } = (await res.json()) as { access: string };
  saveTokens({ access, refresh });
  return access;
}

async function request<T>(path: string, init: RequestInit = {}, isRetry = false): Promise<T> {
  const access = getAccess();

  const res = await fetch(`${apiBase}${path}`, {
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
    const detail = await res.json().then(
      (body: { detail?: string }) => body.detail,
      () => undefined,
    );
    throw new ApiError(res.status, `${init.method ?? 'GET'} ${path} → ${res.status}`, detail);
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

export const createChildSchedule = (payload: CreateChildScheduleRequest) =>
  request<ChildScheduleDTO>('/api/schedules/', { method: 'POST', body: JSON.stringify(payload) });
export const updateChildSchedule = (id: number, payload: Partial<CreateChildScheduleRequest>) =>
  request<ChildScheduleDTO>(`/api/schedules/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deleteChildSchedule = (id: number) => request<void>(`/api/schedules/${id}/`, { method: 'DELETE' });
export const getRoute = (id: number) => request<RouteDTO>(`/api/routes/${id}/`);
export const getGeoFence = (id: number) => request<GeoFenceDTO>(`/api/geofences/${id}/`);
export const getRoutes = () => request<RouteDTO[]>('/api/routes/');
export const getGeoFences = () => request<GeoFenceDTO[]>('/api/geofences/');
export const getVans = () => request<VanDTO[]>('/api/vans/');

export const createVan = (payload: CreateVanRequest) =>
  request<VanDTO>('/api/vans/', { method: 'POST', body: JSON.stringify(payload) });
export const updateVan = (id: number, payload: Partial<CreateVanRequest>) =>
  request<VanDTO>(`/api/vans/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deleteVan = (id: number) => request<void>(`/api/vans/${id}/`, { method: 'DELETE' });

export const createGeoFence = (payload: CreateGeoFenceRequest) =>
  request<GeoFenceDTO>('/api/geofences/', { method: 'POST', body: JSON.stringify(payload) });
export const updateGeoFence = (id: number, payload: Partial<CreateGeoFenceRequest> & { is_active?: boolean }) =>
  request<GeoFenceDTO>(`/api/geofences/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deleteGeoFence = (id: number) => request<void>(`/api/geofences/${id}/`, { method: 'DELETE' });

export const createRoute = (payload: CreateRouteRequest) =>
  request<RouteDTO>('/api/routes/', { method: 'POST', body: JSON.stringify(payload) });
export const updateRoute = (id: number, payload: Partial<CreateRouteRequest>) =>
  request<RouteDTO>(`/api/routes/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deleteRoute = (id: number) => request<void>(`/api/routes/${id}/`, { method: 'DELETE' });

export const getOperators = () => request<OperatorDTO[]>('/api/operators/');
export const createOperator = (payload: CreateOperatorRequest) =>
  request<OperatorDTO>('/api/operators/', { method: 'POST', body: JSON.stringify(payload) });
export const deactivateOperator = (id: number) =>
  request<OperatorDTO>(`/api/operators/${id}/deactivate/`, { method: 'POST' });

export const getParents = () => request<ParentDTO[]>('/api/parents/');
export const updateParent = (id: number, payload: UpdateParentRequest) =>
  request<ParentDTO>(`/api/parents/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deactivateParent = (id: number) =>
  request<ParentDTO>(`/api/parents/${id}/deactivate/`, { method: 'POST' });
export const resendParentInvite = (id: number) =>
  request<ParentDTO>(`/api/parents/${id}/resend_invite/`, { method: 'POST' });

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

/**
 * Public GET counterpart to setPassword() - who a set-password link is for,
 * fetched before the parent types anything. Same "invalid or expired" 400
 * as setPassword() itself if the token is unknown, used, or too old.
 */
export const getInviteInfo = (token: string) =>
  request<InviteInfoResponse>(`/api/set-password/${encodeURIComponent(token)}/`);

/**
 * Public - phone number only, no signed-in session or existing account
 * required. Step 1 of 2: texts a 6-digit code, not a link (see
 * verifyResetCode). The response is the same generic {detail} whether or
 * not the number actually matches an account (see ForgotPasswordView on
 * the backend) - never branch UI copy on its content beyond success/failure.
 */
export const forgotPassword = (phone: string) =>
  request<{ detail: string }>('/api/forgot-password/', { method: 'POST', body: JSON.stringify({ phone_number: phone }) });

/**
 * Step 2: exchanges the code forgotPassword() just texted for a normal
 * ParentInvite token - feed the result straight into SetPassword.tsx, same
 * as a texted invite link's token. A wrong/expired code, or too many wrong
 * guesses, is a 400 with a human-readable `detail` (ApiError.detail).
 */
export const verifyResetCode = (phone: string, code: string) =>
  request<VerifyResetCodeResponse>('/api/forgot-password/verify/', {
    method: 'POST',
    body: JSON.stringify({ phone_number: phone, code }),
  });

/** The signed-in user's own profile - see MeDTO for why it's narrower than ParentDTO. */
export const getMe = () => request<MeDTO>('/api/me/');
export const updateMe = (payload: UpdateMeRequest) =>
  request<MeDTO>('/api/me/', { method: 'PATCH', body: JSON.stringify(payload) });

/**
 * Self-service password change for someone who still knows their current
 * one - distinct from setPassword()'s invite-token flow, for someone who
 * doesn't. A wrong current password is a 400 with `detail` set.
 */
export const changePassword = (currentPassword: string, newPassword: string) =>
  request<void>('/api/change-password/', {
    method: 'POST',
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });

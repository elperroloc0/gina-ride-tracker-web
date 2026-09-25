// Mirrors the real Django REST serializers (backend/accounts/serializers.py,
// backend/fleet/serializers.py) - kept in this one file so a serializer
// field rename is a one-place fix on the frontend too.

export type ChildScheduleDTO = {
  id: number;
  child: number;
  /** 0=Monday..6=Sunday (accounts.models.ChildSchedule.Weekday). */
  weekday: number;
  /** "HH:MM:SS" */
  pickup_hour: string;
};

export type ChildDTO = {
  id: number;
  name: string;
  parent: number;
  parent_name: string;
  parent_phone_number: string;
  route: number;
  schedule: ChildScheduleDTO[];
  /** Backend is_ride_active(): the live-map gate, incl. its 6h self-healing cap. */
  ride_active: boolean;
  active_ride_start: string | null;
};

// RouteSerializer exposes origin/destination as bare GeoFence ids, not
// nested objects - resolving a human-readable name is a separate fetch.
export type RouteDTO = {
  id: number;
  van: number;
  origin: number;
  destination: number;
};

export type GeoFenceDTO = {
  id: number;
  name: string;
  location_type: 'SCHOOL' | 'GYM';
  latitude: string;
  longitude: string;
  radius: number;
  traccar_id: number;
  is_active: boolean;
};

export type VanDTO = {
  id: number;
  name: string;
  tracker_imei: string;
};

export type ArrivalEventDTO = {
  id: number;
  van: number;
  geo_fence: number;
  arrival_type: 'in' | 'out';
  time: string;
};

export type EnrollParentRequest = {
  parent_phone: string;
  parent_name: string;
  email: string;
  child_name: string;
  route: number;
  /** ChildSchedule.Weekday values: 0=Monday..6=Sunday. */
  weekdays: number[];
  /** "HH:MM:SS" */
  pickup_hour: string;
};

export type EnrollParentResponse = {
  child: ChildDTO;
  /** False when the phone number already had a parent account - no new invite text was sent. */
  invited: boolean;
};

export type SetPasswordResponse = {
  access: string;
  refresh: string;
};

/** What GET /api/me/ (MeView) returns for whoever is signed in. Narrower
 * than ParentDTO on purpose - phone_number/first_name/role are read-only
 * here (see UpdateMeRequest), matching MeSerializer's read_only_fields. */
export type MeDTO = {
  first_name: string;
  email: string;
  phone_number: string;
  role: 'PARENT' | 'OPERATOR';
  notify_channel: 'SMS' | 'EMAIL';
};

/** PATCH /api/me/ body - only email and notify_channel are writable
 * self-service; phone_number/first_name/role stay operator-only. */
export type UpdateMeRequest = Partial<{
  email: string;
  notify_channel: 'SMS' | 'EMAIL';
}>;

/** What POST /api/forgot-password/verify/ (VerifyResetCodeView) returns on
 * a correct code - a normal ParentInvite token, the same shape a texted
 * invite link's token has. Feed it straight into SetPassword.tsx. */
export type VerifyResetCodeResponse = {
  token: string;
};

/** What GET /api/set-password/:token/ (InviteInfoView) returns - lets the
 * set-password page show whose account it's activating before anything is
 * typed. phone_number is what the parent will use to sign in afterward. */
export type InviteInfoResponse = {
  first_name: string;
  phone_number: string;
};

export type CreateChildScheduleRequest = {
  child: number;
  /** 0=Monday..6=Sunday (accounts.models.ChildSchedule.Weekday). */
  weekday: number;
  /** "HH:MM:SS" */
  pickup_hour: string;
};

export type CreateVanRequest = { name: string; tracker_imei: string };

// No traccar_id here - the server auto-provisions the matching Traccar zone
// and assigns it (fleet/views.py's GeoFenceViewSet.perform_create).
export type CreateGeoFenceRequest = {
  name: string;
  location_type: 'SCHOOL' | 'GYM';
  latitude: string;
  longitude: string;
  radius: number;
};

export type CreateRouteRequest = { van: number; origin: number; destination: number };

export type OperatorDTO = {
  id: number;
  username: string;
  first_name: string;
  email: string;
  phone_number: string;
  is_active: boolean;
};

export type CreateOperatorRequest = {
  username: string;
  first_name: string;
  email: string;
  phone_number?: string;
};

export type ParentDTO = {
  id: number;
  username: string;
  first_name: string;
  email: string;
  phone_number: string;
  is_active: boolean;
  /** Has the parent actually followed their invite link and set a real
   * password (SetPasswordView) - false for a freshly-enrolled account. */
  is_registered: boolean;
  children: ChildDTO[];
};

export type UpdateParentRequest = Partial<{
  first_name: string;
  email: string;
  /** Editing this also updates the parent's username server-side, since a
   * parent's login is their phone number - see ParentSerializer.update(). */
  phone_number: string;
}>;

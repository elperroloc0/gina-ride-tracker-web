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
  password: string;
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

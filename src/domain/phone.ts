/**
 * Normalizes to E.164 for the backend's PhoneNumberField, which has no
 * default region configured (backend/backend/settings.py) and so requires a
 * country code. A bare 10-digit US number is the only shorthand accepted -
 * this is a single-market Miami gym, not a general phone input. Shared by
 * every screen that sends a phone number to the API (AddParentForm,
 * ForgotPassword) so the one accepted shorthand stays consistent everywhere.
 */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.length === 10) return `+1${digits}`;
  return digits;
}

import { useState, type FormEvent, type ReactNode } from 'react';
import { Badge, Button, Input } from 'gina-ride-tracker-ds';
import { ApiError, createGeoFence, updateGeoFence } from '../../api/client';
import type { GeoFenceDTO } from '../../api/types';
import { useIsDesktopViewport } from '../../layout/useIsDesktopViewport';

type Props = {
  initial?: GeoFenceDTO;
  onDone: () => void;
  onCancel: () => void;
};

/** No traccar_id field here on purpose - the backend auto-provisions the
 * matching Traccar zone and assigns it (see GeoFenceViewSet.perform_create/
 * perform_update). A 400 here most often means that Traccar-side call
 * failed, not a plain validation error, so the backend's own `detail`
 * message is surfaced instead of a generic one. */
export function GeoFenceForm({ initial, onDone, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [locationType, setLocationType] = useState<'SCHOOL' | 'GYM'>(initial?.location_type ?? 'SCHOOL');
  const [latitude, setLatitude] = useState(initial?.latitude ?? '');
  const [longitude, setLongitude] = useState(initial?.longitude ?? '');
  const [radius, setRadius] = useState(initial ? String(initial.radius) : '50');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDesktop = useIsDesktopViewport();
  const inputVariant = isDesktop ? 'console' : 'mobile';
  const buttonSize = isDesktop ? 'console' : 'mobile';

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload = { name, location_type: locationType, latitude, longitude, radius: Number(radius) };
      if (initial) await updateGeoFence(initial.id, payload);
      else await createGeoFence(payload);
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? (err.detail ?? 'Could not save this geofence right now.') : 'Could not save this geofence right now.');
    } finally {
      setBusy(false);
    }
  }

  return (
    // See AddOperatorForm's note on this shape - fixed header/footer around a
    // scrollable field list so the submit row can't straddle the fold on a
    // short phone viewport.
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: isDesktop ? 24 : 16, height: '100%', boxSizing: 'border-box' }}>
      <div style={{ fontFamily: 'var(--display)', fontSize: 20, textTransform: 'uppercase', flexShrink: 0 }}>{initial ? 'Edit geofence' : 'Add a geofence'}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <Field label="Name">
          <Input variant={inputVariant} value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>

        <Field label="Type">
          <select
            value={locationType}
            onChange={(e) => setLocationType(e.target.value as 'SCHOOL' | 'GYM')}
            required
            style={{
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-field)',
              padding: isDesktop ? '10px 12px' : '0 16px',
              height: isDesktop ? undefined : 52,
              fontSize: isDesktop ? 13 : 15,
              background: 'var(--surface)',
            }}
          >
            <option value="SCHOOL">School</option>
            <option value="GYM">Gym</option>
          </select>
        </Field>

        <Field label="Latitude">
          <Input variant={inputVariant} value={latitude} onChange={(e) => setLatitude(e.target.value)} required />
        </Field>

        <Field label="Longitude">
          <Input variant={inputVariant} value={longitude} onChange={(e) => setLongitude(e.target.value)} required />
        </Field>

        <Field label="Radius (meters)">
          <Input variant={inputVariant} type="number" min={1} value={radius} onChange={(e) => setRadius(e.target.value)} required />
        </Field>
      </div>

      {error ? (
        <div role="alert" style={{ display: 'flex', flexShrink: 0 }}>
          <Badge tone="alert">{error}</Badge>
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <Button variant="secondary" size={buttonSize} type="button" onClick={onCancel} style={{ flex: isDesktop ? undefined : 1 }}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size={buttonSize}
          type="submit"
          icon={initial ? 'check' : 'plus'}
          disabled={busy}
          style={{ flex: isDesktop ? undefined : 1 }}
        >
          {busy ? 'Saving…' : initial ? 'Save' : 'Add geofence'}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)' }}>{label}</span>
      {children}
    </label>
  );
}

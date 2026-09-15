import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Badge, Button } from 'gina-ride-tracker-ds';
import { ApiError, createRoute, getGeoFences, getVans, updateRoute } from '../../api/client';
import type { GeoFenceDTO, RouteDTO, VanDTO } from '../../api/types';

type Props = {
  initial?: RouteDTO;
  onDone: () => void;
  onCancel: () => void;
};

/** Origin/destination selects are pre-filtered to SCHOOL/GYM respectively,
 * mirroring Route.clean() server-side, so a mismatched pick is caught here
 * instead of round-tripping to the server first - the server still
 * re-validates for real. */
export function RouteForm({ initial, onDone, onCancel }: Props) {
  const [vans, setVans] = useState<VanDTO[]>([]);
  const [geoFences, setGeoFences] = useState<GeoFenceDTO[]>([]);
  const [vanId, setVanId] = useState<number | null>(initial?.van ?? null);
  const [originId, setOriginId] = useState<number | null>(initial?.origin ?? null);
  const [destinationId, setDestinationId] = useState<number | null>(initial?.destination ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getVans().then((vs) => {
      setVans(vs);
      setVanId((prev) => prev ?? vs[0]?.id ?? null);
    });
    getGeoFences().then((gs) => {
      setGeoFences(gs);
      setOriginId((prev) => prev ?? gs.find((g) => g.location_type === 'SCHOOL')?.id ?? null);
      setDestinationId((prev) => prev ?? gs.find((g) => g.location_type === 'GYM')?.id ?? null);
    });
  }, []);

  const schools = geoFences.filter((g) => g.location_type === 'SCHOOL');
  const gyms = geoFences.filter((g) => g.location_type === 'GYM');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (vanId == null || originId == null || destinationId == null) return;
    setBusy(true);
    setError(null);
    try {
      const payload = { van: vanId, origin: originId, destination: destinationId };
      if (initial) await updateRoute(initial.id, payload);
      else await createRoute(payload);
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? (err.detail ?? 'Could not save this route right now.') : 'Could not save this route right now.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
      <div style={{ fontFamily: 'var(--display)', fontSize: 20, textTransform: 'uppercase' }}>{initial ? 'Edit route' : 'Add a route'}</div>

      <Field label="Van">
        <select
          value={vanId ?? ''}
          onChange={(e) => setVanId(Number(e.target.value))}
          required
          style={selectStyle}
        >
          {vans.map((van) => (
            <option key={van.id} value={van.id}>
              {van.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Origin (school)">
        <select
          value={originId ?? ''}
          onChange={(e) => setOriginId(Number(e.target.value))}
          required
          style={selectStyle}
        >
          {schools.map((school) => (
            <option key={school.id} value={school.id}>
              {school.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Destination (gym)">
        <select
          value={destinationId ?? ''}
          onChange={(e) => setDestinationId(Number(e.target.value))}
          required
          style={selectStyle}
        >
          {gyms.map((gym) => (
            <option key={gym.id} value={gym.id}>
              {gym.name}
            </option>
          ))}
        </select>
      </Field>

      {error ? (
        <div role="alert" style={{ display: 'flex' }}>
          <Badge tone="alert">{error}</Badge>
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" icon={initial ? 'check' : 'plus'} disabled={busy || vanId == null || originId == null || destinationId == null}>
          {busy ? 'Saving…' : initial ? 'Save' : 'Add route'}
        </Button>
      </div>
    </form>
  );
}

const selectStyle = { border: '1px solid var(--line)', borderRadius: 'var(--r-field)', padding: '10px 12px', fontSize: 13, background: 'var(--surface)' };

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)' }}>{label}</span>
      {children}
    </label>
  );
}

import { useEffect, useState, type FormEvent } from 'react';
import { Badge, Button } from 'gina-ride-tracker-ds';
import { ApiError, createChildSchedule, deleteChildSchedule, getGeoFences, getRoutes, updateChild, updateChildSchedule } from '../../api/client';
import type { ChildDTO, GeoFenceDTO, RouteDTO } from '../../api/types';

const WEEKDAYS: { value: number; label: string }[] = [
  { value: 0, label: 'M' },
  { value: 1, label: 'T' },
  { value: 2, label: 'W' },
  { value: 3, label: 'T' },
  { value: 4, label: 'F' },
];

type Props = {
  child: ChildDTO;
  onDone: () => void;
  onCancel: () => void;
};

/**
 * One pickup time shared across every selected day, matching how
 * EnrollParentView creates a schedule in the first place (one ChildSchedule
 * row per weekday, all with the same pickup_hour) - editing keeps that same
 * shape rather than allowing a different time per day. The route is edited
 * here too (PATCH /api/children/:id/) so the whole "how this child rides"
 * lives in one form.
 */
export function EditChildScheduleForm({ child, onDone, onCancel }: Props) {
  const [weekdays, setWeekdays] = useState<Set<number>>(new Set(child.schedule.map((s) => s.weekday)));
  const [pickupHour, setPickupHour] = useState(child.schedule[0]?.pickup_hour.slice(0, 5) ?? '15:00');
  const [routes, setRoutes] = useState<RouteDTO[]>([]);
  const [geoFences, setGeoFences] = useState<GeoFenceDTO[]>([]);
  const [routeId, setRouteId] = useState(child.route);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRoutes().then(setRoutes);
    getGeoFences().then(setGeoFences);
  }, []);

  const geoFenceName = (id: number) => geoFences.find((g) => g.id === id)?.name ?? `#${id}`;

  function toggleWeekday(value: number) {
    setWeekdays((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (weekdays.size === 0) return;
    setBusy(true);
    setError(null);
    try {
      const newPickupHour = `${pickupHour}:00`;
      const existingByWeekday = new Map(child.schedule.map((s) => [s.weekday, s]));

      const removed = child.schedule.filter((s) => !weekdays.has(s.weekday));
      const added = [...weekdays].filter((w) => !existingByWeekday.has(w));
      const kept = child.schedule.filter((s) => weekdays.has(s.weekday) && s.pickup_hour !== newPickupHour);

      await Promise.all([
        ...removed.map((s) => deleteChildSchedule(s.id)),
        ...added.map((weekday) => createChildSchedule({ child: child.id, weekday, pickup_hour: newPickupHour })),
        ...kept.map((s) => updateChildSchedule(s.id, { pickup_hour: newPickupHour })),
        ...(routeId !== child.route ? [updateChild(child.id, { route: routeId })] : []),
      ]);
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? (err.detail ?? 'Could not save this schedule right now.') : 'Could not save this schedule right now.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
      <div style={{ fontFamily: 'var(--display)', fontSize: 20, textTransform: 'uppercase' }}>Edit {child.name}&rsquo;s ride</div>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)' }}>
          Route
        </span>
        <select
          value={routeId}
          onChange={(e) => setRouteId(Number(e.target.value))}
          required
          style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-field)', padding: '10px 12px', fontSize: 13, background: 'var(--surface)' }}
        >
          {routes.map((route) => (
            <option key={route.id} value={route.id}>
              {geoFenceName(route.origin)} → {geoFenceName(route.destination)}
            </option>
          ))}
        </select>
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)' }}>
          Pickup days
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          {WEEKDAYS.map((day) => {
            const active = weekdays.has(day.value);
            return (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleWeekday(day.value)}
                aria-pressed={active}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 'var(--r-chip)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 700,
                  background: active ? 'var(--blue)' : 'var(--fill)',
                  color: active ? '#FFFFFF' : 'var(--muted)',
                }}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)' }}>
          Pickup time
        </span>
        <input
          type="time"
          value={pickupHour}
          onChange={(e) => setPickupHour(e.target.value)}
          required
          style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-field)', padding: '10px 12px', fontSize: 13 }}
        />
      </label>

      {error ? (
        <div role="alert" style={{ display: 'flex' }}>
          <Badge tone="alert">{error}</Badge>
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" icon="check" disabled={busy || weekdays.size === 0}>
          {busy ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  );
}

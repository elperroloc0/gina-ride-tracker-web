import { useEffect, useState, type FormEvent } from 'react';
import { Badge, Button } from 'gina-ride-tracker-ds';
import { ApiError, createChildSchedule, deleteChildSchedule, getGeoFences, getRoutes, updateChild, updateChildSchedule } from '../../api/client';
import type { ChildDTO, GeoFenceDTO, RouteDTO } from '../../api/types';
import { useIsDesktopViewport } from '../../layout/useIsDesktopViewport';

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
  const isDesktop = useIsDesktopViewport();

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

  const fieldStyle: React.CSSProperties = {
    border: '1px solid var(--line)',
    borderRadius: 'var(--r-field)',
    padding: isDesktop ? '10px 12px' : '0 16px',
    height: isDesktop ? undefined : 52,
    fontSize: isDesktop ? 13 : 15,
    background: 'var(--surface)',
  };
  const chipSize = isDesktop ? 30 : 40;

  return (
    // See AddOperatorForm's note on this shape.
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: isDesktop ? 24 : 16, height: '100%', boxSizing: 'border-box' }}>
      <div style={{ fontFamily: 'var(--display)', fontSize: 20, textTransform: 'uppercase', flexShrink: 0 }}>Edit {child.name}&rsquo;s ride</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)' }}>
            Route
          </span>
          <select value={routeId} onChange={(e) => setRouteId(Number(e.target.value))} required style={fieldStyle}>
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
                    width: chipSize,
                    height: chipSize,
                    borderRadius: 'var(--r-chip)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: isDesktop ? 12 : 14,
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
          <input type="time" value={pickupHour} onChange={(e) => setPickupHour(e.target.value)} required style={fieldStyle} />
        </label>
      </div>

      {error ? (
        <div role="alert" style={{ display: 'flex', flexShrink: 0 }}>
          <Badge tone="alert">{error}</Badge>
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <Button variant="secondary" size={isDesktop ? 'console' : 'mobile'} type="button" onClick={onCancel} style={{ flex: isDesktop ? undefined : 1 }}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size={isDesktop ? 'console' : 'mobile'}
          type="submit"
          icon="check"
          disabled={busy || weekdays.size === 0}
          style={{ flex: isDesktop ? undefined : 1 }}
        >
          {busy ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  );
}

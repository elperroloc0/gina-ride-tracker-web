import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Badge, Button, Input } from 'gina-ride-tracker-ds';
import { ApiError, enrollParent, getGeoFences, getRoutes } from '../../api/client';
import { normalizePhone } from '../../domain/phone';
import type { GeoFenceDTO, RouteDTO } from '../../api/types';
import { useIsDesktopViewport } from '../../layout/useIsDesktopViewport';

const WEEKDAYS: { value: number; label: string }[] = [
  { value: 0, label: 'M' },
  { value: 1, label: 'T' },
  { value: 2, label: 'W' },
  { value: 3, label: 'T' },
  { value: 4, label: 'F' },
];

type Props = {
  onDone: () => void;
  onCancel: () => void;
};

/**
 * The operator-facing side of the invite flow LoginDesktop/Login already
 * advertise ("Accounts are set up by the gym" / "we text you an invite link
 * to pick a password"). One combined form - phone, child, route, schedule -
 * matches how a front desk actually enrolls a family in one sitting, rather
 * than creating the parent and the child as two separate steps.
 */
export function AddParentForm({ onDone, onCancel }: Props) {
  const [routes, setRoutes] = useState<RouteDTO[]>([]);
  const [geoFences, setGeoFences] = useState<GeoFenceDTO[]>([]);
  const [parentPhone, setParentPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [email, setEmail] = useState('');
  const [childName, setChildName] = useState('');
  const [routeId, setRouteId] = useState<number | null>(null);
  const [weekdays, setWeekdays] = useState<Set<number>>(new Set());
  const [pickupHour, setPickupHour] = useState('15:00');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ childName: string; invited: boolean } | null>(null);
  const isDesktop = useIsDesktopViewport();
  const inputVariant = isDesktop ? 'console' : 'mobile';
  const buttonSize = isDesktop ? 'console' : 'mobile';

  useEffect(() => {
    getRoutes().then((rs) => {
      setRoutes(rs);
      setRouteId((prev) => prev ?? rs[0]?.id ?? null);
    });
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
    if (routeId == null || weekdays.size === 0) return;
    setBusy(true);
    setError(null);
    try {
      const response = await enrollParent({
        parent_phone: normalizePhone(parentPhone),
        parent_name: parentName,
        email,
        child_name: childName,
        route: routeId,
        weekdays: [...weekdays],
        pickup_hour: `${pickupHour}:00`,
      });
      setResult({ childName: response.child.name, invited: response.invited });
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 400
          ? 'Check the phone number and try again.'
          : 'Could not reach the gym right now. Try again in a moment.',
      );
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: isDesktop ? 24 : 16 }}>
        <div style={{ fontFamily: 'var(--display)', fontSize: 20, textTransform: 'uppercase' }}>
          {result.childName} is enrolled
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
          {result.invited
            ? 'A text with a link to set up their account is on its way to the parent.'
            : 'Added to the existing parent account for this phone number - no new text needed.'}
        </p>
        <Button variant="secondary" size={buttonSize} onClick={onDone}>
          Back to roster
        </Button>
      </div>
    );
  }

  const selectFieldStyle: React.CSSProperties = {
    border: '1px solid var(--line)',
    borderRadius: 'var(--r-field)',
    padding: isDesktop ? '10px 12px' : '0 16px',
    height: isDesktop ? undefined : 52,
    fontSize: isDesktop ? 13 : 15,
    background: 'var(--surface)',
  };
  const chipSize = isDesktop ? 30 : 40;

  return (
    // This is the longest form in the console (six fields plus the weekday
    // chips) - tall enough on a phone's shorter viewport that a plain
    // scrolling form left the Cancel/Add family row straddling the fold,
    // half-clipped by the bottom tab bar instead of either fully visible or
    // fully scrolled past. Splitting into a fixed header/footer around a
    // scrollable field list keeps the buttons always fully in view.
    <form
      onSubmit={onSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: isDesktop ? 24 : 16,
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ fontFamily: 'var(--display)', fontSize: 24, letterSpacing: '-0.02em', textTransform: 'uppercase', flexShrink: 0 }}>
        Add a family
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, minHeight: 0, overflowY: 'auto' }}>
      <Field label="Parent phone">
        <Input variant={inputVariant} type="tel" icon="phone" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} required />
      </Field>

      <Field label="Parent name">
        <Input variant={inputVariant} value={parentName} onChange={(e) => setParentName(e.target.value)} />
      </Field>

      <Field label="Email">
        <Input variant={inputVariant} type="email" icon="mail" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>

      <Field label="Child name">
        <Input variant={inputVariant} value={childName} onChange={(e) => setChildName(e.target.value)} required />
      </Field>

      <Field label="Route">
        <select
          className="gds-field__input"
          value={routeId ?? ''}
          onChange={(e) => setRouteId(Number(e.target.value))}
          required
          style={selectFieldStyle}
        >
          {routes.map((route) => (
            <option key={route.id} value={route.id}>
              {geoFenceName(route.origin)} → {geoFenceName(route.destination)}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Pickup days">
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
      </Field>

      <Field label="Pickup time">
        <input type="time" value={pickupHour} onChange={(e) => setPickupHour(e.target.value)} required style={selectFieldStyle} />
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
          icon="plus"
          disabled={busy || weekdays.size === 0 || routeId == null}
          style={{ flex: isDesktop ? undefined : 1 }}
        >
          {busy ? 'Adding…' : 'Add family'}
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

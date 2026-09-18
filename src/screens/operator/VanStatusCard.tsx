import { compassLabel } from '../../domain/compass';
import type { VanPosition } from '../../ws/vanSocket';

// Traccar's speed field is in knots (the same convention GPS/AIS always
// uses) - converted here for a US, Miami-based audience rather than
// showing a unit an operator would have to mentally convert.
const KNOTS_TO_MPH = 1.15078;

type Props = {
  position: VanPosition | undefined;
};

/**
 * The four facts an operator would check at a glance on a specific van:
 * engine, fuel, speed, heading - exactly what was asked for. Every value
 * is "—" (or "Unknown" for engine) when the tracker didn't report it, per
 * Position.attributes' own doc comment on the backend - never a guessed
 * 0/Off, since a van that's simply not reporting ignition would otherwise
 * look identical to one that's genuinely off.
 *
 * Fuel is shown as a percentage - confirmed against the gym's own
 * hardware/OBD setup, not a generic Traccar assumption. If the real
 * hardware test (a later step) turns up a different unit for this specific
 * tracker, update the suffix here.
 */
export function VanStatusCard({ position }: Props) {
  const ignition = position?.ignition ?? null;
  const fuel = position?.fuel ?? null;
  const speed = position?.speed ?? null;
  const course = position?.course ?? null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 2px 2px', borderTop: '1px solid var(--line-2)', marginTop: 8 }}>
      <StatusRow
        label="Engine"
        value={ignition == null ? 'Unknown' : ignition ? 'Running' : 'Off'}
        dotColor={ignition ? 'var(--ok)' : 'var(--muted-2)'}
      />
      <StatusRow label="Fuel" value={fuel == null ? '—' : `${fuel}%`} />
      <StatusRow label="Speed" value={speed == null ? '—' : `${Math.round(speed * KNOTS_TO_MPH)} mph`} />
      <StatusRow label="Heading" value={course == null ? '—' : compassLabel(course)} />
    </div>
  );
}

function StatusRow({ label, value, dotColor }: { label: string; value: string; dotColor?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
        {dotColor ? <span style={{ width: 7, height: 7, borderRadius: '999px', background: dotColor, flexShrink: 0 }} /> : null}
        {value}
      </span>
    </div>
  );
}

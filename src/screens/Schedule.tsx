import { Card } from 'gina-ride-tracker-ds';
import { WeekStrip } from '../components/WeekStrip';
import type { ChildDTO } from '../api/types';
import { computeNextRide } from '../domain/schedule';

const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function formatTime(pickupHour: string): string {
  const [h, m] = pickupHour.split(':').map(Number);
  return new Date(0, 0, 0, h, m).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

type Props = {
  child: ChildDTO;
  origin?: string;
  destination?: string;
};

/**
 * No design mockup exists for this screen - it was only ever a nav-tab label
 * (design/ParentApp's bottom nav). Built here from the existing mobile-card
 * idioms rather than blocking on a separate design pass, and kept
 * deliberately simple: read-only (IsOperatorOrReadOnly blocks a parent from
 * writing schedules server-side anyway, so there's no form/Toggle here).
 * Sign-out lives in ParentApp's header now (reachable from every tab, not
 * just this one) - see ParentApp.tsx.
 */
export default function Schedule({ child, origin, destination }: Props) {
  const nextRide = computeNextRide(child.schedule, new Date());
  const rows = [...child.schedule].sort((a, b) => a.weekday - b.weekday);

  return (
    <div style={{ minHeight: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: 16, padding: 16, background: 'var(--bg)' }}>
      <div style={{ fontFamily: 'var(--display)', fontSize: 24, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
        Schedule
      </div>

      {nextRide ? <WeekStrip activeDays={nextRide.activeDays} /> : null}

      {rows.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>
          No pickup days set yet — check with the front desk.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map((row) => (
            <Card key={row.id} variant="mobile">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{WEEKDAY_NAMES[row.weekday]}</span>
                <span style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatTime(row.pickup_hour)}</span>
              </div>
              {origin && destination ? (
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                  {origin} → {destination}
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

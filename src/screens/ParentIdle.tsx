import { Badge } from 'gina-ride-tracker-ds';
import { BaseMap } from '../map/BaseMap';
import { MapPlaceholder } from '../map/MapPlaceholder';
import { hasMapboxToken } from '../map/mapboxToken';

/**
 * Sample shape for `accounts.ChildSchedule` until that endpoint exists.
 * Names, school and time are placeholders — see DESIGN-SYSTEM.md "Тон и копирайт".
 */
type NextRide = {
  weekday: string;
  time: string;
  origin: string;
  destination: string;
  /** Sun..Sat, matching the pickup-day strip below. */
  activeDays: [boolean, boolean, boolean, boolean, boolean, boolean, boolean];
  daysAway: number;
};

const SAMPLE_NEXT_RIDE: NextRide = {
  weekday: 'Friday',
  time: '3:00 PM',
  origin: "Coral Way K-8 Center",
  destination: "Gina's Gymnastics",
  activeDays: [false, true, false, true, false, true, false],
  daysAway: 2,
};

const WEEK_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/**
 * The "no ride right now" state of the parent app - matches design/ParentIdle.dc.html.
 * No van marker here even once Mapbox is live - there is nothing in motion to show
 * when idle, just the two geofences (once real coordinates exist for them).
 */
export default function ParentIdle({ childName, nextRide = SAMPLE_NEXT_RIDE }: { childName: string; nextRide?: NextRide }) {
  return (
    <div style={{ position: 'relative', minHeight: '100%', flex: 1, overflow: 'hidden', background: '#E9E9E4' }}>
      {hasMapboxToken ? <BaseMap /> : <MapPlaceholder />}

      <div
        style={{
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 92,
          background: 'var(--surface)',
          borderRadius: 22,
          boxShadow: '0 -8px 28px rgba(0,0,0,0.14)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '60%',
        }}
      >
        <div style={{ flexShrink: 0, padding: '18px 20px 14px', borderBottom: '1px solid var(--line-2)' }}>
          <div style={{ fontFamily: 'var(--display)', fontSize: 21, lineHeight: 1.05, letterSpacing: '-0.02em', textTransform: 'uppercase', textWrap: 'pretty' }}>
            No ride right now
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, lineHeight: 1.4 }}>
            The map opens on its own when the van reaches the school.
          </div>
        </div>

        <div style={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)' }}>
              Next ride
            </span>
            <Badge tone="info">In {nextRide.daysAway} days</Badge>
          </div>

          <div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 20, letterSpacing: '-0.015em' }}>
              {nextRide.weekday}, {nextRide.time}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>
              {nextRide.origin} → {nextRide.destination}
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--line-2)' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {WEEK_LETTERS.map((letter, i) => {
                const on = nextRide.activeDays[i];
                const isWeekend = i === 0 || i === 6;
                return (
                  <div key={i} style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: isWeekend ? 'var(--muted-2)' : 'var(--muted)' }}>
                      {letter}
                    </span>
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '999px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                        background: on ? 'var(--blue)' : 'var(--fill)',
                        color: on ? '#FFF' : isWeekend ? 'var(--muted-2)' : 'var(--muted)',
                      }}
                    >
                      {isWeekend ? '' : letter}
                    </span>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
              {childName}&rsquo;s pickup days, set by the gym
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

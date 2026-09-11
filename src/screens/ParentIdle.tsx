import { Badge } from 'gina-ride-tracker-ds';
import { WeekStrip } from '../components/WeekStrip';
import type { NextRide } from '../domain/schedule';
import { BaseMap } from '../map/BaseMap';
import { MapPlaceholder } from '../map/MapPlaceholder';
import { hasMapboxToken } from '../map/mapboxToken';

type Props = {
  childName: string;
  nextRide: NextRide | null;
  origin?: string;
  destination?: string;
};

/**
 * The "no ride right now" state of the parent app - matches design/ParentIdle.dc.html.
 * No van marker here even once Mapbox is live - there is nothing in motion to show
 * when idle, just the basemap (real geofence circles are a follow-up once the
 * console has a way to place them - see MapMarker's own doc comment).
 */
export default function ParentIdle({ childName, nextRide, origin, destination }: Props) {
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
          {nextRide ? (
            <>
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
                {origin && destination ? (
                  <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>
                    {origin} → {destination}
                  </div>
                ) : null}
              </div>

              <div style={{ height: 1, background: 'var(--line-2)' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <WeekStrip activeDays={nextRide.activeDays} />
                <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
                  {childName}&rsquo;s pickup days, set by the gym
                </div>
              </div>
            </>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>
              No pickup days set yet — check with the front desk.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

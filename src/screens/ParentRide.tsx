import { LivenessDot, MapMarker, Timeline } from 'gina-ride-tracker-ds';
import { Marker } from '@vis.gl/react-mapbox';
import { BaseMap } from '../map/BaseMap';
import { MapPlaceholder } from '../map/MapPlaceholder';
import { hasMapboxToken } from '../map/mapboxToken';
import type { VanPosition } from '../ws/vanSocket';

type Props = {
  status: 'live' | 'stale';
  position: VanPosition | null;
  childName: string;
};

/**
 * The live/lost-signal state of the parent app - matches design/ParentLive.dc.html
 * and design/ParentStale.dc.html. One component for both (not two files): they
 * share the same map/timeline chrome and differ only in MapMarker kind,
 * LivenessDot state, and copy - the same reason MapMarker's own doc comment
 * insists van/vanStale ship together, never alone.
 *
 * Motion (the spring-eased marker movement DESIGN-SYSTEM.md specifies) is a
 * deferred nice-to-have, not required here - the marker jumps to each new
 * position as it arrives.
 */
export default function ParentRide({ status, position, childName }: Props) {
  const isLive = status === 'live';

  return (
    <div style={{ position: 'relative', minHeight: '100%', flex: 1, overflow: 'hidden', background: '#E9E9E4' }}>
      {hasMapboxToken ? (
        <BaseMap>
          {position ? (
            <Marker longitude={position.lon} latitude={position.lat}>
              <MapMarker kind={isLive ? 'van' : 'vanStale'} size={50} />
            </Marker>
          ) : null}
        </BaseMap>
      ) : (
        <MapPlaceholder />
      )}

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
            {isLive ? `${childName} is on the way` : 'Signal lost'}
          </div>
          <div style={{ marginTop: 8 }}>
            <LivenessDot state={isLive ? 'ok' : 'stale'} label={isLive ? 'Live · updated seconds ago' : 'The ride is still on'} />
          </div>
        </div>

        <div style={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', padding: '16px 20px 20px' }}>
          <Timeline
            stale={!isLive}
            steps={[
              { label: `Picked up ${childName}`, state: 'done' },
              { label: 'On the way to the gym', state: 'current' },
              { label: "Arrives at Gina's Gymnastics", state: 'future' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

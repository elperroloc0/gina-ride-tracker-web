import { useEffect, useState } from 'react';
import { Marker } from '@vis.gl/react-mapbox';
import { LivenessDot, MapMarker } from 'gina-ride-tracker-ds';
import { getVans } from '../../api/client';
import type { VanDTO } from '../../api/types';
import { BaseMap } from '../../map/BaseMap';
import { MapPlaceholder } from '../../map/MapPlaceholder';
import { hasMapboxToken } from '../../map/mapboxToken';
import { isStale } from '../../ws/staleness';
import type { VanPosition } from '../../ws/vanSocket';

type Props = {
  positions: Record<number, VanPosition>;
};

/**
 * The Live section: every van's current position, plus a small readable list
 * since a bare map pin can't carry a name or a timestamp. The mockup's fuller
 * live panel (speed, a zone-events feed) needs data this phase doesn't derive
 * (speed between two fixes, an events change-feed) - deferred, the same way
 * phase 2 deferred marker motion.
 */
export function VanMap({ positions }: Props) {
  const [vans, setVans] = useState<VanDTO[]>([]);
  // Ticks every few seconds so a van's marker/row flips to stale on its own,
  // even with no new position arriving to trigger a re-render - Date.now()
  // only ever gets called from this interval, never directly during render.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    getVans().then(setVans);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {hasMapboxToken ? (
        <BaseMap>
          {Object.values(positions).map((p) => (
            <Marker key={p.van_id} longitude={p.lon} latitude={p.lat}>
              <MapMarker kind={isStale(p.device_time, now) ? 'vanStale' : 'van'} size={44} />
            </Marker>
          ))}
        </BaseMap>
      ) : (
        <MapPlaceholder />
      )}

      <div
        style={{
          position: 'absolute',
          left: 116,
          bottom: 20,
          background: 'var(--surface)',
          borderRadius: 'var(--r-card)',
          boxShadow: '0 12px 28px rgba(0,0,0,0.16)',
          padding: 14,
          minWidth: 220,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)' }}>
          Vans
        </div>
        {vans.length === 0 ? (
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>No vans yet.</p>
        ) : (
          vans.map((van) => {
            const position = positions[van.id];
            const live = position != null && !isStale(position.device_time, now);
            return (
              <LivenessDot
                key={van.id}
                state={live ? 'ok' : 'stale'}
                label={`${van.name} · ${position ? (live ? 'Live' : 'Signal lost') : 'No signal yet'}`}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

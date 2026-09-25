import { useEffect, useMemo, useState } from 'react';
import { Layer, Marker, Source, type MapMouseEvent } from '@vis.gl/react-mapbox';
import { Icon, LivenessDot } from 'gina-ride-tracker-ds';
import { getChildren, getChildTrail, getGeoFences, getRoutes, getVans } from '../../api/client';
import type { GeoFenceDTO, VanDTO } from '../../api/types';
import { compassLabel } from '../../domain/compass';
import { timeAgo } from '../../domain/timeAgo';
import { BaseMap } from '../../map/BaseMap';
import type { LngLat } from '../../map/directions';
import { geoFenceToPolygon } from '../../map/geofenceCircle';
import { MapPlaceholder } from '../../map/MapPlaceholder';
import { MapPopup } from '../../map/MapPopup';
import { hasMapboxToken } from '../../map/mapboxToken';
import { useSmoothPosition } from '../../map/useSmoothPosition';
import { useVanTrail } from '../../map/useVanTrail';
import { VanSprite } from '../../map/VanSprite';
import { DEFAULT_VIEW_STATE } from '../../map/viewState';
import { isStale } from '../../ws/staleness';
import type { VanPosition } from '../../ws/vanSocket';
import { VanStatusCard } from './VanStatusCard';

type Props = {
  positions: Record<number, VanPosition>;
};

type Selected = { kind: 'van'; id: number } | { kind: 'geofence'; id: number };

/**
 * The Live section: every van's current position, plus a small readable list
 * since a bare map pin can't carry a name or a timestamp. The mockup's fuller
 * live panel (a zone-events feed) needs data this phase doesn't derive (an
 * events change-feed) - deferred. Marker motion and click-for-details are not
 * deferred anymore - see useSmoothPosition and MapPopup.
 */
export function VanMap({ positions }: Props) {
  const [vans, setVans] = useState<VanDTO[]>([]);
  const [geoFences, setGeoFences] = useState<GeoFenceDTO[]>([]);
  // Where each van's current ride started, so a reload redraws the whole path.
  const [histories, setHistories] = useState<Record<number, LngLat[]>>({});
  const [selected, setSelected] = useState<Selected | null>(null);
  // Which van's row in the floating "Vans" panel is expanded to show its
  // full status (engine/fuel/speed/heading) - independent of `selected`
  // above, which drives the map popup, not this panel.
  const [expandedVanId, setExpandedVanId] = useState<number | null>(null);
  // Starts null (not DEFAULT_VIEW_STATE) so the map waits for the gym's real
  // geofence rather than momentarily flashing a generic Miami-wide view -
  // Mapbox only reads BaseMap's initialViewState once, at mount.
  const [mapCenter, setMapCenter] = useState<{ longitude: number; latitude: number; zoom: number } | null>(null);
  // Ticks every few seconds so a van's marker/row flips to stale on its own,
  // even with no new position arriving to trigger a re-render - Date.now()
  // only ever gets called from this interval, never directly during render.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    getVans().then(setVans);
    getGeoFences().then((fences) => {
      setGeoFences(fences);
      const gym = fences.find((f) => f.location_type === 'GYM');
      setMapCenter(
        gym ? { longitude: Number(gym.longitude), latitude: Number(gym.latitude), zoom: 13 } : DEFAULT_VIEW_STATE,
      );
    });
  }, []);

  useEffect(() => {
    Promise.all([getChildren(), getRoutes()])
      .then(([children, routes]) => {
        const vanByRoute = new Map(routes.map((r) => [r.id, r.van]));
        // One child per van is enough - children sharing a van share its path.
        const childForVan = new Map<number, number>();
        for (const child of children) {
          const vanId = vanByRoute.get(child.route);
          if (child.ride_active && vanId != null && !childForVan.has(vanId)) childForVan.set(vanId, child.id);
        }
        for (const [vanId, childId] of childForVan) {
          getChildTrail(childId)
            .then((fixes) =>
              setHistories((prev) => ({ ...prev, [vanId]: fixes.map((f): LngLat => [f.lon, f.lat]) })),
            )
            .catch(() => {});
        }
      })
      .catch(() => {
        // Without history the trail just starts from the van's current position.
      });
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);

  // Keyed on geoFences, not positions - positions changes on every websocket
  // tick, and recomputing a turf circle polygon per tick would be wasted work
  // for a shape that never moves.
  const geoFencePolygons = useMemo(
    () => geoFences.filter((g) => g.is_active).map((g) => ({ id: g.id, polygon: geoFenceToPolygon(g) })),
    [geoFences],
  );
  const geoFenceById = useMemo(() => new Map(geoFences.map((g) => [g.id, g])), [geoFences]);
  const vanById = useMemo(() => new Map(vans.map((v) => [v.id, v])), [vans]);

  const geofenceLayerIds = geoFencePolygons.map(({ id }) => `geofence-fill-${id}`);

  function onMapClick(e: MapMouseEvent) {
    const feature = e.features?.[0];
    if (!feature) return;
    const geoFenceId = feature.properties?.geoFenceId;
    if (typeof geoFenceId === 'number') setSelected({ kind: 'geofence', id: geoFenceId });
  }

  const selectedGeoFence = selected?.kind === 'geofence' ? geoFenceById.get(selected.id) : undefined;
  const selectedVanPosition = selected?.kind === 'van' ? positions[selected.id] : undefined;

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {hasMapboxToken && mapCenter ? (
        <BaseMap initialViewState={mapCenter} interactiveLayerIds={geofenceLayerIds} onClick={onMapClick}>
          {geoFencePolygons.map(({ id, polygon }) => (
            <Source key={id} id={`geofence-${id}`} type="geojson" data={polygon}>
              <Layer
                id={`geofence-fill-${id}`}
                type="fill"
                paint={{ 'fill-color': '#1A18F0', 'fill-opacity': 0.1 }}
              />
              <Layer
                id={`geofence-line-${id}`}
                type="line"
                paint={{ 'line-color': '#1A18F0', 'line-width': 2 }}
              />
            </Source>
          ))}

          {Object.values(positions).map((p) => (
            <LiveVan
              key={p.van_id}
              position={p}
              history={histories[p.van_id]}
              stale={isStale(p.device_time, now)}
              onSelect={() => setSelected({ kind: 'van', id: p.van_id })}
            />
          ))}

          {selectedGeoFence ? (
            <MapPopup
              longitude={Number(selectedGeoFence.longitude)}
              latitude={Number(selectedGeoFence.latitude)}
              onClose={() => setSelected(null)}
            >
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{selectedGeoFence.name}</div>
              <div style={{ color: 'var(--muted)' }}>
                {selectedGeoFence.location_type === 'SCHOOL' ? 'School' : 'Gym'} · {selectedGeoFence.radius}m radius
              </div>
            </MapPopup>
          ) : null}

          {selectedVanPosition ? (
            <MapPopup
              longitude={selectedVanPosition.lon}
              latitude={selectedVanPosition.lat}
              onClose={() => setSelected(null)}
            >
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{vanById.get(selectedVanPosition.van_id)?.name ?? `Van #${selectedVanPosition.van_id}`}</div>
              <div style={{ color: isStale(selectedVanPosition.device_time, now) ? 'var(--alert)' : 'var(--ok)' }}>
                {isStale(selectedVanPosition.device_time, now) ? 'Signal lost' : 'Live'}
              </div>
              <div style={{ color: 'var(--muted)' }}>
                Updated {timeAgo(selectedVanPosition.device_time, now)}
                {selectedVanPosition.course != null ? ` · Heading ${compassLabel(selectedVanPosition.course)}` : ''}
              </div>
            </MapPopup>
          ) : null}
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
            const expanded = expandedVanId === van.id;
            return (
              <div key={van.id}>
                <button
                  type="button"
                  onClick={() => setExpandedVanId(expanded ? null : van.id)}
                  aria-expanded={expanded}
                  style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 8, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <LivenessDot
                      state={live ? 'ok' : 'stale'}
                      label={`${van.name} · ${position ? (live ? 'Live' : 'Signal lost') : 'No signal yet'}`}
                    />
                  </span>
                  <span style={{ display: 'flex', flexShrink: 0, color: 'var(--muted)', transform: expanded ? 'rotate(90deg)' : undefined }}>
                    <Icon name="chevron" size={16} />
                  </span>
                </button>
                {expanded ? <VanStatusCard position={position} /> : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/** One `useSmoothPosition` per van - hooks can't run inside the `.map()` loop
 * above, so each van is its own component instance. The marker and its trail
 * share the smoothed position, so the line always ends exactly under the van
 * and grows as it moves, instead of jumping per GPS fix. */
function LiveVan({
  position,
  history,
  stale,
  onSelect,
}: {
  position: VanPosition;
  history?: LngLat[];
  stale: boolean;
  onSelect: () => void;
}) {
  const animated = useSmoothPosition({ lat: position.lat, lon: position.lon })!;
  const trail = useVanTrail(animated, history);
  const line: LngLat[] = [...trail, [animated.lon, animated.lat]];
  const moved = line.some((c) => c[0] !== line[0][0] || c[1] !== line[0][1]);
  return (
    <>
      {moved ? (
        <Source
          id={`van-trail-${position.van_id}`}
          type="geojson"
          data={{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: line } }}
        >
          <Layer
            id={`van-trail-casing-${position.van_id}`}
            type="line"
            layout={{ 'line-join': 'round', 'line-cap': 'round' }}
            paint={{ 'line-color': '#FFFFFF', 'line-width': 7 }}
          />
          <Layer
            id={`van-trail-line-${position.van_id}`}
            type="line"
            layout={{ 'line-join': 'round', 'line-cap': 'round' }}
            paint={{ 'line-color': '#1A18F0', 'line-width': 4 }}
          />
        </Source>
      ) : null}
      <Marker longitude={animated.lon} latitude={animated.lat} onClick={onSelect}>
        <VanSprite stale={stale} size={56} course={position.course} />
      </Marker>
    </>
  );
}

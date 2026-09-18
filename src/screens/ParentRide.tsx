import { useEffect, useMemo, useState } from 'react';
import { LivenessDot, Timeline } from 'gina-ride-tracker-ds';
import { Layer, Marker, Source } from '@vis.gl/react-mapbox';
import { compassLabel } from '../domain/compass';
import { timeAgo } from '../domain/timeAgo';
import { BaseMap } from '../map/BaseMap';
import { geoFenceToPolygon } from '../map/geofenceCircle';
import { MapPlaceholder } from '../map/MapPlaceholder';
import { MapPopup } from '../map/MapPopup';
import { hasMapboxToken } from '../map/mapboxToken';
import { useSpringPosition } from '../map/useSpringPosition';
import { useVanTrail } from '../map/useVanTrail';
import { VanSprite } from '../map/VanSprite';
import type { GeoFenceDTO } from '../api/types';
import type { ViewState } from '../map/viewState';
import type { VanPosition } from '../ws/vanSocket';

/** How close in the camera starts once centered on the van - same level
 * VanMap.tsx uses for centering on a single point. */
const INITIAL_VAN_ZOOM = 13;

type Props = {
  status: 'live' | 'stale';
  position: VanPosition | null;
  childName: string;
  originFence?: GeoFenceDTO;
  destinationFence?: GeoFenceDTO;
};

/**
 * The live/lost-signal state of the parent app - matches design/ParentLive.dc.html
 * and design/ParentStale.dc.html. One component for both (not two files): they
 * share the same map/timeline chrome and differ only in VanSprite's stale prop,
 * LivenessDot state, and copy.
 *
 * Marker motion (spring-eased per DESIGN-SYSTEM.md) and click-for-details
 * (van/geofence) mirror VanMap.tsx's operator-console implementation -
 * see useSpringPosition/MapPopup for the shared pieces.
 */
export default function ParentRide({ status, position, childName, originFence, destinationFence }: Props) {
  const isLive = status === 'live';
  const [selected, setSelected] = useState<'van' | 'origin' | 'destination' | null>(null);
  const [now, setNow] = useState(() => Date.now());
  // The actual path driven so far, not a planned route (see useVanTrail's
  // own doc comment on why this needs no unmount cleanup of its own): this
  // socket only stays open while the ride is active, so the trail exists
  // only as long as the ride does, and empties again the moment
  // ParentRide unmounts for ParentIdle - "included only during a specific
  // route" the way a planned-route line drawn unconditionally never was.
  const trail = useVanTrail(position);
  // Captured once, from whatever position exists the first time this
  // component sees one - never recomputed afterward. BaseMap only reads
  // initialViewState at mount, so re-deriving this on every tick wouldn't
  // move the camera anyway; the real reason it's "once" and not "every
  // tick" is that a live-following camera would fight a parent who pans or
  // zooms to look around. Before this, the map always opened on
  // DEFAULT_VIEW_STATE (all of Miami) and the van could easily be off
  // frame - this is what puts it in view at all when the ride starts.
  const [initialViewState, setInitialViewState] = useState<ViewState | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (position && !initialViewState) {
      setInitialViewState({ longitude: position.lon, latitude: position.lat, zoom: INITIAL_VAN_ZOOM });
    }
  }, [position, initialViewState]);

  const originPolygon = useMemo(() => (originFence ? geoFenceToPolygon(originFence) : null), [originFence]);
  const destinationPolygon = useMemo(() => (destinationFence ? geoFenceToPolygon(destinationFence) : null), [destinationFence]);

  return (
    <div style={{ position: 'relative', minHeight: '100%', flex: 1, overflow: 'hidden', background: '#E9E9E4' }}>
      {hasMapboxToken && initialViewState ? (
        <BaseMap
          initialViewState={initialViewState}
          interactiveLayerIds={[
            ...(originPolygon ? ['parent-origin-fill'] : []),
            ...(destinationPolygon ? ['parent-destination-fill'] : []),
          ]}
          onClick={(e) => {
            const layerId = e.features?.[0]?.layer?.id;
            if (layerId === 'parent-origin-fill') setSelected('origin');
            else if (layerId === 'parent-destination-fill') setSelected('destination');
          }}
        >
          {originPolygon ? (
            <Source id="parent-origin" type="geojson" data={originPolygon}>
              <Layer id="parent-origin-fill" type="fill" paint={{ 'fill-color': '#1A18F0', 'fill-opacity': 0.1 }} />
              <Layer id="parent-origin-line" type="line" paint={{ 'line-color': '#1A18F0', 'line-width': 2 }} />
            </Source>
          ) : null}
          {destinationPolygon ? (
            <Source id="parent-destination" type="geojson" data={destinationPolygon}>
              <Layer id="parent-destination-fill" type="fill" paint={{ 'fill-color': '#1A18F0', 'fill-opacity': 0.1 }} />
              <Layer id="parent-destination-line" type="line" paint={{ 'line-color': '#1A18F0', 'line-width': 2 }} />
            </Source>
          ) : null}
          {trail.length >= 2 ? (
            <Source
              id="parent-trail"
              type="geojson"
              data={{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: trail } }}
            >
              {/* Same white-casing-under-blue-line trick the old static route
                  line used - only the source of the coordinates changed. */}
              <Layer
                id="parent-trail-casing"
                type="line"
                layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                paint={{ 'line-color': '#FFFFFF', 'line-width': 7 }}
              />
              <Layer
                id="parent-trail-line"
                type="line"
                layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                paint={{ 'line-color': '#1A18F0', 'line-width': 4 }}
              />
            </Source>
          ) : null}

          {position ? (
            <AnimatedVanMarker
              position={position}
              isLive={isLive}
              childName={childName}
              now={now}
              selected={selected === 'van'}
              onSelect={() => setSelected('van')}
              onDeselect={() => setSelected(null)}
            />
          ) : null}

          {selected === 'origin' && originFence ? (
            <MapPopup longitude={Number(originFence.longitude)} latitude={Number(originFence.latitude)} onClose={() => setSelected(null)}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{originFence.name}</div>
              <div style={{ color: 'var(--muted)' }}>School · {originFence.radius}m radius</div>
            </MapPopup>
          ) : null}

          {selected === 'destination' && destinationFence ? (
            <MapPopup longitude={Number(destinationFence.longitude)} latitude={Number(destinationFence.latitude)} onClose={() => setSelected(null)}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{destinationFence.name}</div>
              <div style={{ color: 'var(--muted)' }}>Gym · {destinationFence.radius}m radius</div>
            </MapPopup>
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

/** Owns the spring so it only seeds from a real position - mounting only once
 * `position` exists avoids animating in from a fake (0,0) fallback. Mirrors
 * VanMap.tsx's AnimatedVanMarker, plus the van's own popup since it needs the
 * same animated coordinates as the anchor. */
function AnimatedVanMarker({
  position,
  isLive,
  childName,
  now,
  selected,
  onSelect,
  onDeselect,
}: {
  position: VanPosition;
  isLive: boolean;
  childName: string;
  now: number;
  selected: boolean;
  onSelect: () => void;
  onDeselect: () => void;
}) {
  const animated = useSpringPosition({ lat: position.lat, lon: position.lon });
  return (
    <>
      <Marker longitude={animated.lon} latitude={animated.lat} onClick={onSelect}>
        <VanSprite stale={!isLive} size={50} course={position.course} />
      </Marker>
      {selected ? (
        <MapPopup longitude={animated.lon} latitude={animated.lat} onClose={onDeselect}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{childName}&rsquo;s van</div>
          <div style={{ color: isLive ? 'var(--ok)' : 'var(--alert)' }}>{isLive ? 'Live' : 'Signal lost'}</div>
          <div style={{ color: 'var(--muted)' }}>
            Updated {timeAgo(position.device_time, now)}
            {position.course != null ? ` · Heading ${compassLabel(position.course)}` : ''}
          </div>
        </MapPopup>
      ) : null}
    </>
  );
}

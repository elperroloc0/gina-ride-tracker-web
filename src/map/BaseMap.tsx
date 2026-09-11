import type { ReactNode } from 'react';
import { Map } from '@vis.gl/react-mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { mapboxToken } from './mapboxToken';

type Props = {
  /** Markers, geofence layers, etc. drawn on top of the base map. */
  children?: ReactNode;
};

/**
 * The real basemap (MapMarker.tsx: "the basemap under them is Mapbox in the
 * product"). Callers should check `hasMapboxToken` first and render
 * `MapPlaceholder` instead when it's false - this component assumes a token
 * is present and doesn't itself guard against a missing one.
 *
 * `light-v11` is Mapbox's stock light style, picked as a starting point close
 * to the app's desaturated warm-grey palette; a custom Mapbox Studio style
 * (built in Mapbox's own editor, not something to hand-author here) is the
 * way to match it exactly later.
 *
 * The initial view centers on Miami generally - real geofence coordinates
 * come from `fleet.GeoFence` once that endpoint exists (DESIGN-SYSTEM.md
 * "Связь с моделями бэкенда"), so this is a placeholder camera, not a
 * claim about where any specific gym or school actually is.
 */
export function BaseMap({ children }: Props) {
  return (
    <Map
      mapboxAccessToken={mapboxToken}
      mapStyle="mapbox://styles/mapbox/light-v11"
      initialViewState={{ longitude: -80.1918, latitude: 25.7617, zoom: 11 }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      {children}
    </Map>
  );
}

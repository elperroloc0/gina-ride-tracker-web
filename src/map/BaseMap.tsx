import type { ReactNode } from 'react';
import { Map, type MapMouseEvent } from '@vis.gl/react-mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { mapboxToken } from './mapboxToken';
import { DEFAULT_VIEW_STATE, MIN_ZOOM, type ViewState } from './viewState';

type Props = {
  /** Markers, geofence layers, etc. drawn on top of the base map. */
  children?: ReactNode;
  /** Layer ids (e.g. geofence fills, route lines) that should populate
   * e.features on a click - mapbox-gl's own pattern for making a Source/Layer
   * clickable, since neither has a click prop of its own. */
  interactiveLayerIds?: string[];
  onClick?: (e: MapMouseEvent) => void;
  /** Where the camera starts - Mapbox only reads this once, at mount, so a
   * caller with async data (e.g. a geofence fetched from the API) should wait
   * for it before rendering BaseMap at all, rather than pass it in late. */
  initialViewState?: ViewState;
  /** How far out the camera can go - defaults to MIN_ZOOM everywhere (see
   * its own doc comment) so no caller has to remember to set this
   * individually. Override only if a specific map genuinely needs a
   * different range. */
  minZoom?: number;
  maxZoom?: number;
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
 * Defaults to `DEFAULT_VIEW_STATE` (Miami generally) when a caller doesn't
 * pass its own - see that constant's doc comment.
 */
export function BaseMap({
  children,
  interactiveLayerIds,
  onClick,
  initialViewState = DEFAULT_VIEW_STATE,
  minZoom = MIN_ZOOM,
  maxZoom,
}: Props) {
  return (
    <Map
      mapboxAccessToken={mapboxToken}
      mapStyle="mapbox://styles/mapbox/light-v11"
      initialViewState={initialViewState}
      minZoom={minZoom}
      maxZoom={maxZoom}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      interactiveLayerIds={interactiveLayerIds}
      onClick={onClick}
    >
      {children}
    </Map>
  );
}

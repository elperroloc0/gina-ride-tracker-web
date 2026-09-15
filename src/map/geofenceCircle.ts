import circle from '@turf/circle';
import type { Feature, Polygon } from 'geojson';
import type { GeoFenceDTO } from '../api/types';

/** GeoFence.radius is meters around a point (fleet/models.py) - turf draws
 * the actual circle polygon so it renders correctly at any zoom level,
 * rather than a fixed-pixel marker that wouldn't scale with the map. */
export function geoFenceToPolygon(fence: GeoFenceDTO): Feature<Polygon> {
  return circle([Number(fence.longitude), Number(fence.latitude)], fence.radius, {
    steps: 64,
    units: 'meters',
    // Read back from e.features[0].properties on a map click to identify
    // which geofence was hit - see VanMap.tsx's interactiveLayerIds handler.
    properties: { geoFenceId: fence.id },
  });
}

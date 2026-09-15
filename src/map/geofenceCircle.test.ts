import { describe, expect, it } from 'vitest';
import type { GeoFenceDTO } from '../api/types';
import { geoFenceToPolygon } from './geofenceCircle';

const FENCE: GeoFenceDTO = {
  id: 42,
  name: 'School',
  location_type: 'SCHOOL',
  latitude: '25.7',
  longitude: '-80.2',
  radius: 50,
  traccar_id: 1,
  is_active: true,
};

describe('geoFenceToPolygon', () => {
  it('tags the polygon with the geofence id, for VanMap/ParentRide click handlers to read back', () => {
    const polygon = geoFenceToPolygon(FENCE);
    expect(polygon.properties).toEqual({ geoFenceId: 42 });
    expect(polygon.geometry.type).toBe('Polygon');
  });
});

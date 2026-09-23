import { mapboxToken } from './mapboxToken';

/** [longitude, latitude] pairs along the real road path. */
export type LngLat = [number, number];

const cache = new Map<string, LngLat[]>();

/**
 * A route's origin/destination rarely changes, so the result is cached for
 * the life of the page rather than refetched on every render - Mapbox's
 * Directions API is metered, and this call is client-side only (no backend
 * storage of the path, by design). The key includes the coordinates, not
 * just the route id: when an operator edits a route's origin/destination
 * the id stays the same, and an id-only key kept drawing the old line.
 */
export async function getRouteLine(routeId: number, origin: LngLat, destination: LngLat): Promise<LngLat[]> {
  const coords = `${origin.join(',')};${destination.join(',')}`;
  const key = `${routeId}:${coords}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&access_token=${mapboxToken}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Directions request failed: ${res.status}`);

  const body = (await res.json()) as { routes?: { geometry?: { coordinates?: LngLat[] } }[] };
  const line = body.routes?.[0]?.geometry?.coordinates ?? [];
  cache.set(key, line);
  return line;
}

import { mapboxToken } from './mapboxToken';

/** [longitude, latitude] pairs along the real road path. */
export type LngLat = [number, number];

const cache = new Map<number, LngLat[]>();

/**
 * A route's origin/destination almost never changes, so the result is
 * cached by route id for the life of the page rather than refetched on
 * every render - Mapbox's Directions API is metered, and this call is
 * client-side only (no backend storage of the path, by design).
 */
export async function getRouteLine(routeId: number, origin: LngLat, destination: LngLat): Promise<LngLat[]> {
  const cached = cache.get(routeId);
  if (cached) return cached;

  const coords = `${origin.join(',')};${destination.join(',')}`;
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&access_token=${mapboxToken}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Directions request failed: ${res.status}`);

  const body = (await res.json()) as { routes?: { geometry?: { coordinates?: LngLat[] } }[] };
  const line = body.routes?.[0]?.geometry?.coordinates ?? [];
  cache.set(routeId, line);
  return line;
}

export type ViewState = { longitude: number; latitude: number; zoom: number };

/** Miami generally - only ever shown before a caller has anything more
 * specific to center on (e.g. VanMap briefly, while its geofences are still
 * loading), never a claim about where any actual gym or school is. */
export const DEFAULT_VIEW_STATE: ViewState = { longitude: -80.1918, latitude: 25.7617, zoom: 11 };

/**
 * A view centered on and roughly fitting two points - ParentIdle's school
 * and gym geofences, before any ride is active. Not a real Mapbox
 * fitBounds(): BaseMap doesn't expose a map ref for that, and
 * initialViewState is only ever read once at mount anyway (see BaseMap's
 * own doc comment), so there's nothing to imperatively re-fit later. A
 * midpoint + distance-derived zoom is close enough for two points a normal
 * school-to-gym commute apart, and this deliberately errs toward zooming
 * out a little rather than clipping either point off-screen.
 */
export function fitViewState(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): ViewState {
  const longitude = (a.longitude + b.longitude) / 2;
  const latitude = (a.latitude + b.latitude) / 2;

  const latSpan = Math.abs(a.latitude - b.latitude);
  // Degrees of longitude shrink toward the poles - correcting for that so
  // an east-west span isn't under-weighted at this latitude.
  const lonSpan = Math.abs(a.longitude - b.longitude) * Math.cos((latitude * Math.PI) / 180);
  const span = Math.max(latSpan, lonSpan, 0.001);

  // Mapbox's own convention: at zoom Z, 360 degrees of longitude spans
  // TILE_SIZE_PX * 2^Z pixels. Solving that for the zoom where `span`
  // degrees fills a phone-width viewport (~380px, matching PhoneShell's
  // max-width) is what actually makes two points a few km apart (a normal
  // school-to-gym commute) end up at a sensible zoom - the earlier version
  // of this function used log2(360 / span) alone, which ignores viewport
  // width entirely and put a real 3-4km pair at zoom ~11 (their ~50-100m
  // geofence circles were barely visible pixels). Backing off half a level
  // leaves breathing room around both points instead of pinning them to
  // the viewport's edges.
  const VIEWPORT_PX = 380;
  const TILE_SIZE_PX = 512;
  const zoom = Math.log2((VIEWPORT_PX * 360) / (span * TILE_SIZE_PX)) - 0.5;

  return { longitude, latitude, zoom: Math.min(Math.max(zoom, 10), 14) };
}

/**
 * Mapbox needs a public access token (starts `pk.`) from a Mapbox account -
 * https://account.mapbox.com/access-tokens/. It is not a secret in the usual
 * sense (it ships to the browser either way and is scoped/rate-limited on
 * Mapbox's side), but it is still per-project config, not something to
 * hardcode: put it in `.env.local` (gitignored, see `.env.example`) as
 * `VITE_MAPBOX_TOKEN=pk....`.
 *
 * Every place that draws a map should check `hasMapboxToken` and fall back to
 * `MapPlaceholder` when it's false, rather than letting mapbox-gl throw.
 */
export const mapboxToken: string = import.meta.env.VITE_MAPBOX_TOKEN ?? '';

export const hasMapboxToken = mapboxToken.length > 0;

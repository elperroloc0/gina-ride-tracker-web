export type ViewState = { longitude: number; latitude: number; zoom: number };

/** Miami generally - only ever shown before a caller has anything more
 * specific to center on (e.g. VanMap briefly, while its geofences are still
 * loading), never a claim about where any actual gym or school is. */
export const DEFAULT_VIEW_STATE: ViewState = { longitude: -80.1918, latitude: 25.7617, zoom: 11 };

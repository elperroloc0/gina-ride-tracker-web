import * as React from 'react';

export interface MapMarkerProps extends React.SVGProps<SVGSVGElement> {
  /**
   * `school` — the pickup point.
   * `gym` — the drop-off point.
   * `van` — the live position, with its accuracy halo.
   * `vanStale` — the last known position: greyed, with a dashed uncertainty ring.
   * Ship `van` and `vanStale` together or neither; one alone cannot show that the feed died.
   */
  kind: 'school' | 'gym' | 'van' | 'vanStale';
  /** Rendered size in px. @default 60 */
  size?: number;
}

const VAN_GLYPH = (
  <>
    <path d="M22.5 28.5h8.5v5.5h-8.5z" fill="#FFF" />
    <path d="M31 30.5h3.5l2.2 2.2v1.3H31z" fill="#FFF" />
  </>
);

/**
 * A branded map pin, drawn on a 60x60 grid. These are the real markers; the
 * basemap under them is Mapbox in the product, so this ships the pins only.
 *
 * @example
 * <MapMarker kind="van" />
 */
export function MapMarker({ kind, size = 60, className, ...rest }: MapMarkerProps) {
  return (
    <svg
      viewBox="0 0 60 60"
      width={size}
      height={size}
      aria-hidden="true"
      className={['gds-marker', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {kind === 'school' ? (
        <>
          <circle cx="30" cy="30" r="11" fill="#FFF" stroke="#17171A" strokeWidth="2.4" />
          <path d="M25 31v-5l5-3.5 5 3.5v5" stroke="#17171A" strokeWidth="1.9" fill="none" strokeLinejoin="round" />
        </>
      ) : null}
      {kind === 'gym' ? (
        <>
          <circle cx="30" cy="30" r="12" fill="#1A18F0" stroke="#FFF" strokeWidth="2.4" />
          <path d="M26 30l3 3.2 5-5.4" stroke="#FFF" strokeWidth="2.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : null}
      {kind === 'van' ? (
        <>
          <circle cx="30" cy="30" r="26" fill="#1A18F0" fillOpacity="0.16" />
          <circle cx="30" cy="30" r="16" fill="#17171A" stroke="#FFF" strokeWidth="3" />
          {VAN_GLYPH}
        </>
      ) : null}
      {kind === 'vanStale' ? (
        <>
          <circle cx="30" cy="30" r="25" fill="none" stroke="#6E6E73" strokeWidth="1.6" strokeOpacity="0.55" strokeDasharray="5 5" />
          <circle cx="30" cy="30" r="16" fill="#6E6E73" stroke="#FFF" strokeWidth="3" />
          {VAN_GLYPH}
        </>
      ) : null}
    </svg>
  );
}

type Props = {
  /** Grey treatment for a signal-lost van, matching MapMarker's vanStale. */
  stale?: boolean;
  /** Rendered diameter in px. */
  size?: number;
  /** Course over ground in degrees, 0 = north/up. Null/omitted = no heading known, arrow hidden. */
  course?: number | null;
};

/**
 * The classic nav-app "puck": a solid dot plus a small heading arrow that
 * rotates to course. Tried a photo-real rendered van sprite first (see git
 * history) - it read as flat/plastic-looking at marker scale and didn't
 * actually benefit from being "3D" once reduced to ~50px, so this reverts to
 * the same colored-circle language every major map app actually uses.
 */
export function VanSprite({ stale = false, size = 44, course }: Props) {
  const puckColor = stale ? '#6E6E73' : '#1A18F0';

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        transform: course != null ? `rotate(${course}deg)` : undefined,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))',
      }}
    >
      <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden="true">
        {course != null ? (
          <path d="M22 3 L30 20 L22 15.5 L14 20 Z" fill="#FFFFFF" />
        ) : null}
        <circle cx="22" cy="22" r="12" fill={puckColor} stroke="#FFFFFF" strokeWidth="3" />
      </svg>
    </div>
  );
}

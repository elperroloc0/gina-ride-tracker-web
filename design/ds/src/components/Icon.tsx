import * as React from 'react';

/** The 16 icons in the system. Emoji are never used in this interface. */
export type IconName =
  | 'van' | 'pin' | 'school' | 'phone' | 'mail' | 'bell' | 'clock' | 'alert'
  | 'search' | 'pencil' | 'chevron' | 'arrow' | 'eye' | 'plus' | 'check' | 'logo';

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'name'> {
  /** Which glyph to draw. */
  name: IconName;
  /** Icon grid. The system draws on 16, 20 or 24 only. @default 24 */
  size?: 16 | 20 | 24;
}

const GLYPHS: Record<IconName, React.ReactNode> = {
  van: (<>
    <path d="M2 8.5A1.5 1.5 0 0 1 3.5 7h9A1.5 1.5 0 0 1 14 8.5V16H2V8.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M14 10.5h3.6l3.4 3.6V16h-7v-5.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <circle cx="6" cy="16.5" r="2" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="17" cy="16.5" r="2" stroke="currentColor" strokeWidth="1.7" />
  </>),
  pin: (<>
    <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
    <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.9" />
  </>),
  school: (<>
    <path d="M4 20V9.5L12 5l8 4.5V20" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M9.5 20v-5h5v5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </>),
  phone: (<path d="M6.5 4h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5L16 13l4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />),
  mail: (<>
    <rect x="3" y="5.5" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M4 7l8 5.5L20 7" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </>),
  bell: (<>
    <path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M10 19a2.2 2.2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </>),
  clock: (<>
    <path d="M12 8v4l2.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
  </>),
  alert: (<>
    <path d="M12 8v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="16.5" r="1.2" fill="currentColor" />
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
  </>),
  search: (<>
    <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.9" />
    <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
  </>),
  pencil: (<path d="M4 20l4-1 10.5-10.5a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />),
  chevron: (<path d="M6 9.5l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />),
  arrow: (<>
    <path d="M14 5l7 7-7 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 12H4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
  </>),
  eye: (<>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
  </>),
  plus: (<path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />),
  check: (<path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />),
  // Traced from the real mark (ginas-gymnastic-mark-white-one) at its native
  // 447x448 resolution, scaled into the 24x24 grid via this wrapping
  // transform rather than hand-converting every path coordinate.
  logo: (
    <g transform="scale(0.05357)">
      <path
        d="M 209.500 0.630 C 141.609 6.259, 82.679 38.268, 44.046 90.500 C 22.945 119.029, 9.747 149.480, 2.872 185.500 C 0.234 199.323, -0.826 233.712, 0.923 248.753 C 4.844 282.483, 17.981 319.369, 35.736 346.500 C 72.605 402.839, 132.639 439.606, 199.890 447.032 C 215.757 448.784, 246.081 447.801, 261 445.051 C 308.230 436.344, 345.093 417.958, 377.362 387.014 C 410.425 355.309, 433.802 313.555, 442.477 270.712 C 443.864 263.857, 445 257.299, 445 256.138 C 445 253.708, 443.234 252.848, 426.021 246.891 C 393.295 235.566, 363.183 231.351, 321.651 232.282 C 295.655 232.864, 276.327 235.165, 252.500 240.513 C 214.384 249.069, 185.410 264.680, 156.250 292.370 C 152.262 296.156, 149 299.568, 149 299.952 C 149 300.336, 158.147 296.073, 169.327 290.480 C 205.094 272.583, 232.738 265.322, 278 261.935 C 294.828 260.676, 311.724 261.180, 333 263.576 C 346.174 265.059, 369.633 269.300, 370.730 270.396 C 371.603 271.270, 366.161 285.713, 361.459 295 C 329.965 357.209, 259.025 390.796, 190.488 375.947 C 115.177 359.630, 61.964 287.792, 68.905 211.809 C 72.181 175.944, 86.586 143.633, 110.738 117.977 C 143.864 82.787, 190.952 65.055, 238.312 69.938 C 275.010 73.722, 304.439 87.427, 331.761 113.457 L 342.213 123.414 369.356 123.511 C 389.163 123.581, 400.106 124.086, 409.842 125.378 C 417.181 126.352, 423.397 126.937, 423.656 126.678 C 424.417 125.916, 416.216 110.203, 410.254 101 C 398.142 82.305, 377.121 59.714, 359.672 46.637 C 328.498 23.274, 292.249 8.029, 254.856 2.554 C 243.995 0.964, 218.514 -0.117, 209.500 0.630 M 351.500 168.622 C 327.939 170.510, 298.700 174.885, 274.500 180.142 C 236.477 188.403, 203.084 203.853, 176 225.718 C 167.162 232.852, 152.227 248.103, 146.056 256.296 C 139.304 265.260, 141.876 265.367, 153.839 256.617 C 186.334 232.852, 224.437 217.947, 270.500 210.981 C 288.666 208.234, 325.048 207.235, 345.157 208.930 C 377.047 211.618, 410.178 219.199, 437.776 230.121 C 441.778 231.704, 445.490 233, 446.026 233 C 446.613 233, 446.998 227.333, 446.994 218.750 C 446.989 205.411, 445.442 190.549, 442.951 179.907 L 441.876 175.314 434.188 173.665 C 417.381 170.059, 405.261 168.896, 381 168.561 C 367.525 168.374, 354.250 168.402, 351.500 168.622"
        fill="currentColor"
        fillRule="evenodd"
      />
    </g>
  ),
};

/**
 * Inline stroke icon. Always inherits `currentColor`, so it recolors with its
 * container — set the color on the parent, never on the icon.
 */
export function Icon({ name, size = 24, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...rest}>
      {GLYPHS[name]}
    </svg>
  );
}

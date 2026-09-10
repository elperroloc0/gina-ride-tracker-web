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
  logo: (<path d="M20.25 7.8A9.75 9.75 0 1 0 21.75 12v-1.05H13.95" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />),
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

import * as React from 'react';

export interface WaveDividerProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Fill colour — always the colour of the section *below* the wave, because the
   * wave is the top edge of that next section drawn over this one.
   * @default 'var(--bg)'
   */
  fill?: string;
  /** 26-30px in the artboards. @default 26 */
  height?: number;
}

/**
 * The brand wave that closes a coloured header. Absolutely positioned on the
 * bottom edge of its (position: relative) parent. Used on parent-facing screens
 * only — it fights the dense grid in the operator console.
 *
 * @example
 * <div style={{ position: 'relative', background: 'var(--blue)' }}>
 *   ...header...
 *   <WaveDivider fill="var(--bg)" />
 * </div>
 */
export function WaveDivider({ fill = 'var(--bg)', height = 26, className, style, ...rest }: WaveDividerProps) {
  return (
    <svg
      viewBox="0 0 390 26"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={['gds-wave', className].filter(Boolean).join(' ')}
      style={{ height, ...style }}
      {...rest}
    >
      <path d="M0 14C60 0 120 0 195 9s135 17 195 3v14H0z" fill={fill} />
    </svg>
  );
}

import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * `now` — filled `--blue`: happening right now (On ride, Running).
   * `scheduled` — `--fill`: planned.
   * `info` — `--blue-tint`: neutral fact.
   * `alert` — `--alert-tint`: needs someone to act. The only red in the system.
   * `onColor` — translucent white, for use on a `--blue` surface; not uppercased.
   * @default 'scheduled'
   */
  tone?: 'now' | 'scheduled' | 'info' | 'alert' | 'onColor';
  /** `md` is 11px (standalone); `sm` is 10px, for inside a dense table row. @default 'md' */
  size?: 'sm' | 'md';
  children?: React.ReactNode;
}

/**
 * Status pill. 11/700 uppercase with 0.05em tracking — these are small, so the
 * tones are the pre-checked contrast pairs; don't recolor them by hand.
 *
 * @example
 * <Badge tone="now">On ride</Badge>
 */
export function Badge({ tone = 'scheduled', size = 'md', children, className, ...rest }: BadgeProps) {
  const cls = ['gds-badge', `gds-badge--${tone}`, `gds-badge--${size}`, className].filter(Boolean).join(' ');
  return <span className={cls} {...rest}>{children}</span>;
}

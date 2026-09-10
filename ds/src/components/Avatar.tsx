import * as React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Initials to show. Two letters read best at every size. */
  initials: string;
  /** 46 = record panel header, 32 = table row, 30 = topbar, 24 = inside a pill. @default 32 */
  size?: 24 | 30 | 32 | 46;
  /**
   * `selected` — filled `--blue`, the active record.
   * `default` — `--line-2` fill with `--muted` text.
   * `alert` — `--alert-tint`, this row needs action.
   * `onColor` — translucent white, for use on a `--blue` surface (the 24px pill case).
   * @default 'default'
   */
  state?: 'default' | 'selected' | 'alert' | 'onColor';
}

/**
 * Round initials chip used to identify a child in lists and headers.
 *
 * @example
 * <Avatar initials="MR" size={32} state="selected" />
 */
export function Avatar({ initials, size = 32, state = 'default', className, ...rest }: AvatarProps) {
  const cls = ['gds-avatar', `gds-avatar--${state}`, `gds-avatar--${size}`, className].filter(Boolean).join(' ');
  return <span className={cls} {...rest}>{initials}</span>;
}

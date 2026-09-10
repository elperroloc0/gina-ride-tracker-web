import * as React from 'react';

export interface LivenessDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** `ok` — data is arriving. `stale` — the stream went quiet and someone must be told. */
  state: 'ok' | 'stale';
  /** Whether it sits on a light surface or the dark console topbar. @default 'light' */
  surface?: 'light' | 'dark';
  /** Optional text beside the dot; renders the whole thing as a labelled row. */
  label?: React.ReactNode;
}

/**
 * 7px liveness dot. Use it only where the state genuinely comes from the backend,
 * and always ship both states — a dot that is only ever green cannot tell a live
 * feed from a frozen one, which is the single thing it exists to do.
 *
 * @example
 * <LivenessDot state="ok" label="Tracker online" />
 */
export function LivenessDot({ state, surface = 'light', label, className, ...rest }: LivenessDotProps) {
  const dot = <span className={`gds-dot gds-dot--${state}`} />;
  if (label == null) {
    const cls = ['gds-dot', `gds-dot--${state}`, className].filter(Boolean).join(' ');
    return <span className={cls} {...rest} />;
  }
  const cls = ['gds-dot-row', `gds-dot-row--${surface}`, className].filter(Boolean).join(' ');
  return <span className={cls} {...rest}>{dot}<span className="gds-dot-label">{label}</span></span>;
}

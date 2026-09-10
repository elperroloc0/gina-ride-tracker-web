import * as React from 'react';

export interface WeekdayChipsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Mon-Fri, in order. `true` marks a day the child rides. */
  active: [boolean, boolean, boolean, boolean, boolean] | boolean[];
  /** `table` is the 22px chip for a console row; `card` is the 30px chip for the mobile card. @default 'table' */
  size?: 'table' | 'card';
  /** Pickup time shown beside the chips, in tabular figures. */
  time?: string;
}

const LETTERS = ['M', 'T', 'W', 'T', 'F'];

/**
 * The visual form of a ChildSchedule: five weekday squares, active days filled
 * `--blue`. Inactive chips sit on `--fill` — not `--line-2`, where the same text
 * drops to 4.35:1.
 *
 * @example
 * <WeekdayChips active={[true, true, false, true, false]} time="3:15 PM" />
 */
export function WeekdayChips({ active, size = 'table', time, className, ...rest }: WeekdayChipsProps) {
  const cls = ['gds-days', `gds-days--${size}`, className].filter(Boolean).join(' ');
  return (
    <div className={cls} {...rest}>
      <div className="gds-days__chips">
        {LETTERS.map((letter, i) => (
          <span key={i} className={`gds-day ${active[i] ? 'is-on' : 'is-off'}`}>{letter}</span>
        ))}
      </div>
      {time ? <span className="gds-days__time">{time}</span> : null}
    </div>
  );
}

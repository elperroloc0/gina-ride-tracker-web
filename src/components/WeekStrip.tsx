const WEEK_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

type Props = {
  /** Sun..Sat. */
  activeDays: [boolean, boolean, boolean, boolean, boolean, boolean, boolean];
};

/**
 * A 7-day (Sun-Sat) pickup-day strip. The design system's own WeekdayChips
 * is hardcoded to 5 weekday chips (Mon-Fri) - see its own doc comment - so
 * this stays a small app-local component instead of forcing that shared one
 * to support a shape only this screen and Schedule.tsx need.
 */
export function WeekStrip({ activeDays }: Props) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {WEEK_LETTERS.map((letter, i) => {
        const on = activeDays[i];
        const isWeekend = i === 0 || i === 6;
        return (
          <div key={i} style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: isWeekend ? 'var(--muted-2)' : 'var(--muted)' }}>
              {letter}
            </span>
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                background: on ? 'var(--blue)' : 'var(--fill)',
                color: on ? '#FFF' : isWeekend ? 'var(--muted-2)' : 'var(--muted)',
              }}
            >
              {isWeekend ? '' : letter}
            </span>
          </div>
        );
      })}
    </div>
  );
}

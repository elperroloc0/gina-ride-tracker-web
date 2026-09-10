import * as React from 'react';

export interface TableProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

/**
 * Console table shell — r14 surface with a clipped border, so the header and the
 * first row sit flush inside the corner radius.
 *
 * @example
 * <Table>
 *   <TableHeader><TableCell>Child</TableCell><TableCell variant="day">Day</TableCell></TableHeader>
 *   <TableRow><TableCell>Maya Ruiz</TableCell><TableCell variant="day">Mon</TableCell></TableRow>
 * </Table>
 */
export function Table({ children, className, ...rest }: TableProps) {
  return <div className={['gds-table', className].filter(Boolean).join(' ')} {...rest}>{children}</div>;
}

export interface TableHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

/** Column header strip: 44px, `--surface-2`, 11/700 uppercase `--muted`. */
export function TableHeader({ children, className, ...rest }: TableHeaderProps) {
  return <div className={['gds-tr gds-tr--head', className].filter(Boolean).join(' ')} {...rest}>{children}</div>;
}

export interface TableRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Selected rows get `--blue-row` and a 3px `--blue` left edge. */
  selected?: boolean;
  children?: React.ReactNode;
}

/**
 * A 62px record row. The whole row is the click target, not just the name.
 *
 * There is deliberately no "alert" row background: a row that needs attention
 * says so with an `alert` Badge or Avatar inside it, because tinting the whole
 * row makes every cell in it harder to read.
 */
export function TableRow({ selected = false, children, className, ...rest }: TableRowProps) {
  const cls = ['gds-tr', selected ? 'is-selected' : null, className].filter(Boolean).join(' ');
  return <div className={cls} {...rest}>{children}</div>;
}

export interface TableCellProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * `text` — flexible, truncates with an ellipsis. This is the only kind that may shrink.
   * `schedule` — fixed 190px: five 22px chips plus gaps plus the time cannot compress.
   * `day` — fixed 110px, right aligned.
   * @default 'text'
   */
  variant?: 'text' | 'schedule' | 'day';
  /** Relative width against other text cells. @default 1 */
  grow?: number;
  /** Flex basis in px for a text cell. @default 160 */
  basis?: number;
  children?: React.ReactNode;
}

/**
 * One column. Never give a text column a fixed `width` — that is the invariant
 * this component exists to hold: text cells flex and truncate, only `schedule`
 * and `day` are fixed, and their combined width must still fit at 1280px (the
 * reception laptop), not just at 1440.
 */
export function TableCell({ variant = 'text', grow = 1, basis = 160, children, className, style, ...rest }: TableCellProps) {
  const cls = ['gds-td', `gds-td--${variant}`, className].filter(Boolean).join(' ');
  const flex = variant === 'text' ? { flex: `${grow} 1 ${basis}px` } : undefined;
  return <div className={cls} style={{ ...flex, ...style }} {...rest}>{children}</div>;
}

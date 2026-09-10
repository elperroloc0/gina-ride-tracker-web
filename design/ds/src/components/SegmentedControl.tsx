import * as React from 'react';

export interface SegmentedOption {
  value: string;
  label: React.ReactNode;
}

export interface SegmentedControlProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: SegmentedOption[];
  /** The selected value. */
  value: string;
  onChange?: (value: string) => void;
}

/**
 * Two or three mutually exclusive filters, as pills. The selected pill is
 * `--blue-surface` inside a `--blue` outline.
 *
 * Not for choosing a child — that is always the header dropdown, on every
 * screen, because segmented pills change shape between screens and break past
 * three children.
 *
 * @example
 * <SegmentedControl value="today" onChange={setTab}
 *   options={[{ value: 'today', label: 'Today' }, { value: 'week', label: 'This week' }]} />
 */
export function SegmentedControl({ options, value, onChange, className, ...rest }: SegmentedControlProps) {
  return (
    <div className={['gds-seg', className].filter(Boolean).join(' ')} role="tablist" {...rest}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={opt.value === value}
          className={`gds-seg__item ${opt.value === value ? 'is-on' : ''}`}
          onClick={() => onChange?.(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

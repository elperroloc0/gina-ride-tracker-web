import * as React from 'react';

export interface ToggleProps extends Omit<React.HTMLAttributes<HTMLButtonElement>, 'onChange'> {
  /** Whether the switch is on. */
  checked: boolean;
  /** Fired with the next value when the switch is pressed. */
  onChange?: (checked: boolean) => void;
  /** `list` is 34x20 (inside a list row); `form` is 40x23 (inside a form). @default 'list' */
  size?: 'list' | 'form';
  /** The thing being switched. */
  label?: React.ReactNode;
  /**
   * What actually happens when this is off. A toggle that silences notifications
   * always spells out the consequence — never leave the parent to infer it.
   */
  consequence?: React.ReactNode;
}

/**
 * Switch. With `label`/`consequence` it renders the full bordered row used in
 * settings; on its own it renders just the switch.
 *
 * @example
 * <Toggle checked label="Text me on pickup"
 *         consequence="Off means no text when she is picked up." />
 */
export function Toggle({ checked, onChange, size = 'list', label, consequence, className, ...rest }: ToggleProps) {
  const sw = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange?.(!checked)}
      className={`gds-toggle gds-toggle--${size} ${checked ? 'is-on' : 'is-off'}`}
      {...rest}
    >
      <span className="gds-toggle__knob" />
    </button>
  );
  if (label == null && consequence == null) return sw;
  return (
    <div className={['gds-toggle-row', className].filter(Boolean).join(' ')}>
      <div className="gds-toggle-row__text">
        {label != null ? <div className="gds-toggle-row__label">{label}</div> : null}
        {consequence != null ? <div className="gds-toggle-row__note">{consequence}</div> : null}
      </div>
      {sw}
    </div>
  );
}

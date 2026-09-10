import * as React from 'react';
import { Icon, type IconName } from './Icon';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * `console` — 40-42px, r10, 13px.
   * `search` — the pill search field, r999.
   * `mobile` — 52px, r12, 15px, sized for the 44px tap target.
   * @default 'console'
   */
  variant?: 'console' | 'search' | 'mobile';
  /** Optional leading glyph inside the field. */
  icon?: IconName;
}

/**
 * Text field. Focus is a 1.5px `--blue` border over `--blue-surface` — the same
 * treatment a selected card gets, so "this is the thing you are working on"
 * reads the same everywhere.
 *
 * @example
 * <Input variant="search" icon="search" placeholder="Search children" />
 */
export function Input({ variant = 'console', icon, className, ...rest }: InputProps) {
  const cls = ['gds-field', `gds-field--${variant}`, className].filter(Boolean).join(' ');
  return (
    <div className={cls}>
      {icon ? <Icon name={icon} size={variant === 'mobile' ? 20 : 16} className="gds-field__icon" /> : null}
      <input className="gds-field__input" {...rest} />
    </div>
  );
}

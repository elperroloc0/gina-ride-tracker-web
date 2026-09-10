import * as React from 'react';
import { Icon, type IconName } from './Icon';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /**
   * `primary` — the one filled blue action on the screen.
   * `secondary` — outline `--line`; never a fill. Exactly one primary per screen.
   * `ink` — outline `--ink`, for page-level actions.
   * `dark` — filled `--ink`; the mobile escape hatch (e.g. "Not now").
   * `text` — bare blue label, for entering a secondary flow.
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'ink' | 'dark' | 'text';
  /** `console` is 42-44px tall at 13px; `mobile` is 52-54px at 14-15px to clear the 44px tap target. @default 'console' */
  size?: 'console' | 'mobile';
  /** Optional leading glyph. */
  icon?: IconName;
  children?: React.ReactNode;
}

/**
 * Pill button. Every radius in the system is 999px, so this never squares off.
 *
 * @example
 * <Button variant="primary" icon="plus">Add child</Button>
 */
export function Button({ variant = 'primary', size = 'console', icon, children, className, ...rest }: ButtonProps) {
  const cls = ['gds-btn', `gds-btn--${variant}`, `gds-btn--${size}`, icon ? 'gds-btn--icon' : null, className].filter(Boolean).join(' ');
  return (
    <button type="button" className={cls} {...rest}>
      {icon ? <Icon name={icon} size={size === 'mobile' ? 20 : 16} /> : null}
      {children != null ? <span>{children}</span> : null}
    </button>
  );
}

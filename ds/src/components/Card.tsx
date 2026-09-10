import * as React from 'react';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * `console` — r14, 16-20px padding, the operator panels.
   * `mobile` — r16, 16-18px padding, the parent app.
   * `color` — the `--blue` card that owns the theme of a screen. Only one per screen,
   * and a coloured card never nests inside another coloured card.
   * @default 'console'
   */
  variant?: 'console' | 'mobile' | 'color';
  /** Small caps label above the title. */
  eyebrow?: React.ReactNode;
  /** Card title. Set in Archivo Black — uppercase on `color`, sentence case elsewhere. */
  title?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Surface container.
 *
 * @example
 * <Card variant="color" eyebrow="On ride" title="Maya is on the way">
 *   <p>You'll get a text the moment she's there.</p>
 * </Card>
 */
export function Card({ variant = 'console', eyebrow, title, children, className, ...rest }: CardProps) {
  const cls = ['gds-card', `gds-card--${variant}`, className].filter(Boolean).join(' ');
  return (
    <div className={cls} {...rest}>
      {eyebrow != null ? <div className="gds-card__eyebrow">{eyebrow}</div> : null}
      {title != null ? <div className="gds-card__title">{title}</div> : null}
      {children}
    </div>
  );
}

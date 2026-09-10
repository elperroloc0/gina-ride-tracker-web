import * as React from 'react';
import { Icon } from './Icon';

export interface TimelineStep {
  /** What happened, in the parent's words: "Picked up at Coral Way K-8". */
  label: React.ReactNode;
  /** Time in tabular figures. */
  time?: React.ReactNode;
  /** `done` — filled with a check. `current` — a ring. `future` — a hollow outline. */
  state: 'done' | 'current' | 'future';
}

export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: TimelineStep[];
  /** `vertical` is the mobile rail (20px column); `horizontal` sits on a coloured card. @default 'vertical' */
  orientation?: 'vertical' | 'horizontal';
  /** Renders the current step's ring in `--alert`: the position feed went quiet. */
  stale?: boolean;
  /** Set when the timeline sits on a `--blue` surface, so markers invert to white. */
  onColor?: boolean;
}

/**
 * Ride progress. The current step is a *ring*, never a filled white disc — the
 * ring is what separates "happening now" from "already done" at a glance.
 *
 * @example
 * <Timeline steps={[
 *   { label: 'Picked up at Coral Way K-8', time: '3:14 PM', state: 'done' },
 *   { label: 'On the way to the gym', state: 'current' },
 *   { label: 'Arrives at the gym', state: 'future' },
 * ]} />
 */
export function Timeline({ steps, orientation = 'vertical', stale = false, onColor = false, className, ...rest }: TimelineProps) {
  const cls = [
    'gds-timeline',
    `gds-timeline--${orientation}`,
    onColor ? 'gds-timeline--on-color' : null,
    className,
  ].filter(Boolean).join(' ');
  return (
    <div className={cls} {...rest}>
      {steps.map((step, i) => {
        const markerCls = [
          'gds-tl__marker',
          `is-${step.state}`,
          step.state === 'current' && stale ? 'is-stale' : null,
        ].filter(Boolean).join(' ');
        return (
          <div className={`gds-tl__step is-${step.state}`} key={i}>
            <div className="gds-tl__rail">
              <span className={markerCls}>
                {step.state === 'done' ? <Icon name="check" size={16} className="gds-tl__check" /> : null}
              </span>
              {i < steps.length - 1 ? (
                <span className={`gds-tl__line ${step.state === 'done' ? 'is-done' : 'is-future'}`} />
              ) : null}
            </div>
            <div className="gds-tl__body">
              <div className="gds-tl__label">{step.label}</div>
              {step.time != null ? <div className="gds-tl__time">{step.time}</div> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

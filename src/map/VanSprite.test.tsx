import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VanSprite } from './VanSprite';

describe('VanSprite', () => {
  it('renders a blue puck when live and grey when stale', () => {
    const { container, rerender } = render(<VanSprite />);
    expect(container.querySelector('circle')).toHaveAttribute('fill', '#1A18F0');

    rerender(<VanSprite stale />);
    expect(container.querySelector('circle')).toHaveAttribute('fill', '#6E6E73');
  });

  it('shows a heading arrow and rotates to the given course, but hides it when course is unknown', () => {
    const { container, rerender } = render(<VanSprite course={90} />);
    expect(container.querySelector('path')).toBeInTheDocument();
    const rotator = container.querySelector('svg')!.parentElement as HTMLElement;
    expect(rotator.style.transform).toBe('rotate(90deg)');

    rerender(<VanSprite course={null} />);
    expect(container.querySelector('path')).not.toBeInTheDocument();
    const unset = container.querySelector('svg')!.parentElement as HTMLElement;
    expect(unset.style.transform).toBe('');
  });
});

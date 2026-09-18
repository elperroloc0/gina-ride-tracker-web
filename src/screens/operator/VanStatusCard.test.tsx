import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { VanPosition } from '../../ws/vanSocket';
import { VanStatusCard } from './VanStatusCard';

function position(overrides: Partial<VanPosition>): VanPosition {
  return {
    van_id: 1,
    lat: 25.7,
    lon: -80.2,
    course: null,
    device_time: new Date().toISOString(),
    ignition: null,
    fuel: null,
    speed: null,
    ...overrides,
  };
}

describe('VanStatusCard', () => {
  it('shows Running, fuel, converted speed, and heading when everything is reported', () => {
    render(<VanStatusCard position={position({ ignition: true, fuel: 64, speed: 34.7, course: 90 })} />);

    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(screen.getByText('64%')).toBeInTheDocument();
    expect(screen.getByText('40 mph')).toBeInTheDocument(); // 34.7 knots -> mph
    expect(screen.getByText('E')).toBeInTheDocument();
  });

  it('shows Off (not Unknown) when ignition is reported false', () => {
    render(<VanStatusCard position={position({ ignition: false })} />);
    expect(screen.getByText('Off')).toBeInTheDocument();
  });

  it('shows Unknown/— for everything the tracker did not report, not a guessed default', () => {
    render(<VanStatusCard position={position({})} />);

    expect(screen.getByText('Unknown')).toBeInTheDocument();
    const dashes = screen.getAllByText('—');
    expect(dashes).toHaveLength(3); // fuel, speed, heading
  });

  it('renders the same unknown state when there is no position at all yet', () => {
    render(<VanStatusCard position={undefined} />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });
});

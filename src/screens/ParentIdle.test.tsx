import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { GeoFenceDTO } from '../api/types';
import ParentIdle from './ParentIdle';

const ORIGIN: GeoFenceDTO = { id: 1, name: 'School', location_type: 'SCHOOL', latitude: '25.7', longitude: '-80.2', radius: 50, traccar_id: 1, is_active: true };
const DESTINATION: GeoFenceDTO = { id: 2, name: 'Gym', location_type: 'GYM', latitude: '25.8', longitude: '-80.3', radius: 40, traccar_id: 2, is_active: true };

// Same rationale as VanMap.test.tsx/ParentRide.test.tsx: jsdom can't render
// real Mapbox GL, so @vis.gl/react-mapbox is replaced with plain DOM
// stand-ins. Map renders a recognizable marker so tests can tell it apart
// from MapPlaceholder; Source records which ids actually got a geofence.
const renderedSourceIds: string[] = [];
vi.mock('../map/mapboxToken', () => ({ hasMapboxToken: true, mapboxToken: 'pk.test' }));
vi.mock('@vis.gl/react-mapbox', () => {
  function Source({ id, children }: { id?: string; children?: React.ReactNode }) {
    if (id) renderedSourceIds.push(id);
    return <>{children}</>;
  }
  function Layer() {
    return null;
  }
  function Map({ children }: { children?: React.ReactNode }) {
    return <div data-testid="real-map">{children}</div>;
  }
  return { Map, Source, Layer };
});

afterEach(() => {
  vi.unstubAllGlobals();
  renderedSourceIds.length = 0;
});

describe('ParentIdle', () => {
  it('shows the placeholder, not the real map, while useNextRide is still loading', () => {
    render(<ParentIdle childName="Mia" nextRide={null} loading />);
    expect(screen.queryByTestId('real-map')).not.toBeInTheDocument();
  });

  it('renders the real map with both geofences once loaded, even with no next ride', () => {
    render(<ParentIdle childName="Mia" nextRide={null} loading={false} />);
    expect(screen.getByTestId('real-map')).toBeInTheDocument();
    expect(renderedSourceIds).toEqual([]);
  });

  it('draws the school and gym geofences once both are known', () => {
    render(
      <ParentIdle
        childName="Mia"
        nextRide={null}
        loading={false}
        originFence={ORIGIN}
        destinationFence={DESTINATION}
      />,
    );
    expect(screen.getByTestId('real-map')).toBeInTheDocument();
    expect(renderedSourceIds).toEqual(['parent-idle-origin', 'parent-idle-destination']);
  });

  it('shows the next-ride summary and pickup days when there is a scheduled ride', () => {
    render(
      <ParentIdle
        childName="Mia"
        loading={false}
        origin="Coral Way K-8"
        destination="Gina's Gymnastics"
        nextRide={{ weekday: 'Wednesday', time: '3:00 PM', daysAway: 2, activeDays: [false, false, true, false, false, false, false] }}
      />,
    );
    expect(screen.getByText(/Wednesday, 3:00 PM/)).toBeInTheDocument();
    expect(screen.getByText(/Coral Way K-8.*Gina's Gymnastics/)).toBeInTheDocument();
    expect(screen.getByText('In 2 days')).toBeInTheDocument();
  });

  it('shows the empty-schedule message when there is no next ride at all', () => {
    render(<ParentIdle childName="Mia" nextRide={null} loading={false} />);
    expect(screen.getByText(/No pickup days set yet/)).toBeInTheDocument();
  });
});

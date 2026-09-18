import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { GeoFenceDTO } from '../api/types';
import type { VanPosition } from '../ws/vanSocket';
import ParentRide from './ParentRide';

const ORIGIN: GeoFenceDTO = { id: 1, name: 'School', location_type: 'SCHOOL', latitude: '25.7', longitude: '-80.2', radius: 50, traccar_id: 1, is_active: true };
const DESTINATION: GeoFenceDTO = { id: 2, name: 'Gym', location_type: 'GYM', latitude: '25.8', longitude: '-80.3', radius: 40, traccar_id: 2, is_active: true };

function position(lon: number, lat: number): VanPosition {
  return { van_id: 1, lat, lon, course: 180, device_time: new Date().toISOString(), ignition: null, fuel: null, speed: null };
}

// Same rationale as VanMap.test.tsx: jsdom can't do real Mapbox GL feature
// picking, so @vis.gl/react-mapbox is replaced with plain DOM stand-ins.
// Source additionally records (id, data) so tests can inspect what the
// live trail actually rendered, the same way VanMap.test.tsx's mock
// records layer properties for click simulation.
let renderedSources: { id: string; data: unknown }[] = [];
vi.mock('../map/mapboxToken', () => ({ hasMapboxToken: true, mapboxToken: 'pk.test' }));
vi.mock('@vis.gl/react-mapbox', () => {
  function Source({ id, data, children }: { id?: string; data?: unknown; children?: React.ReactNode }) {
    if (id) renderedSources.push({ id, data });
    return <>{children}</>;
  }
  function Layer() {
    return null;
  }
  function Marker({ children, onClick }: { children?: React.ReactNode; onClick?: () => void }) {
    return (
      <button type="button" onClick={onClick}>
        {children}
      </button>
    );
  }
  function Popup({ children }: { children?: React.ReactNode }) {
    return <div role="dialog">{children}</div>;
  }
  function Map({
    children,
    onClick,
    interactiveLayerIds,
  }: {
    children?: React.ReactNode;
    onClick?: (e: { features: Array<{ layer: { id: string } }> }) => void;
    interactiveLayerIds?: string[];
  }) {
    return (
      <div>
        {children}
        {(interactiveLayerIds ?? []).map((id) => (
          <button key={id} type="button" onClick={() => onClick?.({ features: [{ layer: { id } }] })}>
            {id}
          </button>
        ))}
      </div>
    );
  }
  return { Map, Marker, Source, Layer, Popup };
});

afterEach(() => {
  vi.unstubAllGlobals();
  renderedSources = [];
});

describe('ParentRide', () => {
  it('opens a popup with the van name and status when its marker is clicked', async () => {
    render(<ParentRide status="live" position={position(-80.25, 25.75)} childName="Mia" originFence={ORIGIN} destinationFence={DESTINATION} />);
    const marker = await screen.findByRole('button', { name: '' });
    await userEvent.setup().click(marker);

    expect(await screen.findByText(/Mia.s van/)).toBeInTheDocument();
    expect(screen.getByText('Live')).toBeInTheDocument();
    expect(screen.getByText(/Heading S/)).toBeInTheDocument();
  });

  it('does not animate the marker from a fake (0,0) origin before a real position exists', () => {
    // No <Marker> (and thus no useSpringPosition seeding) should exist yet -
    // this is the regression case: the hook must only mount once `position`
    // is truthy, never called upfront with a (0,0) fallback target.
    render(<ParentRide status="live" position={null} childName="Mia" originFence={ORIGIN} destinationFence={DESTINATION} />);
    expect(screen.queryByRole('button', { name: '' })).not.toBeInTheDocument();
  });

  it('opens a popup with the origin geofence details when its layer is clicked', async () => {
    render(<ParentRide status="live" position={null} childName="Mia" originFence={ORIGIN} destinationFence={DESTINATION} />);

    const layerButton = await screen.findByRole('button', { name: 'parent-origin-fill' });
    await userEvent.setup().click(layerButton);

    expect(await screen.findByText('School')).toBeInTheDocument();
    expect(screen.getByText(/School · 50m radius/)).toBeInTheDocument();
  });

  it('draws no trail line for a single position - a line needs at least two points', () => {
    render(<ParentRide status="live" position={position(-80.2, 25.7)} childName="Mia" originFence={ORIGIN} destinationFence={DESTINATION} />);
    expect(renderedSources.some((s) => s.id === 'parent-trail')).toBe(false);
  });

  it('draws the live trail from accumulated positions once there are at least two', () => {
    const { rerender } = render(
      <ParentRide status="live" position={position(-80.2, 25.7)} childName="Mia" originFence={ORIGIN} destinationFence={DESTINATION} />,
    );
    rerender(
      <ParentRide status="live" position={position(-80.15, 25.75)} childName="Mia" originFence={ORIGIN} destinationFence={DESTINATION} />,
    );

    const trailSource = renderedSources.find((s) => s.id === 'parent-trail');
    expect(trailSource).toBeDefined();
    const data = trailSource!.data as { geometry: { coordinates: number[][] } };
    expect(data.geometry.coordinates).toEqual([
      [-80.2, 25.7],
      [-80.15, 25.75],
    ]);
  });

  it('has no clickable route layer - clicking the trail is not a route lookup anymore', () => {
    render(<ParentRide status="live" position={position(-80.2, 25.7)} childName="Mia" originFence={ORIGIN} destinationFence={DESTINATION} />);
    expect(screen.queryByRole('button', { name: /parent-trail|parent-route/ })).not.toBeInTheDocument();
  });
});

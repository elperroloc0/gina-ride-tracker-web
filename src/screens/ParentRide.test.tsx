import { act, render, screen } from '@testing-library/react';
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
// Recorded the same way as renderedSources above, so the initial-camera-
// centering test can check what BaseMap was actually mounted with, since
// jsdom can't run real Mapbox GL to observe the camera itself.
let lastInitialViewState: { longitude: number; latitude: number; zoom: number } | undefined;
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
    initialViewState,
  }: {
    children?: React.ReactNode;
    onClick?: (e: { features: Array<{ layer: { id: string } }> }) => void;
    interactiveLayerIds?: string[];
    initialViewState?: { longitude: number; latitude: number; zoom: number };
  }) {
    lastInitialViewState = initialViewState;
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
  lastInitialViewState = undefined;
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
    // No <Marker> (and thus no marker seeding) should exist yet -
    // this is the regression case: the hook must only mount once `position`
    // is truthy, never called upfront with a (0,0) fallback target.
    render(<ParentRide status="live" position={null} childName="Mia" originFence={ORIGIN} destinationFence={DESTINATION} />);
    expect(screen.queryByRole('button', { name: '' })).not.toBeInTheDocument();
  });

  it('does not mount the map at all before a real position exists - no camera to set yet', () => {
    render(<ParentRide status="live" position={null} childName="Mia" originFence={ORIGIN} destinationFence={DESTINATION} />);
    expect(lastInitialViewState).toBeUndefined();
  });

  it('centers the initial camera on the van the first time a real position arrives', () => {
    render(<ParentRide status="live" position={position(-80.25, 25.75)} childName="Mia" originFence={ORIGIN} destinationFence={DESTINATION} />);
    expect(lastInitialViewState).toEqual({ longitude: -80.25, latitude: 25.75, zoom: 13 });
  });

  it('keeps the initial camera on the van`s first position - later ticks do not re-center it', () => {
    const { rerender } = render(
      <ParentRide status="live" position={position(-80.25, 25.75)} childName="Mia" originFence={ORIGIN} destinationFence={DESTINATION} />,
    );
    rerender(<ParentRide status="live" position={position(-80.5, 26.0)} childName="Mia" originFence={ORIGIN} destinationFence={DESTINATION} />);

    expect(lastInitialViewState).toEqual({ longitude: -80.25, latitude: 25.75, zoom: 13 });
  });

  it('opens a popup with the origin geofence details when its layer is clicked', async () => {
    render(<ParentRide status="live" position={position(-80.2, 25.7)} childName="Mia" originFence={ORIGIN} destinationFence={DESTINATION} />);

    const layerButton = await screen.findByRole('button', { name: 'parent-origin-fill' });
    await userEvent.setup().click(layerButton);

    expect(await screen.findByText('School')).toBeInTheDocument();
    expect(screen.getByText(/School · 50m radius/)).toBeInTheDocument();
  });

  it('draws no trail line for a single position - a line needs at least two points', () => {
    render(<ParentRide status="live" position={position(-80.2, 25.7)} childName="Mia" originFence={ORIGIN} destinationFence={DESTINATION} />);
    expect(renderedSources.some((s) => s.id === 'parent-trail')).toBe(false);
  });

  it('grows the live trail with the smoothed van - the line ends at the marker, not at the raw fix', () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] });
    try {
      const { rerender } = render(
        <ParentRide status="live" position={position(-80.2, 25.7)} childName="Mia" originFence={ORIGIN} destinationFence={DESTINATION} />,
      );
      rerender(
        <ParentRide status="live" position={position(-80.15, 25.75)} childName="Mia" originFence={ORIGIN} destinationFence={DESTINATION} />,
      );
      const coordinates = () => {
        const source = renderedSources.filter((s) => s.id === 'parent-trail').at(-1);
        return (source?.data as { geometry: { coordinates: number[][] } } | undefined)?.geometry.coordinates;
      };

      // Mid-glide: the head is somewhere between the two fixes, not at the new one yet.
      act(() => {
        vi.advanceTimersByTime(1500);
      });
      const mid = coordinates()!;
      expect(mid[0]).toEqual([-80.2, 25.7]);
      const midHead = mid[mid.length - 1];
      expect(midHead[0]).toBeGreaterThan(-80.2);
      expect(midHead[0]).toBeLessThan(-80.15);

      // Glide finished: the line reaches the latest fix.
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      const done = coordinates()!;
      expect(done[done.length - 1]).toEqual([-80.15, 25.75]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('has no clickable route layer - clicking the trail is not a route lookup anymore', () => {
    render(<ParentRide status="live" position={position(-80.2, 25.7)} childName="Mia" originFence={ORIGIN} destinationFence={DESTINATION} />);
    expect(screen.queryByRole('button', { name: /parent-trail|parent-route/ })).not.toBeInTheDocument();
  });
});

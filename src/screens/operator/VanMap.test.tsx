import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { VanPosition } from '../../ws/vanSocket';
import { VanMap } from './VanMap';

const GEOFENCES = [
  { id: 1, name: 'School', location_type: 'SCHOOL', latitude: '25.7', longitude: '-80.2', radius: 50, traccar_id: 1, is_active: true },
  { id: 2, name: 'Gym', location_type: 'GYM', latitude: '25.8', longitude: '-80.3', radius: 50, traccar_id: 2, is_active: true },
];
const ROUTES = [{ id: 7, van: 1, origin: 1, destination: 2 }];
const VANS = [{ id: 1, name: 'Van A', tracker_imei: '123' }];
const DIRECTIONS_BODY = { routes: [{ geometry: { coordinates: [[-80.2, 25.7], [-80.3, 25.8]] } }] };

function fetchMock(url: string) {
  if (url.includes('/api/vans/')) return { ok: true, status: 200, json: async () => VANS };
  if (url.includes('/api/geofences/')) return { ok: true, status: 200, json: async () => GEOFENCES };
  if (url.includes('/api/routes/')) return { ok: true, status: 200, json: async () => ROUTES };
  if (url.includes('api.mapbox.com/directions')) return { ok: true, status: 200, json: async () => DIRECTIONS_BODY };
  throw new Error(`unexpected fetch: ${url}`);
}

// Every VanMap test needs a real BaseMap (not MapPlaceholder) with clickable
// layers/markers - jsdom can't do real Mapbox GL picking, so
// @vis.gl/react-mapbox is replaced with plain DOM stand-ins: Marker becomes a
// clickable button, and each interactive layer id gets its own button that,
// when clicked, replays the properties the matching Source/Layer was given
// (mirroring what real feature-picking would return in e.features[0]).
vi.mock('../../map/mapboxToken', () => ({ hasMapboxToken: true, mapboxToken: 'pk.test' }));
vi.mock('@vis.gl/react-mapbox', () => {
  const layerProperties: Record<string, unknown> = {};

  function Source({ children, data }: { children?: React.ReactNode; data?: { properties?: unknown } }) {
    React.Children.forEach(children, (child) => {
      const id = (child as { props?: { id?: string } })?.props?.id;
      if (id) layerProperties[id] = data?.properties;
    });
    return null;
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
    onClick?: (e: { features: Array<{ properties: unknown }> }) => void;
    interactiveLayerIds?: string[];
  }) {
    return (
      <div>
        {children}
        {(interactiveLayerIds ?? []).map((id) => (
          <button key={id} type="button" onClick={() => onClick?.({ features: [{ properties: layerProperties[id] }] })}>
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
});

describe('VanMap', () => {
  it('fetches the route line once with the origin/destination coordinates, then serves the cache on remount', async () => {
    const fetchSpy = vi.fn(async (url: string) => fetchMock(url));
    vi.stubGlobal('fetch', fetchSpy);

    const { unmount } = render(<VanMap positions={{}} />);
    await waitFor(() => expect(fetchSpy.mock.calls.some(([url]) => (url as string).includes('api.mapbox.com/directions'))).toBe(true));

    const directionsCall = fetchSpy.mock.calls.find(([url]) => (url as string).includes('api.mapbox.com/directions'));
    expect(directionsCall![0] as string).toContain('-80.2,25.7;-80.3,25.8');

    unmount();
    const directionsCallsAfterFirstMount = fetchSpy.mock.calls.filter(([url]) => (url as string).includes('api.mapbox.com/directions')).length;
    expect(directionsCallsAfterFirstMount).toBe(1);

    // Route id (7) is unchanged, so directions.ts's module-level cache should
    // serve this remount without a second network call.
    render(<VanMap positions={{}} />);
    await waitFor(() => expect(fetchSpy.mock.calls.some(([url]) => (url as string).includes('/api/routes/'))).toBe(true));

    const directionsCallsAfterSecondMount = fetchSpy.mock.calls.filter(([url]) => (url as string).includes('api.mapbox.com/directions')).length;
    expect(directionsCallsAfterSecondMount).toBe(1);
  });

  it('opens a popup with the van name and status when its marker is clicked', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => fetchMock(url)));
    const positions: Record<number, VanPosition> = {
      1: { van_id: 1, lat: 25.7, lon: -80.2, course: 90, device_time: new Date().toISOString(), ignition: null, fuel: null, speed: null },
    };

    render(<VanMap positions={positions} />);
    const user = userEvent.setup();

    const marker = await screen.findByRole('button', { name: '' });
    await user.click(marker);

    expect(await screen.findByText('Van A')).toBeInTheDocument();
    expect(screen.getByText('Live')).toBeInTheDocument();
    expect(screen.getByText(/Heading E/)).toBeInTheDocument();
  });

  it('opens a popup with the geofence details when its layer is clicked', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => fetchMock(url)));
    render(<VanMap positions={{}} />);

    const layerButton = await screen.findByRole('button', { name: 'geofence-fill-1' });
    await userEvent.setup().click(layerButton);

    expect(await screen.findByText('School')).toBeInTheDocument();
    expect(screen.getByText(/School · 50m radius/)).toBeInTheDocument();
  });

  it('opens a popup with the route details when its layer is clicked', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => fetchMock(url)));
    render(<VanMap positions={{}} />);

    const layerButton = await screen.findByRole('button', { name: 'route-line-7' });
    await userEvent.setup().click(layerButton);

    expect(await screen.findByText('Van A')).toBeInTheDocument();
    expect(screen.getByText(/School.*Gym/)).toBeInTheDocument();
  });
});

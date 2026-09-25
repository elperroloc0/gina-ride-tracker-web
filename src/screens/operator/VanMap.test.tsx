import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { VanPosition } from '../../ws/vanSocket';
import { VanMap } from './VanMap';

const GEOFENCES = [
  { id: 1, name: 'School', location_type: 'SCHOOL', latitude: '25.7', longitude: '-80.2', radius: 50, traccar_id: 1, is_active: true },
  { id: 2, name: 'Gym', location_type: 'GYM', latitude: '25.8', longitude: '-80.3', radius: 50, traccar_id: 2, is_active: true },
];
const VANS = [{ id: 1, name: 'Van A', tracker_imei: '123' }];

function fetchMock(url: string) {
  if (url.includes('/api/vans/')) return { ok: true, status: 200, json: async () => VANS };
  if (url.includes('/api/children/') || url.includes('/api/routes/')) return { ok: true, status: 200, json: async () => [] };
  if (url.includes('/api/geofences/')) return { ok: true, status: 200, json: async () => GEOFENCES };
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

  it('expands a van row in the "Vans" panel to show its status card, and collapses on a second click', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => fetchMock(url)));
    const positions: Record<number, VanPosition> = {
      1: { van_id: 1, lat: 25.7, lon: -80.2, course: 90, device_time: new Date().toISOString(), ignition: true, fuel: 64, speed: 34.7 },
    };
    render(<VanMap positions={positions} />);
    const user = userEvent.setup();

    const row = await screen.findByRole('button', { name: /Van A/i });
    await user.click(row);

    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(screen.getByText('64%')).toBeInTheDocument();
    expect(screen.getByText('40 mph')).toBeInTheDocument(); // 34.7 knots
    expect(screen.getByText('E')).toBeInTheDocument();

    await user.click(row);
    expect(screen.queryByText('Running')).not.toBeInTheDocument();
  });

  it('opens a popup with the geofence details when its layer is clicked', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => fetchMock(url)));
    render(<VanMap positions={{}} />);

    const layerButton = await screen.findByRole('button', { name: 'geofence-fill-1' });
    await userEvent.setup().click(layerButton);

    expect(await screen.findByText('School')).toBeInTheDocument();
    expect(screen.getByText(/School · 50m radius/)).toBeInTheDocument();
  });
});

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RouteForm } from './RouteForm';

function fetchMock(url: string) {
  if (url.includes('/api/vans/')) {
    return { ok: true, status: 200, json: async () => [{ id: 1, name: 'VAN-1', tracker_imei: 'IMEI1' }] };
  }
  if (url.includes('/api/geofences/')) {
    return {
      ok: true,
      status: 200,
      json: async () => [
        { id: 1, name: 'School A', location_type: 'SCHOOL', latitude: '25', longitude: '-80', radius: 50, traccar_id: 1, is_active: true },
        { id: 2, name: 'Gina Gym', location_type: 'GYM', latitude: '25', longitude: '-80', radius: 50, traccar_id: 2, is_active: true },
      ],
    };
  }
  if (url.includes('/api/routes/')) {
    return { ok: true, status: 201, json: async () => ({ id: 9, van: 1, origin: 1, destination: 2 }) };
  }
  throw new Error(`unexpected fetch: ${url}`);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('RouteForm', () => {
  it('only offers SCHOOL geofences as origin and GYM as destination', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => fetchMock(url)));

    render(<RouteForm onDone={vi.fn()} onCancel={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('School A')).toBeInTheDocument());

    const originSelect = screen.getByLabelText('Origin (school)');
    expect(within(originSelect).getByRole('option', { name: 'School A' })).toBeInTheDocument();
    expect(within(originSelect).queryByRole('option', { name: 'Gina Gym' })).not.toBeInTheDocument();

    const destinationSelect = screen.getByLabelText('Destination (gym)');
    expect(within(destinationSelect).getByRole('option', { name: 'Gina Gym' })).toBeInTheDocument();
    expect(within(destinationSelect).queryByRole('option', { name: 'School A' })).not.toBeInTheDocument();
  });

  it('submits the selected van/origin/destination ids', async () => {
    const fetchSpy = vi.fn(async (url: string, _init?: RequestInit) => fetchMock(url));
    vi.stubGlobal('fetch', fetchSpy);
    const onDone = vi.fn();

    render(<RouteForm onDone={onDone} onCancel={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('School A')).toBeInTheDocument());

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /add route/i }));

    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
    const call = fetchSpy.mock.calls.find(([url]) => (url as string).includes('/api/routes/'));
    const body = JSON.parse((call?.[1]?.body ?? '{}') as string);
    expect(body).toEqual({ van: 1, origin: 1, destination: 2 });
  });
});

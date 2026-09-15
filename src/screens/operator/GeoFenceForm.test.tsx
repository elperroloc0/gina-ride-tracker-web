import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GeoFenceForm } from './GeoFenceForm';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('GeoFenceForm', () => {
  it('creates a geofence without asking for a traccar_id', async () => {
    const fetchSpy = vi.fn(async (_url: string, _init?: RequestInit) => ({
      ok: true,
      status: 201,
      json: async () => ({ id: 3, name: 'New School', location_type: 'SCHOOL', latitude: '25.1', longitude: '-80.1', radius: 50, traccar_id: 777, is_active: true }),
    }));
    vi.stubGlobal('fetch', fetchSpy);
    const onDone = vi.fn();

    render(<GeoFenceForm onDone={onDone} onCancel={vi.fn()} />);
    expect(screen.queryByText(/traccar/i)).not.toBeInTheDocument();

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Name'), 'New School');
    await user.type(screen.getByLabelText('Latitude'), '25.1');
    await user.type(screen.getByLabelText('Longitude'), '-80.1');
    await user.click(screen.getByRole('button', { name: /add geofence/i }));

    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
    const call = fetchSpy.mock.calls.find(([url]) => (url as string).includes('/api/geofences/'));
    const body = JSON.parse((call?.[1]?.body ?? '{}') as string);
    expect(body).toEqual({ name: 'New School', location_type: 'SCHOOL', latitude: '25.1', longitude: '-80.1', radius: 50 });
    expect(body.traccar_id).toBeUndefined();
  });

  it('surfaces the backend detail message when Traccar provisioning fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 400, json: async () => ({ detail: 'Could not create geofence in Traccar: boom' }) })),
    );

    render(<GeoFenceForm onDone={vi.fn()} onCancel={vi.fn()} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Name'), 'Doomed');
    await user.type(screen.getByLabelText('Latitude'), '25.1');
    await user.type(screen.getByLabelText('Longitude'), '-80.1');
    await user.click(screen.getByRole('button', { name: /add geofence/i }));

    expect(await screen.findByText('Could not create geofence in Traccar: boom')).toBeInTheDocument();
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EditChildScheduleForm } from './EditChildScheduleForm';
import type { ChildDTO } from '../../api/types';

const CHILD: ChildDTO = {
  id: 1,
  name: 'Maya',
  parent: 2,
  parent_name: '',
  parent_phone_number: '',
  route: 1,
  schedule: [
    { id: 10, child: 1, weekday: 0, pickup_hour: '15:00:00' },
    { id: 11, child: 1, weekday: 2, pickup_hour: '15:00:00' },
  ],
  ride_active: false,
  active_ride_start: null,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('EditChildScheduleForm', () => {
  it('deletes a removed day, adds a newly picked day, and updates the shared time on the rest', async () => {
    const fetchSpy = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === '/api/routes/' && !init?.method) return { ok: true, status: 200, json: async () => [{ id: 1, origin: 1, destination: 2, van: 1 }] };
      if (url === '/api/geofences/' && !init?.method) return { ok: true, status: 200, json: async () => [] };
      if (url.includes('/api/schedules/10/') && init?.method === 'DELETE') return { ok: true, status: 204, json: async () => undefined };
      if (url.includes('/api/schedules/11/') && init?.method === 'PATCH') return { ok: true, status: 200, json: async () => ({}) };
      if (url === '/api/schedules/' && init?.method === 'POST') return { ok: true, status: 201, json: async () => ({}) };
      throw new Error(`unexpected fetch: ${url} ${init?.method}`);
    });
    vi.stubGlobal('fetch', fetchSpy);
    const onDone = vi.fn();

    render(<EditChildScheduleForm child={CHILD} onDone={onDone} onCancel={vi.fn()} />);

    const user = userEvent.setup();
    await user.click(screen.getByText('M')); // Monday: was on, turn off -> delete
    await user.click(screen.getByText('F')); // Friday: was off, turn on -> create
    const timeInput = screen.getByLabelText('Pickup time');
    await user.clear(timeInput);
    await user.type(timeInput, '16:30');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));

    const calls = fetchSpy.mock.calls.map(([url, init]) => `${(init as RequestInit)?.method} ${url}`);
    expect(calls).toContain('DELETE /api/schedules/10/');
    expect(calls).toContain('PATCH /api/schedules/11/');
    expect(calls).toContain('POST /api/schedules/');

    const createCall = fetchSpy.mock.calls.find(([url, init]) => url === '/api/schedules/' && init?.method === 'POST');
    expect(JSON.parse((createCall?.[1]?.body ?? '{}') as string)).toEqual({ child: 1, weekday: 4, pickup_hour: '16:30:00' });

    const updateCall = fetchSpy.mock.calls.find(([url]) => (url as string).includes('/api/schedules/11/'));
    expect(JSON.parse((updateCall?.[1]?.body ?? '{}') as string)).toEqual({ pickup_hour: '16:30:00' });
  });

  it('PATCHes the child with the newly picked route', async () => {
    const ROUTES = [
      { id: 1, origin: 1, destination: 2, van: 1 },
      { id: 2, origin: 3, destination: 2, van: 1 },
    ];
    const GEOFENCES = [1, 2, 3].map((id) => ({ id, name: `Place ${id}` }));
    const fetchSpy = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === '/api/routes/' && !init?.method) return { ok: true, status: 200, json: async () => ROUTES };
      if (url === '/api/geofences/' && !init?.method) return { ok: true, status: 200, json: async () => GEOFENCES };
      if (url === '/api/children/1/' && init?.method === 'PATCH') return { ok: true, status: 200, json: async () => ({}) };
      throw new Error(`unexpected fetch: ${url} ${init?.method}`);
    });
    vi.stubGlobal('fetch', fetchSpy);
    const onDone = vi.fn();

    render(<EditChildScheduleForm child={CHILD} onDone={onDone} onCancel={vi.fn()} />);

    const user = userEvent.setup();
    await user.selectOptions(await screen.findByLabelText('Route'), '2');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
    const call = fetchSpy.mock.calls.find(([url]) => url === '/api/children/1/');
    expect(JSON.parse((call?.[1]?.body ?? '{}') as string)).toEqual({ route: 2 });
  });
});

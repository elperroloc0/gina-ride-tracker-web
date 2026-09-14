import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AddParentForm } from './AddParentForm';

function fetchMock(url: string, _init?: RequestInit) {
  if (url.includes('/api/routes/')) {
    return { ok: true, status: 200, json: async () => [{ id: 1, van: 1, origin: 1, destination: 2 }] };
  }
  if (url.includes('/api/geofences/')) {
    return {
      ok: true,
      status: 200,
      json: async () => [
        { id: 1, name: 'Coral Way K-8 Center', location_type: 'SCHOOL', latitude: '25', longitude: '-80', radius: 100, traccar_id: 1, is_active: true },
        { id: 2, name: "Gina's Gymnastics", location_type: 'GYM', latitude: '25', longitude: '-80', radius: 100, traccar_id: 2, is_active: true },
      ],
    };
  }
  if (url.includes('/api/enroll-parent/')) {
    return { ok: true, status: 201, json: async () => ({ child: { id: 1, name: 'Maya Alvarez', parent: 2, route: 1, schedule: [] }, invited: true }) };
  }
  throw new Error(`unexpected fetch: ${url}`);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AddParentForm', () => {
  it('normalizes a 10-digit phone to E.164 and reports the invite result', async () => {
    const fetchSpy = vi.fn(async (url: string, init?: RequestInit) => fetchMock(url, init));
    vi.stubGlobal('fetch', fetchSpy);

    render(<AddParentForm onDone={vi.fn()} onCancel={vi.fn()} />);
    await waitFor(() => expect(screen.getByText(/Coral Way K-8 Center/)).toBeInTheDocument());

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('(305) 555-0100'), '3055550100');
    await user.type(screen.getByPlaceholderText('Maya Alvarez'), 'Maya Alvarez');
    await user.click(screen.getByText('M'));
    await user.click(screen.getByText('W'));
    await user.click(screen.getByRole('button', { name: /add family/i }));

    await waitFor(() => expect(screen.getByText(/is enrolled/i)).toBeInTheDocument());

    const enrollCall = fetchSpy.mock.calls.find(([url]) => url.includes('/api/enroll-parent/'));
    const body = JSON.parse((enrollCall?.[1]?.body ?? '{}') as string);
    expect(body.parent_phone).toBe('+13055550100');
    expect(body.weekdays.sort()).toEqual([0, 2]);
  });
});

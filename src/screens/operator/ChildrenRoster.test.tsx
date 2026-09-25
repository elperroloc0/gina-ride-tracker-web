import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChildrenRoster } from './ChildrenRoster';

// Tuesday - backend weekday 1.
const NOW = new Date('2026-01-06T15:10:00');

function child(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    name: 'Maya',
    parent: 4,
    parent_name: 'Carolina',
    parent_phone_number: '+13055550100',
    route: 1,
    schedule: [{ id: 1, child: 1, weekday: 1, pickup_hour: '15:00:00' }],
    ride_active: false,
    active_ride_start: null,
    ...overrides,
  };
}

function stubApi(children: unknown[], events: unknown[] = []) {
  const data: Record<string, unknown> = {
    '/api/children/': children,
    '/api/routes/': [{ id: 1, van: 7, origin: 10, destination: 11 }],
    '/api/geofences/': [
      { id: 10, name: 'Coral Way K-8', location_type: 'SCHOOL', latitude: '1', longitude: '1', radius: 50, traccar_id: 1, is_active: true },
      { id: 11, name: 'Gina Gym', location_type: 'GYM', latitude: '2', longitude: '2', radius: 50, traccar_id: 2, is_active: true },
    ],
    '/api/vans/': [{ id: 7, name: 'ABC-123', tracker_imei: 'x' }],
    '/api/events/': events,
    '/api/parents/': [],
  };
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => ({ ok: true, status: 200, json: async () => data[new URL(url, 'http://x').pathname] ?? [] })),
  );
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'], now: NOW });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

async function selectMaya() {
  const user = userEvent.setup({ advanceTimers: () => {} });
  await waitFor(() => expect(screen.getAllByText('Maya').length).toBeGreaterThan(0));
  await user.click(screen.getAllByText('Maya')[0]);
}

describe('ChildrenRoster ride panel', () => {
  it('shows no ticks when the ride is not active, even if the van visited the gym', async () => {
    // A van 'in' at the gym before the pickup window must not light up the timeline.
    stubApi([child()], [{ id: 1, van: 7, geo_fence: 11, arrival_type: 'in', time: '2026-01-06T08:00:00' }]);
    const { container } = render(<ChildrenRoster />);
    await selectMaya();

    await waitFor(() => expect(screen.getByText('Scheduled')).toBeInTheDocument());
    expect(container.querySelectorAll('.gds-tl__marker.is-done')).toHaveLength(0);
    expect(container.querySelectorAll('.gds-tl__marker.is-current')).toHaveLength(0);
  });

  it('says there is no ride on an unscheduled day', async () => {
    stubApi([child({ schedule: [{ id: 1, child: 1, weekday: 3, pickup_hour: '15:00:00' }] })]);
    render(<ChildrenRoster />);
    await selectMaya();

    await waitFor(() => expect(screen.getByText('No ride today')).toBeInTheDocument());
  });

  it('marks pickup done and the trip current while the ride is active', async () => {
    stubApi([child({ ride_active: true, active_ride_start: '2026-01-06T15:00:00' })]);
    const { container } = render(<ChildrenRoster />);
    await selectMaya();

    await waitFor(() => expect(screen.getByText('On ride')).toBeInTheDocument());
    expect(container.querySelectorAll('.gds-tl__marker.is-done')).toHaveLength(1);
    expect(container.querySelectorAll('.gds-tl__marker.is-current')).toHaveLength(1);
  });

  it('shows the route and the van', async () => {
    stubApi([child()]);
    render(<ChildrenRoster />);
    await selectMaya();

    await waitFor(() => expect(screen.getByText('Coral Way K-8 → Gina Gym')).toBeInTheDocument());
    expect(screen.getByText('ABC-123')).toBeInTheDocument();
  });
});

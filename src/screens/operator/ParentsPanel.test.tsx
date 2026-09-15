import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ParentsPanel } from './ParentsPanel';

const PARENTS = [
  {
    id: 4,
    username: '+13055550100',
    first_name: 'Carolina',
    email: 'carolina@example.com',
    phone_number: '+13055550100',
    is_active: true,
    is_registered: false,
    children: [{ id: 1, name: 'Maya', parent: 4, parent_name: 'Carolina', parent_phone_number: '+13055550100', route: 1, schedule: [] }],
  },
];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ParentsPanel', () => {
  it('lists parents with their registered status and children', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 200, json: async () => PARENTS })));

    render(<ParentsPanel />);
    await waitFor(() => expect(screen.getByText('Carolina')).toBeInTheDocument());

    expect(screen.getByText('+13055550100')).toBeInTheDocument();
    expect(screen.getByText('Maya')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('deactivates a parent', async () => {
    const fetchSpy = vi.fn(async (url: string, init?: RequestInit) => {
      if ((init?.method ?? 'GET') === 'POST' && url.includes('/deactivate/')) {
        return { ok: true, status: 200, json: async () => ({ ...PARENTS[0], is_active: false }) };
      }
      return { ok: true, status: 200, json: async () => PARENTS };
    });
    vi.stubGlobal('fetch', fetchSpy);
    vi.stubGlobal('confirm', vi.fn(() => true));

    render(<ParentsPanel />);
    await waitFor(() => expect(screen.getByText('Carolina')).toBeInTheDocument());

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Deactivate' }));

    await waitFor(() =>
      expect(
        fetchSpy.mock.calls.some(([url, init]) => (url as string).includes('/api/parents/4/deactivate/') && init?.method === 'POST'),
      ).toBe(true),
    );
  });

  it('resends the invite', async () => {
    const fetchSpy = vi.fn(async (url: string, init?: RequestInit) => {
      if ((init?.method ?? 'GET') === 'POST' && url.includes('/resend_invite/')) {
        return { ok: true, status: 200, json: async () => PARENTS[0] };
      }
      return { ok: true, status: 200, json: async () => PARENTS };
    });
    vi.stubGlobal('fetch', fetchSpy);
    vi.stubGlobal('confirm', vi.fn(() => true));

    render(<ParentsPanel />);
    await waitFor(() => expect(screen.getByText('Carolina')).toBeInTheDocument());

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Resend' }));

    await waitFor(() =>
      expect(
        fetchSpy.mock.calls.some(([url, init]) => (url as string).includes('/api/parents/4/resend_invite/') && init?.method === 'POST'),
      ).toBe(true),
    );
    expect(await screen.findByText(/Sent a new sign-in link/)).toBeInTheDocument();
  });

  it('disables resend so a phoneless parent can never be texted', async () => {
    const phoneless = [{ ...PARENTS[0], phone_number: '', children: [] }];
    const fetchSpy = vi.fn(async (_url: string, _init?: RequestInit) => ({ ok: true, status: 200, json: async () => phoneless }));
    vi.stubGlobal('fetch', fetchSpy);
    const confirmSpy = vi.fn(() => true);
    vi.stubGlobal('confirm', confirmSpy);

    render(<ParentsPanel />);
    await waitFor(() => expect(screen.getByText('Carolina')).toBeInTheDocument());

    const resendButton = screen.getByRole('button', { name: 'Resend' });
    expect(resendButton).toBeDisabled();

    // A disabled button never dispatches click, so this is belt-and-suspenders
    // with the handler's own `if (!parent.phone_number)` guard - neither
    // window.confirm nor a network call should ever happen from this state.
    const user = userEvent.setup();
    await user.click(resendButton);
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(fetchSpy.mock.calls.some(([url]) => (url as string).includes('/resend_invite/'))).toBe(false);
  });
});

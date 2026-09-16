import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SetPassword from './SetPassword';
import { clearTokens, getAccess } from '../auth/tokens';

afterEach(() => {
  clearTokens();
  vi.unstubAllGlobals();
});

/** GET /api/set-password/:token/ (InviteInfoView) vs. POST /api/set-password/
 * (the actual submit) share the same URL prefix - keyed by method, not just
 * a substring match, so a mock meant for one never accidentally answers
 * the other. */
function fetchMock(inviteInfo: { first_name: string; phone_number: string } | null, init?: RequestInit) {
  return vi.fn(async (_url: string, reqInit?: RequestInit) => {
    const method = reqInit?.method ?? 'GET';
    if (method === 'GET') {
      return inviteInfo
        ? { ok: true, status: 200, json: async () => inviteInfo }
        : { ok: false, status: 400, json: async () => ({ detail: 'Invalid or expired link.' }) };
    }
    return init ?? { ok: true, status: 200, json: async () => ({ access: 'a', refresh: 'r' }) };
  });
}

describe('SetPassword', () => {
  it('shows the phone number to remember as login', async () => {
    vi.stubGlobal('fetch', fetchMock({ first_name: 'Carolina', phone_number: '+13055550100' }));
    render(<SetPassword token="abc123" onSignedIn={vi.fn()} />);

    expect(await screen.findByText('+13055550100')).toBeInTheDocument();
    // The greeting is deliberately not personalized - no name shown anywhere.
    expect(screen.queryByText(/carolina/i)).not.toBeInTheDocument();
  });

  it('replaces the form with an error when the link is already dead', async () => {
    vi.stubGlobal('fetch', fetchMock(null));
    render(<SetPassword token="abc123" onSignedIn={vi.fn()} />);

    expect(await screen.findByText(/link no longer works/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /set password/i })).not.toBeInTheDocument();
  });

  it('stores the returned tokens and signs in on success', async () => {
    vi.stubGlobal('fetch', fetchMock({ first_name: 'Carolina', phone_number: '+13055550100' }));
    const onSignedIn = vi.fn();
    render(<SetPassword token="abc123" onSignedIn={onSignedIn} />);
    await screen.findByText('+13055550100');

    const user = userEvent.setup();
    const [password, confirm] = screen.getAllByDisplayValue('');
    await user.type(password, 'a-strong-passphrase-1');
    await user.type(confirm, 'a-strong-passphrase-1');
    await user.click(screen.getByRole('button', { name: /set password/i }));

    expect(onSignedIn).toHaveBeenCalled();
    expect(getAccess()).toBe('a');
  });

  it('shows an error and never calls the API when the passwords do not match', async () => {
    const mock = fetchMock({ first_name: 'Carolina', phone_number: '+13055550100' });
    vi.stubGlobal('fetch', mock);
    const onSignedIn = vi.fn();
    render(<SetPassword token="abc123" onSignedIn={onSignedIn} />);
    await screen.findByText('+13055550100');

    const user = userEvent.setup();
    const [password, confirm] = screen.getAllByDisplayValue('');
    await user.type(password, 'a-strong-passphrase-1');
    await user.type(confirm, 'something-else');
    await user.click(screen.getByRole('button', { name: /set password/i }));

    expect(screen.getByText(/do not match/i)).toBeInTheDocument();
    expect(mock).toHaveBeenCalledTimes(1); // only the mount-time GET, never a POST
    expect(onSignedIn).not.toHaveBeenCalled();
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ParentAccount from './ParentAccount';

const ME = {
  first_name: 'Carolina',
  email: 'carolina@example.com',
  phone_number: '+13055550100',
  role: 'PARENT' as const,
  notify_channel: 'SMS' as const,
};

function fetchMock(overrides: {
  patchMe?: { ok: true; body: typeof ME } | { ok: false; status: number; detail: string };
  changePassword?: { ok: true } | { ok: false; status: number; detail: string };
}) {
  return vi.fn(async (url: string, init?: RequestInit) => {
    const method = init?.method ?? 'GET';
    if (url.includes('/api/me/') && method === 'GET') {
      return { ok: true, status: 200, json: async () => ME };
    }
    if (url.includes('/api/me/') && method === 'PATCH') {
      const r = overrides.patchMe ?? { ok: true, body: ME };
      return r.ok
        ? { ok: true, status: 200, json: async () => r.body }
        : { ok: false, status: r.status, json: async () => ({ detail: r.detail }) };
    }
    if (url.includes('/api/change-password/')) {
      const r = overrides.changePassword ?? { ok: true };
      return r.ok
        ? { ok: true, status: 204, json: async () => ({}) }
        : { ok: false, status: r.status, json: async () => ({ detail: r.detail }) };
    }
    throw new Error(`unexpected fetch: ${method} ${url}`);
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ParentAccount', () => {
  it('shows the phone number as a read-only login, and loads email/channel into the form', async () => {
    vi.stubGlobal('fetch', fetchMock({}));
    render(<ParentAccount />);

    expect(await screen.findByText('+13055550100')).toBeInTheDocument();
    expect(screen.getByDisplayValue('carolina@example.com')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false'); // SMS
  });

  it('Save is disabled until something changes, then PATCHes email + channel together', async () => {
    const fetchSpy = fetchMock({});
    vi.stubGlobal('fetch', fetchSpy);
    const user = userEvent.setup();
    render(<ParentAccount />);
    await screen.findByDisplayValue('carolina@example.com');

    const saveButtons = screen.getAllByRole('button', { name: /^save$/i });
    expect(saveButtons[0]).toBeDisabled();

    await user.click(screen.getByRole('switch'));
    expect(saveButtons[0]).toBeEnabled();
    await user.click(saveButtons[0]);

    await waitFor(() => expect(screen.getByText('Saved')).toBeInTheDocument());
    const patchCall = fetchSpy.mock.calls.find(([url, init]) => url.includes('/api/me/') && init?.method === 'PATCH');
    expect(JSON.parse((patchCall?.[1]?.body ?? '{}') as string)).toEqual({
      email: 'carolina@example.com',
      notify_channel: 'EMAIL',
    });
  });

  it('shows the backend detail message when saving the profile fails', async () => {
    vi.stubGlobal('fetch', fetchMock({ patchMe: { ok: false, status: 400, detail: 'That email looks invalid.' } }));
    const user = userEvent.setup();
    render(<ParentAccount />);
    await screen.findByDisplayValue('carolina@example.com');

    await user.click(screen.getByRole('switch'));
    await user.click(screen.getAllByRole('button', { name: /^save$/i })[0]);

    expect(await screen.findByText('That email looks invalid.')).toBeInTheDocument();
  });

  it('rejects a mismatched confirm password client-side, without calling the API', async () => {
    const fetchSpy = fetchMock({});
    vi.stubGlobal('fetch', fetchSpy);
    const user = userEvent.setup();
    render(<ParentAccount />);
    await screen.findByDisplayValue('carolina@example.com');

    await user.type(screen.getByLabelText('Current password'), 'old-password-1');
    await user.type(screen.getByLabelText('New password'), 'new-password-1');
    await user.type(screen.getByLabelText('Confirm new password'), 'something-else');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    expect(await screen.findByText('New passwords do not match.')).toBeInTheDocument();
    expect(fetchSpy.mock.calls.some(([url]) => url.includes('/api/change-password/'))).toBe(false);
  });

  it('shows the backend detail on a wrong current password', async () => {
    vi.stubGlobal(
      'fetch',
      fetchMock({ changePassword: { ok: false, status: 400, detail: 'Current password is incorrect.' } }),
    );
    const user = userEvent.setup();
    render(<ParentAccount />);
    await screen.findByDisplayValue('carolina@example.com');

    await user.type(screen.getByLabelText('Current password'), 'wrong-password');
    await user.type(screen.getByLabelText('New password'), 'new-password-1');
    await user.type(screen.getByLabelText('Confirm new password'), 'new-password-1');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    expect(await screen.findByText('Current password is incorrect.')).toBeInTheDocument();
  });

  it('clears the fields and shows success on a correct password change', async () => {
    vi.stubGlobal('fetch', fetchMock({ changePassword: { ok: true } }));
    const user = userEvent.setup();
    render(<ParentAccount />);
    await screen.findByDisplayValue('carolina@example.com');

    await user.type(screen.getByLabelText('Current password'), 'old-password-1');
    await user.type(screen.getByLabelText('New password'), 'new-password-1');
    await user.type(screen.getByLabelText('Confirm new password'), 'new-password-1');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    expect(await screen.findByText('Password updated')).toBeInTheDocument();
    expect((screen.getByLabelText('Current password') as HTMLInputElement).value).toBe('');
  });

  it('links to the gym by email and phone', async () => {
    vi.stubGlobal('fetch', fetchMock({}));
    render(<ParentAccount />);
    await screen.findByDisplayValue('carolina@example.com');

    expect(screen.getByRole('link', { name: /hello@ginasgymnastics.com/i })).toHaveAttribute(
      'href',
      'mailto:hello@ginasgymnastics.com',
    );
    expect(screen.getByRole('link', { name: /1 \(305\) 456-4150/ })).toHaveAttribute('href', 'tel:+13054564150');
  });
});

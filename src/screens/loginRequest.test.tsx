import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearTokens } from '../auth/tokens';
import Login from './Login';
import LoginDesktop from './operator/LoginDesktop';

afterEach(() => {
  clearTokens();
  vi.unstubAllGlobals();
});

// The backend (accounts/backends.py's FlexibleLoginBackend) resolves whatever
// arrives in SimpleJWT's "username" field as a username, email, or phone, so
// both screens must send the typed identifier there verbatim, not reshape it.
describe.each([
  ['Login', Login],
  ['LoginDesktop', LoginDesktop],
])('%s request', (_name, Screen) => {
  it.each(['gina-operator', 'Parent@Example.com', '(305) 555-0100'])('posts %s as the username field', async (identifier) => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ access: 'a', refresh: 'r' }),
    }));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();

    render(<Screen onSignedIn={vi.fn()} onForgotPassword={vi.fn()} />);
    await user.type(screen.getByLabelText('Email or phone'), identifier);
    await user.type(screen.getByLabelText('Password'), 'pw');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toMatch(/\/api\/token\/$/);
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ username: identifier, password: 'pw' });
  });
});

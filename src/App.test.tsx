import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { clearTokens, saveTokens } from './auth/tokens';

function fakeAccessToken(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  // Signature is never checked client-side (see auth/jwt.ts) - any string works.
  return `${header}.${body}.unsigned`;
}

// Both shells fetch on mount (ParentApp's children list; the operator
// console's VanMap fetches vans and opens a van socket). A real fetch() in
// jsdom can't resolve our relative URLs at all, and a real WebSocket would
// attempt a live network connection - both are stubbed out inert, since
// these tests only assert on the shell that renders, not on fetched data.
class InertWebSocket {
  onopen: (() => void) | null = null;
  onclose: ((ev: { code: number }) => void) | null = null;
  onmessage: ((ev: { data: string }) => void) | null = null;
  onerror: ((err: unknown) => void) | null = null;
  url: string;
  constructor(url: string) {
    this.url = url;
  }
  close() {}
}

afterEach(() => {
  clearTokens();
  vi.unstubAllGlobals();
  window.history.replaceState(null, '', '/');
});

describe('App', () => {
  it('renders SetPassword for a /set-password/:token URL, even with a session already saved', () => {
    window.history.pushState({}, '', '/set-password/abc123');
    saveTokens({ access: fakeAccessToken({ role: 'PARENT', is_superuser: false }), refresh: 'r' });
    render(<App />);
    expect(screen.getByText(/set your password/i)).toBeInTheDocument();
  });

  it('moves on from SetPassword after a successful submit, instead of staying stuck on it', async () => {
    // Regression: setPasswordToken used to be a plain useState with no
    // setter, so App kept rendering SetPassword forever after a successful
    // submit (the `if (setPasswordToken)` branch is checked before `session`
    // on every render) - a parent would see nothing happen and resubmit,
    // burning their now-single-use invite token on the second, rejected try.
    window.history.pushState({}, '', '/set-password/abc123');
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url.includes('/api/set-password/')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ access: fakeAccessToken({ role: 'PARENT', is_superuser: false }), refresh: 'r' }),
          };
        }
        if (url.includes('/api/children/')) return { ok: true, status: 200, json: async () => [] };
        throw new Error(`unexpected fetch: ${url} ${init?.method}`);
      }),
    );

    render(<App />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/^password$/i), 'a-new-password-123');
    await user.type(screen.getByLabelText(/confirm password/i), 'a-new-password-123');
    await user.click(screen.getByRole('button', { name: /set password/i }));

    await waitFor(() => expect(screen.queryByText(/set your password/i)).not.toBeInTheDocument());
    expect(screen.getByText('Ride')).toBeInTheDocument();
  });

  it('renders the operator console for an operator token', () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 200, json: async () => [] })));
    vi.stubGlobal('WebSocket', InertWebSocket);
    saveTokens({ access: fakeAccessToken({ role: 'OPERATOR', is_superuser: false }), refresh: 'r' });
    render(<App />);
    // The nav rail is the reliable, stable marker of the operator shell.
    expect(screen.getByLabelText('Live map')).toBeInTheDocument();
  });

  it('renders the parent app for a parent token', () => {
    // ParentApp fetches its children list on mount.
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, status: 200, json: async () => [] })),
    );
    saveTokens({ access: fakeAccessToken({ role: 'PARENT', is_superuser: false }), refresh: 'r' });
    render(<App />);
    // ParentApp's floating nav is the reliable, stable marker of the parent shell.
    expect(screen.getByText('Ride')).toBeInTheDocument();
    expect(screen.getByText('Schedule')).toBeInTheDocument();
  });

  it('renders Login when there is no session', () => {
    render(<App />);
    expect(screen.getByRole('heading')).toHaveTextContent(/know when/i);
  });
});

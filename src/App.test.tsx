import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { clearTokens, saveTokens } from './auth/tokens';

function fakeAccessToken(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  // Signature is never checked client-side (see auth/jwt.ts) - any string works.
  return `${header}.${body}.unsigned`;
}

afterEach(() => {
  clearTokens();
  vi.unstubAllGlobals();
});

describe('App', () => {
  it('renders the operator console for an operator token', () => {
    saveTokens({ access: fakeAccessToken({ role: 'OPERATOR', is_superuser: false }), refresh: 'r' });
    render(<App />);
    expect(screen.getByText(/console/i)).toBeInTheDocument();
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

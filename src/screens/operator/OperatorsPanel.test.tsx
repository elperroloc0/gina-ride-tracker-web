import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearTokens, saveTokens } from '../../auth/tokens';
import { OperatorsPanel } from './OperatorsPanel';

/** No signature check on decode (src/auth/jwt.ts) - a base64url JSON payload
 * with a real "." delimiter either side is enough to look like a JWT here. */
function fakeAccessToken(payload: object): string {
  const body = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `header.${body}.signature`;
}

const OPERATORS = [
  { id: 1, username: 'me', first_name: 'Me', email: 'me@ginasgym.com', phone_number: '', is_active: true },
  { id: 2, username: 'other', first_name: 'Other', email: 'other@ginasgym.com', phone_number: '', is_active: true },
];

beforeEach(() => {
  saveTokens({ access: fakeAccessToken({ role: 'OPERATOR', is_superuser: false, user_id: 1, exp: 9999999999 }), refresh: 'r' });
});

afterEach(() => {
  clearTokens();
  vi.unstubAllGlobals();
});

describe('OperatorsPanel', () => {
  it("hides the deactivate button for the signed-in operator's own row only", async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 200, json: async () => OPERATORS })));

    render(<OperatorsPanel />);
    await waitFor(() => expect(screen.getByText('other')).toBeInTheDocument());

    expect(screen.getAllByRole('button', { name: 'Deactivate' })).toHaveLength(1);
  });

  it('deactivates another operator', async () => {
    const fetchSpy = vi.fn(async (url: string, init?: RequestInit) => {
      if ((init?.method ?? 'GET') === 'POST' && url.includes('/deactivate/')) {
        return { ok: true, status: 200, json: async () => ({ ...OPERATORS[1], is_active: false }) };
      }
      return { ok: true, status: 200, json: async () => OPERATORS };
    });
    vi.stubGlobal('fetch', fetchSpy);
    vi.stubGlobal('confirm', vi.fn(() => true));

    render(<OperatorsPanel />);
    await waitFor(() => expect(screen.getByText('other')).toBeInTheDocument());

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Deactivate' }));

    await waitFor(() =>
      expect(
        fetchSpy.mock.calls.some(([url, init]) => (url as string).includes('/api/operators/2/deactivate/') && init?.method === 'POST'),
      ).toBe(true),
    );
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SetPassword from './SetPassword';
import { clearTokens, getAccess } from '../auth/tokens';

afterEach(() => {
  clearTokens();
  vi.unstubAllGlobals();
});

describe('SetPassword', () => {
  it('stores the returned tokens and signs in on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ access: 'a', refresh: 'r' }) })),
    );
    const onSignedIn = vi.fn();
    render(<SetPassword token="abc123" onSignedIn={onSignedIn} />);

    const user = userEvent.setup();
    const [password, confirm] = screen.getAllByDisplayValue('');
    await user.type(password, 'a-strong-passphrase-1');
    await user.type(confirm, 'a-strong-passphrase-1');
    await user.click(screen.getByRole('button', { name: /set password/i }));

    expect(onSignedIn).toHaveBeenCalled();
    expect(getAccess()).toBe('a');
  });

  it('shows an error and never calls the API when the passwords do not match', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const onSignedIn = vi.fn();
    render(<SetPassword token="abc123" onSignedIn={onSignedIn} />);

    const user = userEvent.setup();
    const [password, confirm] = screen.getAllByDisplayValue('');
    await user.type(password, 'a-strong-passphrase-1');
    await user.type(confirm, 'something-else');
    await user.click(screen.getByRole('button', { name: /set password/i }));

    expect(screen.getByText(/do not match/i)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(onSignedIn).not.toHaveBeenCalled();
  });
});

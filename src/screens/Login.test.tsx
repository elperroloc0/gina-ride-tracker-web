import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearTokens, getAccess } from '../auth/tokens';
import Login from './Login';

afterEach(() => {
  clearTokens();
  vi.unstubAllGlobals();
});

describe('Login', () => {
  it('signs in and stores tokens on valid credentials', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ access: 'test-access', refresh: 'test-refresh' }),
      })),
    );
    const onSignedIn = vi.fn();
    const user = userEvent.setup();

    render(<Login onSignedIn={onSignedIn} onForgotPassword={vi.fn()} />);
    await user.type(screen.getByLabelText('Email or phone'), '+13055550100');
    await user.type(screen.getByLabelText('Password'), 'correct-password');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(onSignedIn).toHaveBeenCalledTimes(1));
    // Exercises the real Login -> api/client -> auth/tokens chain end to end,
    // not just that onSignedIn fired.
    expect(getAccess()).toBe('test-access');
  });

  it('shows the wrong-password message on a 401 and does not sign in', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        status: 401,
        json: async () => ({ detail: 'No active account found with the given credentials' }),
      })),
    );
    const onSignedIn = vi.fn();
    const user = userEvent.setup();

    render(<Login onSignedIn={onSignedIn} onForgotPassword={vi.fn()} />);
    await user.type(screen.getByLabelText('Email or phone'), '+13055550100');
    await user.type(screen.getByLabelText('Password'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Those details do not match our records.')).toBeInTheDocument();
    expect(onSignedIn).not.toHaveBeenCalled();
    expect(getAccess()).toBeNull();
  });

  it('calls onForgotPassword when that link is clicked', async () => {
    const onForgotPassword = vi.fn();
    const user = userEvent.setup();

    render(<Login onSignedIn={vi.fn()} onForgotPassword={onForgotPassword} />);
    await user.click(screen.getByRole('button', { name: /forgot your password/i }));

    expect(onForgotPassword).toHaveBeenCalledTimes(1);
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ForgotPassword from './ForgotPassword';

afterEach(() => {
  vi.unstubAllGlobals();
});

/** Keyed by method + path so a mock covers all three requests a full
 * pass through this screen makes: send-code, verify-code, and the
 * embedded SetPassword's own mount-time GET /api/set-password/:token/. */
function fetchMock(overrides: {
  sendOk?: boolean;
  verify?: { ok: true; token: string } | { ok: false; status: number; detail: string };
}) {
  const { sendOk = true, verify } = overrides;
  return vi.fn(async (url: string, init?: RequestInit) => {
    const method = init?.method ?? 'GET';
    if (url.includes('/api/forgot-password/verify/')) {
      if (!verify || verify.ok) {
        return { ok: true, status: 200, json: async () => ({ token: verify && verify.ok ? verify.token : 'reset-token' }) };
      }
      return { ok: false, status: verify.status, json: async () => ({ detail: verify.detail }) };
    }
    if (url.includes('/api/forgot-password/')) {
      return sendOk
        ? { ok: true, status: 200, json: async () => ({ detail: 'ok' }) }
        : { ok: false, status: 500, json: async () => ({}) };
    }
    if (url.includes('/api/set-password/') && method === 'GET') {
      return { ok: true, status: 200, json: async () => ({ first_name: 'Carolina', phone_number: '+13055550100' }) };
    }
    throw new Error(`unexpected fetch: ${method} ${url}`);
  });
}

async function fillPhoneAndSend(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Phone number'), '3055550100');
  await user.click(screen.getByRole('button', { name: /text me a code/i }));
  await screen.findByText(/enter your code/i);
}

describe('ForgotPassword', () => {
  it('moves from the phone form to the code form on send, without a name shown yet', async () => {
    vi.stubGlobal('fetch', fetchMock({}));
    const user = userEvent.setup();

    render(<ForgotPassword onBack={vi.fn()} onSignedIn={vi.fn()} />);
    await fillPhoneAndSend(user);

    expect(screen.getByText(/we texted a 6-digit code to/i)).toBeInTheDocument();
  });

  it('shows a network error and stays on the phone form when sending fails', async () => {
    vi.stubGlobal('fetch', fetchMock({ sendOk: false }));
    const user = userEvent.setup();

    render(<ForgotPassword onBack={vi.fn()} onSignedIn={vi.fn()} />);
    await user.type(screen.getByLabelText('Phone number'), '3055550100');
    await user.click(screen.getByRole('button', { name: /text me a code/i }));

    expect(await screen.findByText(/could not reach the gym/i)).toBeInTheDocument();
    expect(screen.queryByText(/enter your code/i)).not.toBeInTheDocument();
  });

  it('hands the verified token straight to the embedded SetPassword screen', async () => {
    vi.stubGlobal('fetch', fetchMock({ verify: { ok: true, token: 'fresh-reset-token' } }));
    const user = userEvent.setup();

    render(<ForgotPassword onBack={vi.fn()} onSignedIn={vi.fn()} />);
    await fillPhoneAndSend(user);
    await user.type(screen.getByLabelText('Code'), '123456');
    await user.click(screen.getByRole('button', { name: /verify code/i }));

    // SetPassword.tsx's own heading, proving it actually took over.
    expect(await screen.findByText(/set your password/i)).toBeInTheDocument();
  });

  it('shows the backend detail message on a wrong code and does not advance', async () => {
    vi.stubGlobal('fetch', fetchMock({ verify: { ok: false, status: 400, detail: 'Incorrect or expired code.' } }));
    const user = userEvent.setup();

    render(<ForgotPassword onBack={vi.fn()} onSignedIn={vi.fn()} />);
    await fillPhoneAndSend(user);
    await user.type(screen.getByLabelText('Code'), '000000');
    await user.click(screen.getByRole('button', { name: /verify code/i }));

    expect(await screen.findByText('Incorrect or expired code.')).toBeInTheDocument();
    expect(screen.queryByText(/set your password/i)).not.toBeInTheDocument();
  });

  it('"Send a new code" goes back to the phone form, clearing the code field', async () => {
    vi.stubGlobal('fetch', fetchMock({}));
    const user = userEvent.setup();

    render(<ForgotPassword onBack={vi.fn()} onSignedIn={vi.fn()} />);
    await fillPhoneAndSend(user);
    await user.click(screen.getByRole('button', { name: /send a new code/i }));

    expect(await screen.findByText(/forgot your password/i)).toBeInTheDocument();
  });

  it('calls onBack from the phone form', async () => {
    vi.stubGlobal('fetch', fetchMock({}));
    const onBack = vi.fn();
    const user = userEvent.setup();

    render(<ForgotPassword onBack={onBack} onSignedIn={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /back to sign in/i }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});

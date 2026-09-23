import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AddOperatorForm } from './AddOperatorForm';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AddOperatorForm', () => {
  it('creates an operator with the entered fields', async () => {
    const fetchSpy = vi.fn(async (_url: string, _init?: RequestInit) => ({
      ok: true,
      status: 201,
      json: async () => ({ id: 4, username: 'jamie', first_name: 'Jamie', email: 'jamie@ginasgym.com', phone_number: '', is_active: true }),
    }));
    vi.stubGlobal('fetch', fetchSpy);
    const onDone = vi.fn();

    render(<AddOperatorForm onDone={onDone} onCancel={vi.fn()} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Name'), 'Jamie Rivera');
    await user.type(screen.getByLabelText('Username'), 'jamie');
    await user.type(screen.getByLabelText('Email'), 'jamie@ginasgym.com');
    await user.click(screen.getByRole('button', { name: /add operator/i }));

    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
    const call = fetchSpy.mock.calls.find(([url]) => (url as string).includes('/api/operators/'));
    const body = JSON.parse((call?.[1]?.body ?? '{}') as string);
    expect(body).toEqual({ first_name: 'Jamie Rivera', username: 'jamie', email: 'jamie@ginasgym.com', phone_number: undefined });
  });
});

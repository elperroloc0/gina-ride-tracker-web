import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EditParentForm } from './EditParentForm';
import type { ParentDTO } from '../../api/types';

const PARENT: ParentDTO = {
  id: 4,
  username: '+13055550100',
  first_name: 'Carolina',
  email: 'carolina@example.com',
  phone_number: '+13055550100',
  is_active: true,
  is_registered: true,
  children: [],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('EditParentForm', () => {
  it('pre-fills fields and PATCHes the edited values', async () => {
    const fetchSpy = vi.fn(async (_url: string, _init?: RequestInit) => ({
      ok: true,
      status: 200,
      json: async () => ({ ...PARENT, first_name: 'Caro' }),
    }));
    vi.stubGlobal('fetch', fetchSpy);
    const onDone = vi.fn();

    render(<EditParentForm parent={PARENT} onDone={onDone} onCancel={vi.fn()} />);
    expect(screen.getByText('Login: +13055550100')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Carolina')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'Caro');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url as string).toContain('/api/parents/4/');
    expect(init?.method).toBe('PATCH');
    expect(JSON.parse((init?.body ?? '{}') as string)).toEqual({
      first_name: 'Caro',
      email: 'carolina@example.com',
      phone_number: '+13055550100',
    });
  });

  it('shows the backend error message on failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 400, json: async () => ({ detail: 'Another account already uses this phone number.' }) })),
    );

    render(<EditParentForm parent={PARENT} onDone={vi.fn()} onCancel={vi.fn()} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText('Another account already uses this phone number.')).toBeInTheDocument();
  });
});

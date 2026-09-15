import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { VanForm } from './VanForm';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('VanForm', () => {
  it('creates a van with the entered plate and IMEI', async () => {
    const fetchSpy = vi.fn(async (_url: string, _init?: RequestInit) => ({
      ok: true,
      status: 201,
      json: async () => ({ id: 1, name: 'VAN-2', tracker_imei: '999888777' }),
    }));
    vi.stubGlobal('fetch', fetchSpy);
    const onDone = vi.fn();

    render(<VanForm onDone={onDone} onCancel={vi.fn()} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Plate number'), 'VAN-2');
    await user.type(screen.getByLabelText('Tracker IMEI'), '999888777');
    await user.click(screen.getByRole('button', { name: /add van/i }));

    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
    const call = fetchSpy.mock.calls.find(([url]) => (url as string).includes('/api/vans/'));
    const body = JSON.parse((call?.[1]?.body ?? '{}') as string);
    expect(body).toEqual({ name: 'VAN-2', tracker_imei: '999888777' });
  });

  it('pre-fills fields and PATCHes when editing an existing van', async () => {
    const fetchSpy = vi.fn(async (_url: string, _init?: RequestInit) => ({
      ok: true,
      status: 200,
      json: async () => ({ id: 5, name: 'VAN-5', tracker_imei: '111' }),
    }));
    vi.stubGlobal('fetch', fetchSpy);
    const onDone = vi.fn();

    render(<VanForm initial={{ id: 5, name: 'VAN-5', tracker_imei: '111' }} onDone={onDone} onCancel={vi.fn()} />);
    expect(screen.getByDisplayValue('VAN-5')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url as string).toContain('/api/vans/5/');
    expect(init?.method).toBe('PATCH');
  });
});

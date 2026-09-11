import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { connectVanSocket } from './vanSocket';

class MockWebSocket {
  static instances: MockWebSocket[] = [];
  url: string;
  onopen: (() => void) | null = null;
  onmessage: ((ev: { data: string }) => void) | null = null;
  onclose: ((ev: { code: number }) => void) | null = null;
  onerror: ((err: unknown) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  close() {
    this.onclose?.({ code: 1000 });
  }
}

beforeEach(() => {
  MockWebSocket.instances = [];
  vi.stubGlobal('WebSocket', MockWebSocket);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
}

describe('connectVanSocket', () => {
  it('fetches a ticket before opening, and appends child_id only when provided', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ ticket: 'abc123' }) })),
    );

    connectVanSocket({ childId: 7, onPosition: vi.fn(), onClose: vi.fn() });
    await flushMicrotasks();

    expect(fetch).toHaveBeenCalledWith('/api/ws-ticket/', expect.objectContaining({ method: 'POST' }));
    expect(MockWebSocket.instances).toHaveLength(1);
    const url = MockWebSocket.instances[0].url;
    expect(url).toContain('ticket=abc123');
    expect(url).toContain('child_id=7');
  });

  it('omits child_id for the operator (all-vans) socket', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ ticket: 'xyz' }) })),
    );

    connectVanSocket({ onPosition: vi.fn(), onClose: vi.fn() });
    await flushMicrotasks();

    expect(MockWebSocket.instances[0].url).not.toContain('child_id');
  });

  it('delivers position messages to onPosition', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ ticket: 't' }) })),
    );
    const onPosition = vi.fn();

    connectVanSocket({ childId: 1, onPosition, onClose: vi.fn() });
    await flushMicrotasks();

    const position = { van_id: 1, lat: 25.7, lon: -80.4, device_time: '2026-01-01T00:00:00Z' };
    MockWebSocket.instances[0].onmessage?.({ data: JSON.stringify(position) });

    expect(onPosition).toHaveBeenCalledWith(position);
  });

  it.each([4001, 4002])('does not reconnect after close code %d (a permanent no)', async (code) => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ ticket: 't' }) })),
    );

    connectVanSocket({ childId: 1, onPosition: vi.fn(), onClose: vi.fn() });
    await flushMicrotasks();

    MockWebSocket.instances[0].onclose?.({ code });
    await vi.advanceTimersByTimeAsync(15_000);

    expect(MockWebSocket.instances).toHaveLength(1);
  });

  it.each([1006, 4003])('reconnects with backoff after close code %d', async (code) => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ ticket: 't' }) })),
    );

    connectVanSocket({ childId: 1, onPosition: vi.fn(), onClose: vi.fn() });
    await flushMicrotasks();
    expect(MockWebSocket.instances).toHaveLength(1);

    MockWebSocket.instances[0].onclose?.({ code });
    await vi.advanceTimersByTimeAsync(1000);
    await flushMicrotasks();

    expect(MockWebSocket.instances).toHaveLength(2);
  });

  it('stops reconnecting once closed by the caller', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ ticket: 't' }) })),
    );

    const handle = connectVanSocket({ childId: 1, onPosition: vi.fn(), onClose: vi.fn() });
    await flushMicrotasks();
    handle.close();

    await vi.advanceTimersByTimeAsync(15_000);
    expect(MockWebSocket.instances).toHaveLength(1);
  });
});

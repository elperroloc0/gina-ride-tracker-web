import { requestWsTicket } from '../api/client';
import { wsBase } from '../api/apiBase';

export type VanPosition = {
  van_id: number;
  lat: number;
  lon: number;
  /** Course over ground in degrees (0=north), null when the tracker didn't report one. */
  course: number | null;
  device_time: string;
};

type ConnectOptions = {
  /** Omit for the operator (all-vans) socket; required for a parent socket. */
  childId?: number;
  onPosition: (p: VanPosition) => void;
  /** Fires when the socket actually opens - the operator console's "tracker online" signal. */
  onOpen?: () => void;
  /**
   * Close codes from tracking/consumers.py: 4001 = anonymous, 4002 = missing
   * or invalid child, 4003 = ride not active. All three are expected "no"
   * answers, not errors - anything else (a clean 1000 on ride_ended, a 1006
   * network drop, etc.) is also treated as reconnect-worthy.
   */
  onClose: (code: number) => void;
  onError?: (err: unknown) => void;
};

export type VanSocketHandle = { close: () => void };

const RECONNECT_DELAYS_MS = [1000, 2000, 5000, 10000];
// 4001 (anonymous) and 4002 (missing/invalid child) describe this connection
// attempt itself and won't change by waiting. 4003 (ride not active) is
// different - it is exactly the state a parent's tab sits in for as long as
// they have the app open before pickup, and it is expected to flip to
// accepted the moment the van reaches the school - so it must keep retrying,
// or a parent who opened the app early would never see the map open on its
// own the way ParentIdle's own copy promises.
const NO_RETRY_CODES = new Set([4001, 4002]);

/**
 * Connects to ws/van/, authenticated by a one-time, 30-second ticket fetched
 * fresh immediately before every attempt - tickets are never cached or
 * reused across reconnects, matching their server-side lifetime exactly.
 * Reconnects with backoff on any close the server didn't mean as a permanent
 * "no" - including 4003, which keeps retrying since it's temporary by nature.
 */
export function connectVanSocket(opts: ConnectOptions): VanSocketHandle {
  let closed = false;
  let socket: WebSocket | null = null;
  let attempt = 0;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;

  async function open() {
    if (closed) return;

    let ticket: string;
    try {
      ({ ticket } = await requestWsTicket());
    } catch (err) {
      opts.onError?.(err);
      scheduleRetry();
      return;
    }
    if (closed) return;

    const params = new URLSearchParams({ ticket });
    if (opts.childId != null) params.set('child_id', String(opts.childId));
    socket = new WebSocket(`${wsBase}/ws/van/?${params}`);

    socket.onopen = () => {
      attempt = 0;
      opts.onOpen?.();
    };
    socket.onmessage = (ev) => {
      try {
        opts.onPosition(JSON.parse(ev.data as string) as VanPosition);
      } catch (err) {
        opts.onError?.(err);
      }
    };
    socket.onclose = (ev) => {
      socket = null;
      opts.onClose(ev.code);
      if (!closed && !NO_RETRY_CODES.has(ev.code)) scheduleRetry();
    };
    socket.onerror = (err) => opts.onError?.(err);
  }

  function scheduleRetry() {
    if (closed) return;
    const delay = RECONNECT_DELAYS_MS[Math.min(attempt, RECONNECT_DELAYS_MS.length - 1)];
    attempt += 1;
    retryTimer = setTimeout(open, delay);
  }

  open();

  return {
    close() {
      closed = true;
      if (retryTimer) clearTimeout(retryTimer);
      socket?.close();
    },
  };
}

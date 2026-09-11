import { useEffect, useState } from 'react';
import { connectVanSocket, type VanPosition } from './vanSocket';

export type OperatorVanSocket = {
  positions: Record<number, VanPosition>;
  /** Whether the console's own all-vans socket is currently open - the "tracker online" signal. */
  connected: boolean;
};

/** All-vans socket for the operator console - one row per van, keyed by van_id. */
export function useOperatorVanSocket(): OperatorVanSocket {
  const [positions, setPositions] = useState<Record<number, VanPosition>>({});
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const handle = connectVanSocket({
      onOpen: () => setConnected(true),
      onPosition: (p) => setPositions((prev) => ({ ...prev, [p.van_id]: p })),
      // vanSocket already retries on its own; operators have nothing
      // child-specific to fall back to on a drop.
      onClose: () => setConnected(false),
    });
    return () => handle.close();
  }, []);

  return { positions, connected };
}

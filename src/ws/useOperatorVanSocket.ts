import { useEffect, useState } from 'react';
import { connectVanSocket, type VanPosition } from './vanSocket';

/** All-vans socket for the operator console - one row per van, keyed by van_id. */
export function useOperatorVanSocket(): Record<number, VanPosition> {
  const [positions, setPositions] = useState<Record<number, VanPosition>>({});

  useEffect(() => {
    const handle = connectVanSocket({
      onPosition: (p) => setPositions((prev) => ({ ...prev, [p.van_id]: p })),
      // vanSocket already retries on its own; operators have nothing
      // child-specific to fall back to on a drop.
      onClose: () => {},
    });
    return () => handle.close();
  }, []);

  return positions;
}

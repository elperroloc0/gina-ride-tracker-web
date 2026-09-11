import { useEffect, useState } from 'react';
import { STALE_AFTER_MS } from './constants';
import { connectVanSocket, type VanPosition } from './vanSocket';

export type RideStatus = 'connecting' | 'idle' | 'live' | 'stale';

/** One child's ride socket - drives ParentApp's Ride tab (Idle vs. ParentRide). */
export function useVanSocket(childId: number | undefined) {
  const [status, setStatus] = useState<RideStatus>('connecting');
  const [position, setPosition] = useState<VanPosition | null>(null);

  useEffect(() => {
    if (childId == null) return;
    setStatus('connecting');
    setPosition(null);

    const handle = connectVanSocket({
      childId,
      onPosition: (p) => {
        setPosition(p);
        setStatus('live');
      },
      // Every close - expected (4003) or not - defaults to idle. ParentIdle
      // is never the wrong thing to show while there's nothing live.
      onClose: () => setStatus('idle'),
    });

    return () => handle.close();
  }, [childId]);

  useEffect(() => {
    if (status !== 'live' || !position) return;
    const remaining = Math.max(0, new Date(position.device_time).getTime() + STALE_AFTER_MS - Date.now());
    const timer = setTimeout(() => setStatus('stale'), remaining);
    return () => clearTimeout(timer);
  }, [status, position]);

  return { status, position };
}

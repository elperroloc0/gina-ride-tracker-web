import { useEffect, useState } from 'react';

// Not specified anywhere in DESIGN-SYSTEM.md (it covers the parent/console
// artboard sizes, not this split) - picked as a reasonable default, tune here.
// Originally lived in App.tsx (desktop vs. mobile login only); the operator
// console now uses the same breakpoint so "desktop" means one thing app-wide.
export const DESKTOP_BREAKPOINT_PX = 900;

/** True at/above DESKTOP_BREAKPOINT_PX, live-updated on resize/rotation via
 * matchMedia's own change event (cheaper than a resize listener + width
 * comparison on every pixel of drag). jsdom has no matchMedia - see
 * src/test/setup.ts, which stubs it to "not desktop" for every test unless
 * a test overrides it itself. */
export function useIsDesktopViewport(): boolean {
  const query = `(min-width: ${DESKTOP_BREAKPOINT_PX}px)`;
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = () => setIsDesktop(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return isDesktop;
}

import { useEffect, useState } from 'react';
import { clearTokens, getAccess } from './auth/tokens';
import { decodeAccessToken, isOperator } from './auth/jwt';
import PhoneShell from './layout/PhoneShell';
import Login from './screens/Login';
import ParentApp from './screens/ParentApp';
import LoginDesktop from './screens/operator/LoginDesktop';
import OperatorConsole from './screens/operator/OperatorConsole';

// Not specified anywhere in DESIGN-SYSTEM.md (it covers the parent/console
// artboard sizes, not this split) - picked as a reasonable default, tune here.
const DESKTOP_BREAKPOINT_PX = 900;

type Session = { role: 'PARENT' | 'OPERATOR' } | null;

function readSession(): Session {
  const access = getAccess();
  if (!access) return null;
  const decoded = decodeAccessToken(access);
  if (!decoded) return null;
  return { role: isOperator(decoded) ? 'OPERATOR' : 'PARENT' };
}

function useIsDesktopViewport(): boolean {
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

export default function App() {
  // Read once on mount: a token already in storage means a previous session.
  const [session, setSession] = useState<Session>(() => readSession());
  const isDesktop = useIsDesktopViewport();

  function onSignOut() {
    clearTokens();
    setSession(null);
  }

  if (!session) {
    const onSignedIn = () => setSession(readSession());
    // No JWT yet at this point, so there's no role to branch on - viewport
    // width picks the form instead. Once signed in, the JWT's role claim is
    // authoritative regardless of which login screen was used to get it.
    return isDesktop ? (
      <LoginDesktop onSignedIn={onSignedIn} />
    ) : (
      <PhoneShell>
        <Login onSignedIn={onSignedIn} />
      </PhoneShell>
    );
  }

  if (session.role === 'OPERATOR') {
    return <OperatorConsole onSignOut={onSignOut} />;
  }

  return (
    <PhoneShell>
      <ParentApp onSignOut={onSignOut} />
    </PhoneShell>
  );
}

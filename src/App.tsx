import { useEffect, useState } from 'react';
import { clearTokens, getAccess } from './auth/tokens';
import { decodeAccessToken, isOperator } from './auth/jwt';
import PhoneShell from './layout/PhoneShell';
import ForgotPassword from './screens/ForgotPassword';
import Login from './screens/Login';
import ParentApp from './screens/ParentApp';
import SetPassword from './screens/SetPassword';
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

// The one URL path this app looks at - a ParentInvite text link, not a real
// client-side router (still deliberately out of scope; see plan). Read once:
// this only ever matters on the initial load a text message link lands on.
function readSetPasswordToken(): string | null {
  const match = /^\/set-password\/([^/]+)\/?$/.exec(window.location.pathname);
  return match ? decodeURIComponent(match[1]) : null;
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
  const [setPasswordToken, setSetPasswordToken] = useState(() => readSetPasswordToken());
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const isDesktop = useIsDesktopViewport();

  function onSignOut() {
    clearTokens();
    setSession(null);
  }

  if (setPasswordToken) {
    return (
      <SetPassword
        token={setPasswordToken}
        onSignedIn={() => {
          // Drop the token from the URL (so a refresh or back button can't
          // re-render this screen against an invite that's now used up) and
          // clear the state driving this branch - otherwise it's stuck
          // showing SetPassword forever, since `if (setPasswordToken)` above
          // is checked before `session` on every render regardless of it.
          window.history.replaceState(null, '', '/');
          setSetPasswordToken(null);
          setSession(readSession());
        }}
      />
    );
  }

  if (!session) {
    // Reset showForgotPassword on the way in too - otherwise a parent who
    // resets their password, later signs out, and comes back would land on
    // this screen again instead of Login (showForgotPassword outlives
    // session in state; only session controls whether this branch runs
    // at all).
    const onSignedIn = () => {
      setShowForgotPassword(false);
      setSession(readSession());
    };

    // Checked before the desktop/mobile split below (and not wrapped in
    // PhoneShell, like SetPassword) - one screen serves both entry points
    // instead of a separate desktop variant.
    if (showForgotPassword) {
      return <ForgotPassword onBack={() => setShowForgotPassword(false)} onSignedIn={onSignedIn} />;
    }

    // No JWT yet at this point, so there's no role to branch on - viewport
    // width picks the form instead. Once signed in, the JWT's role claim is
    // authoritative regardless of which login screen was used to get it.
    return isDesktop ? (
      <LoginDesktop onSignedIn={onSignedIn} onForgotPassword={() => setShowForgotPassword(true)} />
    ) : (
      <PhoneShell>
        <Login onSignedIn={onSignedIn} onForgotPassword={() => setShowForgotPassword(true)} />
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

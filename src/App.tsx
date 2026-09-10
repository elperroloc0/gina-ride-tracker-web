import { useState } from 'react';
import { Badge, Button, LivenessDot } from 'gina-ride-tracker-ds';
import { clearTokens, getAccess } from './auth/tokens';
import Login from './screens/Login';

export default function App() {
  // Read once on mount: a token already in storage means a previous session.
  const [signedIn, setSignedIn] = useState(() => getAccess() !== null);

  if (!signedIn) return <Login onSignedIn={() => setSignedIn(true)} />;

  // Placeholder for the real screens - it exists to prove the token survives
  // a reload, which is the whole point of storing it.
  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <LivenessDot state="ok" label="Signed in" />
        <Badge tone="info">token stored</Badge>
      </div>
      <Button
        variant="secondary"
        onClick={() => {
          clearTokens();
          setSignedIn(false);
        }}
      >
        Sign out
      </Button>
    </div>
  );
}

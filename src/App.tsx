import { useState } from 'react';
import { getAccess } from './auth/tokens';
import PhoneShell from './layout/PhoneShell';
import Login from './screens/Login';
import ParentApp from './screens/ParentApp';

export default function App() {
  // Read once on mount: a token already in storage means a previous session.
  const [signedIn, setSignedIn] = useState(() => getAccess() !== null);

  if (!signedIn)
    return (
      <PhoneShell>
        <Login onSignedIn={() => setSignedIn(true)} />
      </PhoneShell>
    );

  return (
    <PhoneShell>
      <ParentApp onSignOut={() => setSignedIn(false)} />
    </PhoneShell>
  );
}

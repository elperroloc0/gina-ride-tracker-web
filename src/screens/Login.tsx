import { useState, type FormEvent } from 'react';
import { Badge, Button, Input, WaveDivider } from 'gina-ride-tracker-ds';
import { ApiError, login } from '../api/client';

type Props = {
  onSignedIn: () => void;
};

/** Copy and hierarchy come from design/ParentLogin.dc.html. */
export default function Login({ onSignedIn }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(username, password);
      onSignedIn();
    } catch (err) {
      // 401 is the only failure a parent can act on. Anything else is ours,
      // and saying "wrong password" for a server fault sends them in circles.
      setError(
        err instanceof ApiError && err.status === 401
          ? 'That email and password do not match.'
          : 'Could not reach the gym right now. Try again in a moment.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          position: 'relative',
          background: 'var(--blue)',
          color: '#FFF',
          padding: '28px 20px 44px',
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 700,
            opacity: 0.75,
          }}
        >
          Gina's Gymnastics
        </div>
        <h1
          style={{
            fontFamily: 'var(--display)',
            fontSize: 40,
            lineHeight: 0.98,
            letterSpacing: '-0.03em',
            textTransform: 'uppercase',
            margin: '14px 0 0',
            textWrap: 'pretty',
          }}
        >
          Know when
          <br />
          she's there
        </h1>
        <p style={{ fontSize: 14, lineHeight: 1.5, opacity: 0.9, margin: '12px 0 0', maxWidth: '32ch' }}>
          Live van tracking and arrival texts for families riding with us.
        </p>
        <WaveDivider fill="var(--bg)" />
      </header>

      <main style={{ flex: 1, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)' }}>
              Email
            </span>
            <Input
              variant="mobile"
              type="email"
              autoComplete="username"
              placeholder="you@example.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)' }}>
              Password
            </span>
            <Input
              variant="mobile"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error ? (
            <div role="alert" style={{ display: 'flex' }}>
              <Badge tone="alert">{error}</Badge>
            </div>
          ) : null}

          <Button variant="primary" size="mobile" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>

          <Button variant="text" type="button">
            Forgot your password?
          </Button>
        </form>

        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-card-mobile)',
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700 }}>Accounts are set up by the gym</div>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>
            When your child is enrolled for van rides, we text you an invite link to pick a password.
          </p>
        </div>

        <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
          Questions? Call the front desk
          <br />
          <a href="tel:+13054564150" style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            1 (305) 456-4150
          </a>
        </div>
      </main>
    </div>
  );
}

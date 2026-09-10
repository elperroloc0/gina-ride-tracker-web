import { useState, type FormEvent } from 'react';
import { Badge, Button, Icon, Input, WaveDivider } from 'gina-ride-tracker-ds';
import { ApiError, login } from '../api/client';

type Props = {
  onSignedIn: () => void;
};

/** Copy and hierarchy come from design/ParentLogin.dc.html. */
export default function Login({ onSignedIn }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      <header style={{ position: 'relative', background: 'var(--blue)', color: '#FFF', padding: '40px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Grid-restricted to 24px per the icon rule in DESIGN-SYSTEM.md; the artboard draws it at 34px. */}
          <Icon name="logo" size={24} />
          <span style={{ fontFamily: 'var(--display)', fontSize: 13, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
            Gina's Gymnastics
          </span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--display)',
            fontSize: 40,
            lineHeight: 0.98,
            letterSpacing: '-0.03em',
            textTransform: 'uppercase',
            margin: '26px 0 12px',
            textWrap: 'pretty',
          }}
        >
          Know when
          <br />
          she's there
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.45, opacity: 0.9, margin: 0, paddingBottom: 34 }}>
          Live van tracking and arrival texts for families riding with us.
        </p>
        <WaveDivider fill="var(--bg)" height={30} />
      </header>

      <main style={{ flex: 1, padding: '22px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
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
            {/* The Input component only places a leading icon; the artboard's eye
                sits trailing and has to toggle, so this field is composed by hand
                from the same .gds-field classes Input itself renders. */}
            <div className="gds-field gds-field--mobile">
              <input
                className="gds-field__input"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                style={{ display: 'flex', flexShrink: 0, background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--muted)' }}
              >
                <Icon name="eye" size={20} />
              </button>
            </div>
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
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.35 }}>Accounts are set up by the gym</div>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.45, margin: 0 }}>
            When your child is enrolled for van rides, we text you an invite link to pick a password.
          </p>
        </div>

        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
          Questions? Call the front desk
          <br />
          <a href="tel:+13054564150" style={{ fontWeight: 600, color: 'var(--ink)', textDecoration: 'none', fontVariantNumeric: 'tabular-nums' }}>
            1 (305) 456-4150
          </a>
        </div>
      </main>
    </div>
  );
}

import { useState, type FormEvent } from 'react';
import { Badge, Button, Icon, Input } from 'gina-ride-tracker-ds';
import { ApiError, login } from '../../api/client';

type Props = {
  onSignedIn: () => void;
};

/**
 * Desktop sign-in, split-screen per design/LoginDesktop.dc.html. Deliberately
 * duplicates Login.tsx's form/error-handling logic rather than sharing a hook
 * - Login.tsx is left untouched on purpose (it's already correct, mobile-only,
 * and this screen never renders inside PhoneShell).
 *
 * The canvas mockup's CTA was hand-edited to a 14px-radius rectangle at one
 * point; this uses the DS Button's normal pill shape instead - Button's own
 * doc comment is explicit that every button in the system is a 999px pill,
 * and that shipped contract wins over a one-off static-mockup tweak.
 */
export default function LoginDesktop({ onSignedIn }: Props) {
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
      setError(
        err instanceof ApiError && err.status === 401
          ? 'Those details do not match our records.'
          : 'Could not reach the gym right now. Try again in a moment.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', background: 'var(--bg)', color: 'var(--ink)', overflow: 'hidden' }}>
      <div style={{ flex: '0 0 640px', background: 'var(--blue)', color: '#FFF', display: 'flex', flexDirection: 'column', padding: 56 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="logo" size={24} />
          <span style={{ fontFamily: 'var(--display)', fontSize: 13, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
            Gina's Gymnastics
          </span>
        </div>
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 460 }}>
          <h1
            style={{
              fontFamily: 'var(--display)', fontSize: 56, lineHeight: 0.98, letterSpacing: '-0.03em',
              textTransform: 'uppercase', textWrap: 'pretty', margin: 0,
            }}
          >
            Know when
            <br />
            they&rsquo;re there
          </h1>
        </div>
      </div>

      <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <form onSubmit={onSubmit} style={{ width: 400, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontFamily: 'var(--display)', fontSize: 28, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
            Sign in
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)' }}>
                Email or phone
              </span>
              <Input
                variant="console"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)' }}>
                Password
              </span>
              {/* Same by-hand composition as Login.tsx: Input only places a
                  leading icon, and this field needs a trailing show/hide toggle. */}
              <div className="gds-field gds-field--console">
                <input
                  className="gds-field__input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
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
                  <Icon name="eye" size={16} />
                </button>
              </div>
            </label>
          </div>

          {error ? (
            <div role="alert" style={{ display: 'flex' }}>
              <Badge tone="alert">{error}</Badge>
            </div>
          ) : null}

          <Button variant="primary" size="console" icon="van" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>

          <Button variant="text" type="button">
            Forgot your password?
          </Button>

          <div
            style={{
              background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-card)',
              padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 6,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700 }}>Accounts are set up by the gym</div>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.45, margin: 0 }}>
              Ask an operator to invite you if you don&rsquo;t have an account yet.
            </p>
          </div>

          <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
            Questions? Call the front desk
            <br />
            <a href="tel:+13054564150" style={{ fontWeight: 600, color: 'var(--ink)', textDecoration: 'none', fontVariantNumeric: 'tabular-nums' }}>
              1 (305) 456-4150
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

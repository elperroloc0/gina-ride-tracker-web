import { useState, type FormEvent } from 'react';
import { Badge, Button, Icon } from 'gina-ride-tracker-ds';
import { ApiError, setPassword } from '../api/client';
import { saveTokens } from '../auth/tokens';

type Props = {
  token: string;
  onSignedIn: () => void;
};

/**
 * Where a ParentInvite text link lands (App.tsx routes /set-password/:token
 * here before even looking at session state - this is reachable signed out,
 * on purpose). Not wrapped in PhoneShell: that frame simulates the app's own
 * fixed mockup proportions for the tracker screens, but a link opened from a
 * real text message should just fill the real viewport, like any ordinary
 * web page.
 */
export default function SetPassword({ token, onSignedIn }: Props) {
  const [password, setPasswordValue] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const tokens = await setPassword(token, password);
      saveTokens(tokens);
      onSignedIn();
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 400
          ? 'That link has expired or already been used - ask the gym to send a new one.'
          : 'Could not reach the gym right now. Try again in a moment.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24, boxSizing: 'border-box' }}>
      <form onSubmit={onSubmit} style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="logo" size={24} />
          <span style={{ fontFamily: 'var(--display)', fontSize: 12, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Gina&rsquo;s Gymnastics</span>
        </div>

        <div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 26, letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: 1.05 }}>
            Set your password
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>
            One more step to start following your ride on Gina&rsquo;s Ride Tracker.
          </p>
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)' }}>Password</span>
          <div className="gds-field gds-field--console">
            <input
              className="gds-field__input"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPasswordValue(e.target.value)}
              required
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

        <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)' }}>Confirm password</span>
          <div className="gds-field gds-field--console">
            <input
              className="gds-field__input"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
        </label>

        {error ? (
          <div role="alert" style={{ display: 'flex' }}>
            <Badge tone="alert">{error}</Badge>
          </div>
        ) : null}

        <Button variant="primary" size="mobile" type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Set password & sign in'}
        </Button>
      </form>
    </div>
  );
}

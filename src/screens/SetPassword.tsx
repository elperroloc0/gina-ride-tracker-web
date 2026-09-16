import { useEffect, useState, type FormEvent } from 'react';
import { Badge, Button, Icon } from 'gina-ride-tracker-ds';
import { ApiError, getInviteInfo, setPassword } from '../api/client';
import type { InviteInfoResponse } from '../api/types';
import { saveTokens } from '../auth/tokens';

type Props = {
  token: string;
  onSignedIn: () => void;
};

const LINK_DEAD_MESSAGE = 'That link has expired or already been used - ask the gym to send a new one.';

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

  // Who this link is for - fetched on mount so the page can show a name and
  // the phone number the parent needs to remember, before they type anything.
  // A dead link (expired/already used) is caught here too, not just on
  // submit - no point showing a password form for a token that can't work.
  const [inviteInfo, setInviteInfo] = useState<InviteInfoResponse | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getInviteInfo(token).then(
      (info) => {
        if (!cancelled) setInviteInfo(info);
      },
      (err) => {
        if (cancelled) return;
        setInviteError(err instanceof ApiError && err.status === 400 ? LINK_DEAD_MESSAGE : 'Could not reach the gym right now. Try again in a moment.');
      },
    );
    return () => {
      cancelled = true;
    };
  }, [token]);

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
      setError(err instanceof ApiError && err.status === 400 ? LINK_DEAD_MESSAGE : 'Could not reach the gym right now. Try again in a moment.');
    } finally {
      setBusy(false);
    }
  }

  if (inviteError) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24, boxSizing: 'border-box' }}>
        <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', textAlign: 'center' }}>
          <Icon name="logo" size={24} />
          <div style={{ fontFamily: 'var(--display)', fontSize: 22, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>Link no longer works</div>
          <Badge tone="alert">{inviteError}</Badge>
        </div>
      </div>
    );
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

        {inviteInfo ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 14px', borderRadius: 'var(--r-field)', background: 'var(--blue-tint)' }}>
            <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)' }}>Your login</span>
            <span style={{ fontFamily: 'var(--display)', fontSize: 18, fontVariantNumeric: 'tabular-nums' }}>{inviteInfo.phone_number}</span>
          </div>
        ) : null}

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

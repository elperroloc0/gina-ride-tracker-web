import { useState, type FormEvent } from 'react';
import { Badge, Button, Icon, Input } from 'gina-ride-tracker-ds';
import { ApiError, forgotPassword, verifyResetCode } from '../api/client';
import { normalizePhone } from '../domain/phone';
import SetPassword from './SetPassword';

type Props = {
  onBack: () => void;
  onSignedIn: () => void;
};

type Stage = 'phone' | 'code' | 'reset';

/**
 * Reached from the "Forgot your password?" link on both Login.tsx (mobile)
 * and LoginDesktop.tsx. Deliberately not wrapped in PhoneShell, same
 * reasoning as SetPassword.tsx: a centered card reads fine at any width, so
 * one screen serves both entry points instead of a separate desktop split.
 *
 * Three stages, not one form - phone number, then the texted code, then the
 * actual reset. The code (ForgotPasswordView/VerifyResetCodeView on the
 * backend) proves the caller actually has the phone *before* a
 * ParentInvite token is ever minted - typing in a number you don't own
 * gets you nothing without the code that only reaches the real device.
 * Once verified, the backend hands back a normal invite token and this
 * reuses SetPassword.tsx completely unmodified for the reset itself - the
 * exact same screen an operator-sent invite link lands on, just reached
 * in-app instead of via a second text.
 */
export default function ForgotPassword({ onBack, onSignedIn }: Props) {
  const [stage, setStage] = useState<Stage>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmitPhone(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await forgotPassword(normalizePhone(phone));
      setStage('code');
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 429
          ? 'Too many attempts. Try again in a bit.'
          : 'Could not reach the gym right now. Try again in a moment.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function onSubmitCode(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await verifyResetCode(normalizePhone(phone), code);
      setToken(response.token);
      setStage('reset');
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 400
          ? (err.detail ?? 'That code is incorrect.')
          : err instanceof ApiError && err.status === 429
            ? 'Too many attempts. Try again in a bit.'
            : 'Could not reach the gym right now. Try again in a moment.',
      );
    } finally {
      setBusy(false);
    }
  }

  if (stage === 'reset' && token) {
    return <SetPassword token={token} onSignedIn={onSignedIn} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24, boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="logo" size={24} />
          <span style={{ fontFamily: 'var(--display)', fontSize: 12, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Gina&rsquo;s Gymnastics</span>
        </div>

        {stage === 'phone' ? (
          <form onSubmit={onSubmitPhone} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ fontFamily: 'var(--display)', fontSize: 26, letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: 1.05 }}>
                Forgot your password?
              </div>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>
                Enter the phone number on file and we&rsquo;ll text you a code.
              </p>
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)' }}>
                Phone number
              </span>
              <Input type="tel" icon="phone" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </label>

            {error ? (
              <div role="alert" style={{ display: 'flex' }}>
                <Badge tone="alert">{error}</Badge>
              </div>
            ) : null}

            <Button variant="primary" size="mobile" type="submit" disabled={busy}>
              {busy ? 'Sending…' : 'Text me a code'}
            </Button>

            <Button variant="text" type="button" onClick={onBack}>
              Back to sign in
            </Button>
          </form>
        ) : (
          <form onSubmit={onSubmitCode} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ fontFamily: 'var(--display)', fontSize: 26, letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: 1.05 }}>
                Enter your code
              </div>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>
                We texted a 6-digit code to {phone}. It expires in 10 minutes.
              </p>
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)' }}>
                Code
              </span>
              <Input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                required
              />
            </label>

            {error ? (
              <div role="alert" style={{ display: 'flex' }}>
                <Badge tone="alert">{error}</Badge>
              </div>
            ) : null}

            <Button variant="primary" size="mobile" type="submit" disabled={busy || code.length !== 6}>
              {busy ? 'Verifying…' : 'Verify code'}
            </Button>

            <Button
              variant="text"
              type="button"
              onClick={() => {
                setStage('phone');
                setCode('');
                setError(null);
              }}
            >
              Send a new code
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

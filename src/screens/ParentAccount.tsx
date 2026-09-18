import { useEffect, useState, type FormEvent } from 'react';
import { Badge, Button, Card, Icon, Input, Toggle } from 'gina-ride-tracker-ds';
import { ApiError, changePassword, getMe, updateMe } from '../api/client';
import type { MeDTO } from '../api/types';
import { GYM_EMAIL, GYM_PHONE_DISPLAY, GYM_PHONE_E164 } from '../domain/gymContact';

/**
 * The parent's own account: login (read-only - phone_number is the actual
 * credential, not the name-derived `username` GinaGymnastics keeps
 * internally), email + notification channel (self-service via
 * GET/PATCH /api/me/), a password-change form, and a way to reach the gym.
 * No design mockup exists for this tab (same situation Schedule.tsx was in)
 * - built from the same mobile-card idioms rather than blocking on a
 * separate design pass.
 */
export default function ParentAccount() {
  const [me, setMe] = useState<MeDTO | null>(null);

  useEffect(() => {
    getMe().then(setMe);
  }, []);

  return (
    <div
      style={{
        minHeight: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        // Top/bottom clear ParentApp's floating header and nav bar (both
        // position: absolute, so they take no space in this div's own flow)
        // - 92 bottom matches the clearance ParentIdle's floating card
        // already uses for the same nav bar.
        padding: '76px 16px 92px',
        background: 'var(--bg)',
      }}
    >
      <div style={{ fontFamily: 'var(--display)', fontSize: 24, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
        Account
      </div>

      <Card variant="mobile">
        <SectionLabel>Login</SectionLabel>
        <div style={{ fontFamily: 'var(--display)', fontSize: 18, fontVariantNumeric: 'tabular-nums', marginTop: 6 }}>
          {me?.phone_number ?? '—'}
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0 0' }}>
          This is your phone number - it&rsquo;s how you sign in. Ask the gym if it ever needs to change.
        </p>
      </Card>

      {me ? <ProfileCard me={me} onSaved={setMe} /> : null}

      <PasswordCard />

      <Card variant="mobile">
        <SectionLabel>Contact the gym</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
          <ContactLink icon="mail" href={`mailto:${GYM_EMAIL}`} label={GYM_EMAIL} />
          <ContactLink icon="phone" href={`tel:${GYM_PHONE_E164}`} label={GYM_PHONE_DISPLAY} />
        </div>
      </Card>
    </div>
  );
}

function ProfileCard({ me, onSaved }: { me: MeDTO; onSaved: (me: MeDTO) => void }) {
  const [email, setEmail] = useState(me.email);
  const [notifyChannel, setNotifyChannel] = useState(me.notify_channel);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const dirty = email !== me.email || notifyChannel !== me.notify_channel;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await updateMe({ email, notify_channel: notifyChannel });
      onSaved(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? (err.detail ?? 'Could not save this right now.') : 'Could not reach the gym right now.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card variant="mobile">
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <SectionLabel>Email</SectionLabel>
        <Input
          variant="mobile"
          type="email"
          icon="mail"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setSaved(false);
          }}
          placeholder="you@example.com"
        />

        <Toggle
          checked={notifyChannel === 'EMAIL'}
          onChange={(checked) => {
            setNotifyChannel(checked ? 'EMAIL' : 'SMS');
            setSaved(false);
          }}
          size="form"
          label="Email notifications"
          consequence="Off sends text messages instead - the way it works today."
        />

        {error ? (
          <div role="alert" style={{ display: 'flex' }}>
            <Badge tone="alert">{error}</Badge>
          </div>
        ) : saved ? (
          <div style={{ display: 'flex' }}>
            <Badge tone="now">Saved</Badge>
          </div>
        ) : null}

        <Button variant="secondary" size="mobile" type="submit" disabled={busy || !dirty}>
          {busy ? 'Saving…' : 'Save'}
        </Button>
      </form>
    </Card>
  );
}

function PasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? (err.detail ?? 'Could not change your password.') : 'Could not reach the gym right now.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card variant="mobile">
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <SectionLabel>Change password</SectionLabel>

        <PasswordField
          label="Current password"
          value={currentPassword}
          onChange={setCurrentPassword}
          show={showPassword}
          onToggleShow={() => setShowPassword((v) => !v)}
          autoComplete="current-password"
        />
        <PasswordField
          label="New password"
          value={newPassword}
          onChange={setNewPassword}
          show={showPassword}
          autoComplete="new-password"
        />
        <PasswordField
          label="Confirm new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showPassword}
          autoComplete="new-password"
        />

        {error ? (
          <div role="alert" style={{ display: 'flex' }}>
            <Badge tone="alert">{error}</Badge>
          </div>
        ) : success ? (
          <div style={{ display: 'flex' }}>
            <Badge tone="now">Password updated</Badge>
          </div>
        ) : null}

        <Button
          variant="secondary"
          size="mobile"
          type="submit"
          disabled={busy || !currentPassword || !newPassword || !confirmPassword}
        >
          {busy ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </Card>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggleShow,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggleShow?: () => void;
  autoComplete: string;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)' }}>{label}</span>
      <div className="gds-field gds-field--mobile">
        <input
          className="gds-field__input"
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {onToggleShow ? (
          <button
            type="button"
            onClick={onToggleShow}
            aria-label={show ? 'Hide passwords' : 'Show passwords'}
            aria-pressed={show}
            style={{ display: 'flex', flexShrink: 0, background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--muted)' }}
          >
            <Icon name="eye" size={20} />
          </button>
        ) : null}
      </div>
    </label>
  );
}

function ContactLink({ icon, href, label }: { icon: 'mail' | 'phone'; href: string; label: string }) {
  return (
    <a href={href} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink)', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: '999px',
          background: 'var(--fill)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: 'var(--muted)',
        }}
      >
        <Icon name={icon} size={16} />
      </span>
      {label}
    </a>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)' }}>
      {children}
    </span>
  );
}

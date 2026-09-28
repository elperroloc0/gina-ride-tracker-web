import { useState, type FormEvent, type ReactNode } from 'react';
import { Badge, Button, Input } from 'gina-ride-tracker-ds';
import { ApiError, createOperator } from '../../api/client';
import { useIsDesktopViewport } from '../../layout/useIsDesktopViewport';

type Props = {
  onDone: () => void;
  onCancel: () => void;
};

/** Same shape as AddParentForm - no password here: the new operator is sent
 * a set-password link (SMS if a phone is given, otherwise email). */
export function AddOperatorForm({ onDone, onCancel }: Props) {
  const [firstName, setFirstName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDesktop = useIsDesktopViewport();
  const inputVariant = isDesktop ? 'console' : 'mobile';
  const buttonSize = isDesktop ? 'console' : 'mobile';

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await createOperator({ first_name: firstName, username, email, phone_number: phoneNumber || undefined });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? (err.detail ?? 'Could not create this operator right now.') : 'Could not create this operator right now.');
    } finally {
      setBusy(false);
    }
  }

  return (
    // Fixed header/footer around a scrollable field list - on a short phone
    // viewport a plain flowing form can leave the submit row straddling the
    // fold (see AddParentForm's own note on this), so every operator form
    // gets this same shape rather than only the one that's proven to overflow.
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: isDesktop ? 24 : 16, height: '100%', boxSizing: 'border-box' }}>
      <div style={{ fontFamily: 'var(--display)', fontSize: 20, textTransform: 'uppercase', flexShrink: 0 }}>Add an operator</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <Field label="Name">
          <Input variant={inputVariant} value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </Field>

        <Field label="Username">
          <Input variant={inputVariant} value={username} onChange={(e) => setUsername(e.target.value)} required />
        </Field>

        <Field label="Email">
          <Input variant={inputVariant} type="email" icon="mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>

        <Field label="Phone (optional)">
          <Input variant={inputVariant} type="tel" icon="phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
        </Field>
      </div>

      {error ? (
        <div role="alert" style={{ display: 'flex', flexShrink: 0 }}>
          <Badge tone="alert">{error}</Badge>
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <Button variant="secondary" size={buttonSize} type="button" onClick={onCancel} style={{ flex: isDesktop ? undefined : 1 }}>
          Cancel
        </Button>
        <Button variant="primary" size={buttonSize} type="submit" icon="plus" disabled={busy} style={{ flex: isDesktop ? undefined : 1 }}>
          {busy ? 'Adding…' : 'Add operator'}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)' }}>{label}</span>
      {children}
    </label>
  );
}

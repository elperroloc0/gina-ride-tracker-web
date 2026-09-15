import { useState, type FormEvent, type ReactNode } from 'react';
import { Badge, Button, Input } from 'gina-ride-tracker-ds';
import { ApiError, createOperator } from '../../api/client';

type Props = {
  onDone: () => void;
  onCancel: () => void;
};

/** Same shape as AddParentForm - new operators get their password set
 * directly here by the creating operator, rather than a texted invite link
 * (that mechanism, ParentInvite, is parent-specific). */
export function AddOperatorForm({ onDone, onCancel }: Props) {
  const [firstName, setFirstName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await createOperator({ first_name: firstName, username, email, phone_number: phoneNumber || undefined, password });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? (err.detail ?? 'Could not create this operator right now.') : 'Could not create this operator right now.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
      <div style={{ fontFamily: 'var(--display)', fontSize: 20, textTransform: 'uppercase' }}>Add an operator</div>

      <Field label="Name">
        <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
      </Field>

      <Field label="Username">
        <Input value={username} onChange={(e) => setUsername(e.target.value)} required />
      </Field>

      <Field label="Email">
        <Input type="email" icon="mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </Field>

      <Field label="Phone (optional)">
        <Input type="tel" icon="phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
      </Field>

      <Field label="Password">
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </Field>

      {error ? (
        <div role="alert" style={{ display: 'flex' }}>
          <Badge tone="alert">{error}</Badge>
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" icon="plus" disabled={busy}>
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

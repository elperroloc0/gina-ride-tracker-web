import { useState, type FormEvent, type ReactNode } from 'react';
import { Badge, Button, Input } from 'gina-ride-tracker-ds';
import { ApiError, updateParent } from '../../api/client';
import type { ParentDTO } from '../../api/types';

type Props = {
  parent: ParentDTO;
  onDone: () => void;
  onCancel: () => void;
};

/** Editing phone_number here also updates the parent's login (username)
 * server-side (ParentSerializer.update()) - a parent's username IS their
 * phone number, kept in lockstep, never a separately-editable field. Shown
 * as a static "Login" line instead of an input for that reason, same as
 * GeoFenceForm omits the server-derived traccar_id entirely. */
export function EditParentForm({ parent, onDone, onCancel }: Props) {
  const [firstName, setFirstName] = useState(parent.first_name);
  const [email, setEmail] = useState(parent.email);
  const [phoneNumber, setPhoneNumber] = useState(parent.phone_number);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await updateParent(parent.id, { first_name: firstName, email, phone_number: phoneNumber });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? (err.detail ?? 'Could not save this parent right now.') : 'Could not save this parent right now.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
      <div style={{ fontFamily: 'var(--display)', fontSize: 20, textTransform: 'uppercase' }}>Edit parent</div>

      <div style={{ fontSize: 12, color: 'var(--muted)' }}>Login: {parent.username}</div>

      <Field label="Name">
        <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
      </Field>

      <Field label="Email">
        <Input type="email" icon="mail" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>

      <Field label="Phone">
        <Input type="tel" icon="phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
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
        <Button variant="primary" type="submit" icon="check" disabled={busy}>
          {busy ? 'Saving…' : 'Save'}
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

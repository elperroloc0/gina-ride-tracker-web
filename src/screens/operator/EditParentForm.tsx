import { useState, type FormEvent, type ReactNode } from 'react';
import { Badge, Button, Input } from 'gina-ride-tracker-ds';
import { ApiError, updateParent } from '../../api/client';
import type { ParentDTO } from '../../api/types';
import { useIsDesktopViewport } from '../../layout/useIsDesktopViewport';

type Props = {
  parent: ParentDTO;
  onDone: () => void;
  onCancel: () => void;
};

/** phone_number (the Phone field below) is a parent's actual login -
 * matched directly by FlexibleLoginBackend - not the separate `username`
 * field (a name-derived internal handle, generated once at enrollment and
 * never shown here, same as GeoFenceForm omits the server-derived
 * traccar_id entirely). No standalone "Login" line: the Phone field below
 * already is that value. */
export function EditParentForm({ parent, onDone, onCancel }: Props) {
  const [firstName, setFirstName] = useState(parent.first_name);
  const [email, setEmail] = useState(parent.email);
  const [phoneNumber, setPhoneNumber] = useState(parent.phone_number);
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
      await updateParent(parent.id, { first_name: firstName, email, phone_number: phoneNumber });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? (err.detail ?? 'Could not save this parent right now.') : 'Could not save this parent right now.');
    } finally {
      setBusy(false);
    }
  }

  return (
    // See AddOperatorForm's note on this shape.
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: isDesktop ? 24 : 16, height: '100%', boxSizing: 'border-box' }}>
      <div style={{ fontFamily: 'var(--display)', fontSize: 20, textTransform: 'uppercase', flexShrink: 0 }}>Edit parent</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <Field label="Name">
          <Input variant={inputVariant} value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </Field>

        <Field label="Email">
          <Input variant={inputVariant} type="email" icon="mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>

        <Field label="Phone">
          <Input variant={inputVariant} type="tel" icon="phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
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
        <Button variant="primary" size={buttonSize} type="submit" icon="check" disabled={busy} style={{ flex: isDesktop ? undefined : 1 }}>
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

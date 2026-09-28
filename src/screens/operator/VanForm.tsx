import { useState, type FormEvent, type ReactNode } from 'react';
import { Badge, Button, Input } from 'gina-ride-tracker-ds';
import { ApiError, createVan, updateVan } from '../../api/client';
import type { VanDTO } from '../../api/types';
import { useIsDesktopViewport } from '../../layout/useIsDesktopViewport';

type Props = {
  initial?: VanDTO;
  onDone: () => void;
  onCancel: () => void;
};

/** Same shape as AddParentForm - one field set serves both add and edit,
 * picked by whether `initial` is passed. */
export function VanForm({ initial, onDone, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [trackerImei, setTrackerImei] = useState(initial?.tracker_imei ?? '');
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
      const payload = { name, tracker_imei: trackerImei };
      if (initial) await updateVan(initial.id, payload);
      else await createVan(payload);
      onDone();
    } catch (err) {
      setError(err instanceof ApiError && err.status === 400 ? 'Check the plate number and IMEI.' : 'Could not save this van right now.');
    } finally {
      setBusy(false);
    }
  }

  return (
    // See AddOperatorForm's note on this shape.
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: isDesktop ? 24 : 16, height: '100%', boxSizing: 'border-box' }}>
      <div style={{ fontFamily: 'var(--display)', fontSize: 20, textTransform: 'uppercase', flexShrink: 0 }}>{initial ? 'Edit van' : 'Add a van'}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <Field label="Plate number">
          <Input variant={inputVariant} value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>

        <Field label="Tracker IMEI">
          <Input variant={inputVariant} value={trackerImei} onChange={(e) => setTrackerImei(e.target.value)} required />
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
        <Button variant="primary" size={buttonSize} type="submit" icon={initial ? 'check' : 'plus'} disabled={busy} style={{ flex: isDesktop ? undefined : 1 }}>
          {busy ? 'Saving…' : initial ? 'Save' : 'Add van'}
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

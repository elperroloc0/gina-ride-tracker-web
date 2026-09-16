import { useEffect, useState } from 'react';
import { Badge, LivenessDot, Table, TableCell, TableHeader, TableRow } from 'gina-ride-tracker-ds';
import { ApiError, deactivateParent, getParents, resendParentInvite } from '../../api/client';
import type { ParentDTO } from '../../api/types';
import { EditParentForm } from './EditParentForm';

/** View/edit/deactivate for parent accounts, plus resending the set-password
 * invite for one who lost access. Creation is still Children's "add a family"
 * flow (EnrollParentView), untouched - this only manages accounts that
 * already exist. Embedded as a section inside ChildrenRoster (below the
 * children table), not its own console tab - no outer page padding/height
 * here, the parent component's own wrapper already provides that. */
export function ParentsPanel() {
  const [parents, setParents] = useState<ParentDTO[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const [rowNotice, setRowNotice] = useState<string | null>(null);

  function refetch() {
    getParents().then(setParents);
  }

  useEffect(refetch, []);

  async function onDeactivate(parent: ParentDTO) {
    if (!window.confirm(`Deactivate ${parent.first_name || parent.phone_number}? They won't be able to sign in anymore.`)) return;
    setRowError(null);
    setRowNotice(null);
    try {
      await deactivateParent(parent.id);
      refetch();
    } catch (err) {
      setRowError(err instanceof ApiError ? (err.detail ?? 'Could not deactivate this parent.') : 'Could not deactivate this parent.');
    }
  }

  async function onResendInvite(parent: ParentDTO) {
    if (!parent.phone_number) {
      setRowError('This parent has no phone number on file - add one via Edit first.');
      return;
    }
    if (!window.confirm(`Text a new sign-in link to ${parent.phone_number}?`)) return;
    setRowError(null);
    setRowNotice(null);
    try {
      await resendParentInvite(parent.id);
      setRowNotice(`Sent a new sign-in link to ${parent.phone_number}.`);
    } catch (err) {
      setRowError(err instanceof ApiError ? (err.detail ?? 'Could not send the invite.') : 'Could not send the invite.');
    }
  }

  const editing = parents.find((p) => p.id === editingId);
  if (editing) {
    return (
      <EditParentForm
        parent={editing}
        onCancel={() => setEditingId(null)}
        onDone={() => {
          setEditingId(null);
          refetch();
        }}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, borderTop: '1px solid var(--line)', paddingTop: 24 }}>
      <div style={{ fontFamily: 'var(--display)', fontSize: 24, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
        Parents
      </div>

      {rowError ? (
        <div role="alert" style={{ display: 'flex' }}>
          <Badge tone="alert">{rowError}</Badge>
        </div>
      ) : null}
      {rowNotice ? (
        <div style={{ display: 'flex' }}>
          <Badge tone="now">{rowNotice}</Badge>
        </div>
      ) : null}

      {parents.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>No parents enrolled yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableCell grow={2}>Name / login</TableCell>
            <TableCell basis={120}>Registered</TableCell>
            <TableCell grow={2}>Children</TableCell>
            <TableCell basis={110}>Status</TableCell>
            <TableCell grow={2} basis={190}>&nbsp;</TableCell>
          </TableHeader>
          {parents.map((parent) => (
            <TableRow key={parent.id}>
              <TableCell grow={2}>
                <div style={{ fontWeight: 600 }}>{parent.first_name || parent.phone_number}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{parent.phone_number}</div>
                {parent.email ? <div style={{ fontSize: 12, color: 'var(--muted)' }}>{parent.email}</div> : null}
              </TableCell>
              <TableCell basis={120}>
                <LivenessDot
                  state={parent.is_registered ? 'ok' : 'stale'}
                  label={parent.is_registered ? 'Registered' : 'Pending'}
                />
              </TableCell>
              <TableCell grow={2}>{parent.children.map((c) => c.name).join(', ') || '—'}</TableCell>
              <TableCell basis={110}>
                <Badge tone={parent.is_active ? 'now' : 'scheduled'}>{parent.is_active ? 'Active' : 'Deactivated'}</Badge>
              </TableCell>
              <TableCell grow={2} basis={190}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <button type="button" onClick={() => setEditingId(parent.id)} style={rowButtonStyle}>
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onResendInvite(parent)}
                    disabled={!parent.phone_number}
                    title={parent.phone_number ? undefined : 'No phone number on file'}
                    style={{ ...rowButtonStyle, opacity: parent.phone_number ? 1 : 0.45, cursor: parent.phone_number ? 'pointer' : 'not-allowed' }}
                  >
                    Resend
                  </button>
                  {parent.is_active ? (
                    <button type="button" onClick={() => onDeactivate(parent)} style={rowButtonStyle}>
                      Deactivate
                    </button>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}
    </div>
  );
}

const rowButtonStyle: React.CSSProperties = {
  border: '1px solid var(--line)',
  borderRadius: 'var(--r-field)',
  background: 'transparent',
  color: 'var(--muted)',
  fontSize: 12,
  padding: '6px 10px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

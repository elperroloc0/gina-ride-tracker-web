import { useEffect, useState } from 'react';
import { Badge, Icon, Table, TableCell, TableHeader, TableRow } from 'gina-ride-tracker-ds';
import { ApiError, deactivateOperator, getOperators } from '../../api/client';
import type { OperatorDTO } from '../../api/types';
import { decodeAccessToken } from '../../auth/jwt';
import { getAccess } from '../../auth/tokens';
import { useIsDesktopViewport } from '../../layout/useIsDesktopViewport';
import { AddOperatorForm } from './AddOperatorForm';

/** Create/deactivate for OTHER operator accounts - parent accounts still go
 * through Children's "add a family" flow, untouched. Deactivate is a soft
 * state (User.is_active=False server-side), not a delete, and an operator
 * can't deactivate their own account here (see the self-guard below). */
export function OperatorsPanel() {
  const [operators, setOperators] = useState<OperatorDTO[]>([]);
  const [adding, setAdding] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);
  const selfId = decodeAccessToken(getAccess() ?? '')?.user_id;
  const isDesktop = useIsDesktopViewport();

  function refetch() {
    getOperators().then(setOperators);
  }

  useEffect(refetch, []);

  async function onDeactivate(operator: OperatorDTO) {
    if (!window.confirm(`Deactivate ${operator.username}? They won't be able to sign in anymore.`)) return;
    setRowError(null);
    try {
      await deactivateOperator(operator.id);
      refetch();
    } catch (err) {
      setRowError(err instanceof ApiError ? (err.detail ?? 'Could not deactivate this operator.') : 'Could not deactivate this operator.');
    }
  }

  if (adding) {
    return (
      <AddOperatorForm
        onCancel={() => setAdding(false)}
        onDone={() => {
          setAdding(false);
          refetch();
        }}
      />
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: isDesktop ? 24 : 16,
        height: '100%',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontFamily: 'var(--display)', fontSize: 24, letterSpacing: '-0.02em', textTransform: 'uppercase', flexGrow: 1 }}>
          Operators
        </div>
        <button
          type="button"
          onClick={() => setAdding(true)}
          aria-label="Add an operator"
          style={{
            width: isDesktop ? 32 : 44,
            height: isDesktop ? 32 : 44,
            borderRadius: '999px',
            border: 'none',
            cursor: 'pointer',
            background: 'var(--ink)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon name="plus" size={isDesktop ? 16 : 20} />
        </button>
      </div>

      {rowError ? (
        <div role="alert" style={{ display: 'flex' }}>
          <Badge tone="alert">{rowError}</Badge>
        </div>
      ) : null}

      {operators.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>No other operators yet.</p>
      ) : isDesktop ? (
        <Table>
          <TableHeader>
            <TableCell grow={2}>Name</TableCell>
            <TableCell grow={2}>Email</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>&nbsp;</TableCell>
          </TableHeader>
          {operators.map((operator) => (
            <TableRow key={operator.id}>
              <TableCell grow={2}>
                <div style={{ fontWeight: 600 }}>{operator.first_name || operator.username}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{operator.username}</div>
              </TableCell>
              <TableCell grow={2}>{operator.email}</TableCell>
              <TableCell>
                <Badge tone={operator.is_active ? 'now' : 'scheduled'}>{operator.is_active ? 'Active' : 'Deactivated'}</Badge>
              </TableCell>
              <TableCell>
                {operator.is_active && operator.id !== selfId ? (
                  <button
                    type="button"
                    onClick={() => onDeactivate(operator)}
                    style={{
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--r-field)',
                      background: 'transparent',
                      color: 'var(--muted)',
                      fontSize: 12,
                      padding: '6px 10px',
                      cursor: 'pointer',
                    }}
                  >
                    Deactivate
                  </button>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </Table>
      ) : (
        // Same 4-column data as a stacked card: name+username, then a row
        // pairing the status badge with the one action, so nothing needs a
        // horizontal scroll to reach it.
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {operators.map((operator) => (
            <div
              key={operator.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: '14px 16px',
                borderRadius: 'var(--r-row)',
                border: '1px solid var(--line)',
                background: 'var(--surface)',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700 }}>{operator.first_name || operator.username}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{operator.username}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {operator.email}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 4 }}>
                <Badge tone={operator.is_active ? 'now' : 'scheduled'}>{operator.is_active ? 'Active' : 'Deactivated'}</Badge>
                {operator.is_active && operator.id !== selfId ? (
                  <button
                    type="button"
                    onClick={() => onDeactivate(operator)}
                    style={{
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--r-field)',
                      background: 'transparent',
                      color: 'var(--muted)',
                      fontSize: 13,
                      padding: '10px 16px',
                      minHeight: 40,
                      cursor: 'pointer',
                    }}
                  >
                    Deactivate
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Avatar, Icon } from 'gina-ride-tracker-ds';
import type { ChildDTO } from '../api/types';
import { initialsOf } from '../domain/initials';

type Props = {
  kids: ChildDTO[];
  selectedId: number;
  onSelect: (id: number) => void;
};

/**
 * At one child (the common case today), this is purely visual - same pill as
 * before, no interaction. It only becomes a real switcher once a parent
 * account actually has more than one child.
 */
export function ChildSwitcher({ kids, selectedId, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const selected = kids.find((c) => c.id === selectedId);
  const canSwitch = kids.length > 1;

  return (
    <div style={{ position: 'relative' }}>
      <div
        onClick={canSwitch ? () => setOpen((v) => !v) : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          height: 40,
          padding: '0 6px 0 14px',
          borderRadius: '999px',
          background: 'var(--surface)',
          boxShadow: '0 4px 14px rgba(0,0,0,0.14)',
          cursor: canSwitch ? 'pointer' : 'default',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600 }}>{selected?.name ?? ''}</span>
        {canSwitch ? <Icon name="chevron" size={16} /> : null}
      </div>

      {open ? (
        <div
          style={{
            position: 'absolute',
            top: 48,
            right: 0,
            background: 'var(--surface)',
            borderRadius: 'var(--r-card)',
            boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
            padding: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            minWidth: 160,
            zIndex: 1,
          }}
        >
          {kids.map((child) => (
            <button
              key={child.id}
              type="button"
              onClick={() => {
                onSelect(child.id);
                setOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 'var(--r-row)',
                background: child.id === selectedId ? 'var(--blue-surface)' : 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <Avatar initials={initialsOf(child.name)} size={30} state={child.id === selectedId ? 'selected' : 'default'} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>{child.name}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

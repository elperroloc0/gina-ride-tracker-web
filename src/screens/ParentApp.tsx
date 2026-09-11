import { useState } from 'react';
import { Icon } from 'gina-ride-tracker-ds';
import { clearTokens } from '../auth/tokens';
import ParentIdle from './ParentIdle';

type Tab = 'ride' | 'schedule';

/**
 * Shell around the parent-facing screens: floating logo + child switcher up top,
 * floating Ride/Schedule nav at the bottom, matching design/ParentLive.dc.html
 * and siblings. Only one child for now - the switcher is drawn but not wired,
 * since there is nowhere for it to switch to until multi-child accounts exist.
 */
export default function ParentApp({ onSignOut }: { onSignOut: () => void }) {
  const [tab, setTab] = useState<Tab>('ride');
  const childName = 'Maya';

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'absolute', left: 16, top: 16, right: 16, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            width: 38,
            height: 38,
            borderRadius: '999px',
            background: 'var(--surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(0,0,0,0.14)',
            flexShrink: 0,
          }}
        >
          <Icon name="logo" size={20} />
        </span>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            height: 40,
            padding: '0 6px 0 14px',
            borderRadius: '999px',
            background: 'var(--surface)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.14)',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600 }}>{childName}</span>
          <Icon name="chevron" size={16} />
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {tab === 'ride' ? <ParentIdle childName={childName} /> : <SchedulePlaceholder onSignOut={onSignOut} />}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 16,
          height: 60,
          background: 'var(--ink)',
          borderRadius: 20,
          boxShadow: '0 12px 28px rgba(0,0,0,0.22)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 44,
        }}
      >
        <NavTab icon="van" label="Ride" active={tab === 'ride'} onClick={() => setTab('ride')} />
        <NavTab icon="clock" label="Schedule" active={tab === 'schedule'} onClick={() => setTab('schedule')} />
      </div>
    </div>
  );
}

function NavTab({ icon, label, active, onClick }: { icon: 'van' | 'clock'; label: string; active: boolean; onClick: () => void }) {
  const color = active ? '#FFFFFF' : '#77777D';
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', padding: 0, cursor: 'pointer', color }}
    >
      <Icon name={icon} size={20} />
      <span style={{ fontSize: 10, fontWeight: active ? 700 : 600 }}>{label}</span>
    </button>
  );
}

/** Stands in for the Schedule tab until it has a design; carries sign-out for now
 * since the app has no other way back to Login while testing. */
function SchedulePlaceholder({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 20, textAlign: 'center' }}>
      <span style={{ fontFamily: 'var(--display)', fontSize: 20, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Schedule</span>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)', maxWidth: 240 }}>Not designed yet.</p>
      <button
        type="button"
        onClick={() => {
          clearTokens();
          onSignOut();
        }}
        style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}
      >
        Sign out
      </button>
    </div>
  );
}

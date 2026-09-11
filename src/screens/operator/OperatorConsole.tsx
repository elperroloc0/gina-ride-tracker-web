import { useState, type ReactNode } from 'react';
import { Button, Icon, LivenessDot } from 'gina-ride-tracker-ds';
import { getAccess } from '../../auth/tokens';
import { decodeAccessToken } from '../../auth/jwt';
import { useOperatorVanSocket } from '../../ws/useOperatorVanSocket';
import { ChildrenRoster } from './ChildrenRoster';
import { RoutesPanel } from './RoutesPanel';
import { VanMap } from './VanMap';

type Section = 'live' | 'children' | 'routes';

type Props = {
  onSignOut: () => void;
};

/**
 * Desktop shell for operators: a full-bleed live map plus a left nav rail,
 * per design/Console.dc.html. Children/Routes swap the map out for a full
 * white panel (same tab-swap granularity ParentApp already uses for
 * Ride/Schedule) rather than keeping the map as a permanent background
 * behind a narrow floating panel - see VanMap's doc comment for why the
 * mockup's fuller live panel isn't reproduced here.
 */
export default function OperatorConsole({ onSignOut }: Props) {
  const [section, setSection] = useState<Section>('live');
  const { positions, connected } = useOperatorVanSocket();
  const decoded = decodeAccessToken(getAccess() ?? '');
  const operatorInitials = (decoded?.first_name ?? 'OP').slice(0, 2).toUpperCase();

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      {section === 'live' ? (
        <VanMap positions={positions} />
      ) : (
        <div
          style={{
            position: 'absolute',
            left: 116,
            // Clears the top-right status/avatar/sign-out cluster, which floats
            // above this panel (rendered later in the DOM) rather than beside it.
            top: 84,
            right: 20,
            bottom: 20,
            background: 'var(--surface)',
            borderRadius: 'var(--r-card)',
            boxShadow: '0 16px 36px rgba(0,0,0,0.16)',
            overflow: 'hidden',
          }}
        >
          {section === 'children' ? <ChildrenRoster /> : <RoutesPanel />}
        </div>
      )}

      <nav
        style={{
          position: 'absolute',
          left: 20,
          top: 20,
          bottom: 20,
          width: 80,
          background: 'var(--ink)',
          borderRadius: 22,
          boxShadow: '0 12px 28px rgba(0,0,0,0.22)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '18px 0',
          gap: 8,
        }}
      >
        <span style={{ color: '#FFFFFF', marginBottom: 6 }}>
          <Icon name="logo" size={24} />
        </span>
        <RailButton active={section === 'live'} onClick={() => setSection('live')} label="Live map">
          <Icon name="van" size={20} />
        </RailButton>
        <RailButton active={section === 'children'} onClick={() => setSection('children')} label="Children">
          <PeopleIcon />
        </RailButton>
        <RailButton active={section === 'routes'} onClick={() => setSection('routes')} label="Routes & zones">
          <Icon name="pin" size={20} />
        </RailButton>
      </nav>

      <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <LivenessDot surface="dark" state={connected ? 'ok' : 'stale'} label={connected ? 'Tracker online' : 'Reconnecting…'} />
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: '999px',
            background: 'var(--blue)',
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
            flexShrink: 0,
          }}
        >
          {operatorInitials}
        </span>
        <Button variant="secondary" onClick={onSignOut}>
          Sign out
        </Button>
      </div>
    </div>
  );
}

function RailButton({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 44,
        borderRadius: 14,
        border: 'none',
        cursor: 'pointer',
        background: active ? 'var(--blue)' : 'transparent',
        color: active ? '#FFFFFF' : '#77777D',
      }}
    >
      {children}
    </button>
  );
}

/** The DS icon set has no person glyph; copied from design/Console.dc.html's own inline SVG. */
function PeopleIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 20c0-4 3-6.5 7-6.5s7 2.5 7 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

import { useEffect, useState, type ReactNode } from 'react';
import { Icon } from 'gina-ride-tracker-ds';
import { getChildren } from '../api/client';
import type { ChildDTO } from '../api/types';
import { useVanSocket } from '../ws/useVanSocket';
import { ChildSwitcher } from './ChildSwitcher';
import ParentAccount from './ParentAccount';
import ParentIdle from './ParentIdle';
import ParentRide from './ParentRide';
import Schedule from './Schedule';
import { useNextRide } from './useNextRide';

type Tab = 'ride' | 'schedule' | 'account';

/**
 * Shell around the parent-facing screens: floating logo + child switcher up top,
 * floating Ride/Schedule nav at the bottom, matching design/ParentLive.dc.html
 * and siblings.
 */
export default function ParentApp({ onSignOut }: { onSignOut: () => void }) {
  const [tab, setTab] = useState<Tab>('ride');
  const [children, setChildren] = useState<ChildDTO[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    getChildren().then((result) => {
      setChildren(result);
      setSelectedId((prev) => prev ?? result[0]?.id ?? null);
    });
  }, []);

  const selected = children.find((c) => c.id === selectedId);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {selected ? <ChildSwitcher kids={children} selectedId={selected.id} onSelect={setSelectedId} /> : null}
          {/* Always rendered, regardless of tab or whether a child is loaded
              yet - the one other place this used to live (Schedule.tsx) was
              only reachable after switching off the default Ride tab. */}
          <button
            type="button"
            onClick={onSignOut}
            style={{
              height: 40,
              padding: '0 14px',
              borderRadius: '999px',
              background: 'var(--surface)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.14)',
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--ink)',
              flexShrink: 0,
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {tab === 'account' ? (
          // Doesn't depend on a selected child, unlike the other two tabs.
          <ParentAccount />
        ) : selected ? (
          tab === 'ride' ? (
            <RideTab child={selected} />
          ) : (
            <ScheduleTab child={selected} />
          )
        ) : null}
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
        <NavTab icon={<Icon name="van" size={20} />} label="Ride" active={tab === 'ride'} onClick={() => setTab('ride')} />
        <NavTab icon={<Icon name="clock" size={20} />} label="Schedule" active={tab === 'schedule'} onClick={() => setTab('schedule')} />
        <NavTab icon={<PersonIcon />} label="Account" active={tab === 'account'} onClick={() => setTab('account')} />
      </div>
    </div>
  );
}

/** Idle vs. live/stale, driven by the real WebSocket - see src/ws/useVanSocket.ts. */
function RideTab({ child }: { child: ChildDTO }) {
  const { status, position } = useVanSocket(child.id);
  const { nextRide, origin, destination, originFence, destinationFence, loading } = useNextRide(child);

  if (status === 'live' || status === 'stale') {
    return (
      <ParentRide
        status={status}
        position={position}
        childName={child.name}
        childId={child.id}
        originFence={originFence ?? undefined}
        destinationFence={destinationFence ?? undefined}
      />
    );
  }
  return (
    <ParentIdle
      childName={child.name}
      nextRide={nextRide}
      origin={origin}
      destination={destination}
      originFence={originFence}
      destinationFence={destinationFence}
      loading={loading}
    />
  );
}

function ScheduleTab({ child }: { child: ChildDTO }) {
  const { origin, destination } = useNextRide(child);
  return <Schedule child={child} origin={origin} destination={destination} />;
}

function NavTab({ icon, label, active, onClick }: { icon: ReactNode; label: string; active: boolean; onClick: () => void }) {
  const color = active ? '#FFFFFF' : '#77777D';
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', padding: 0, cursor: 'pointer', color }}
    >
      {icon}
      <span style={{ fontSize: 10, fontWeight: active ? 700 : 600 }}>{label}</span>
    </button>
  );
}

/** Same "no fitting DS glyph" situation as OperatorConsole's PeopleIcon -
 * a single person outline reads as "your account" the way the DS's fixed
 * 16-icon set has no glyph for. */
function PersonIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 20c0-4 3-6.5 7-6.5s7 2.5 7 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

import { useState, type ReactNode } from 'react';
import { Button, Icon, LivenessDot } from 'gina-ride-tracker-ds';
import { getAccess } from '../../auth/tokens';
import { decodeAccessToken } from '../../auth/jwt';
import { useIsDesktopViewport } from '../../layout/useIsDesktopViewport';
import { useOperatorVanSocket } from '../../ws/useOperatorVanSocket';
import type { VanPosition } from '../../ws/vanSocket';
import { ChildrenRoster } from './ChildrenRoster';
import { OperatorsPanel } from './OperatorsPanel';
import { RoutesPanel } from './RoutesPanel';
import { VanMap } from './VanMap';

/** Height of the mobile bottom tab bar, incl. its own vertical padding but not
 * the safe-area inset below it - VanMap and the section panels both need this
 * number to know how much of the viewport's bottom edge they must clear. */
export const MOBILE_TAB_BAR_PX = 64;

type Section = 'live' | 'children' | 'routes' | 'operators';

const SECTION_KEY = 'grt.operator-console.section';
const SECTIONS: Section[] = ['live', 'children', 'routes', 'operators'];

/** Reload otherwise always lands back on 'live' (useState's initial value) -
 * this is the one bit of navigation state worth surviving a refresh, so
 * operators mid-task on Routes/Operators don't get bounced back to the map.
 * localStorage, not the URL: this app has no router at all (see App.tsx). */
function readStoredSection(): Section {
  const stored = localStorage.getItem(SECTION_KEY);
  return (SECTIONS as string[]).includes(stored ?? '') ? (stored as Section) : 'live';
}

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
  const [section, setSectionState] = useState<Section>(readStoredSection);
  function setSection(next: Section) {
    setSectionState(next);
    localStorage.setItem(SECTION_KEY, next);
  }
  const { positions, connected } = useOperatorVanSocket();
  const decoded = decodeAccessToken(getAccess() ?? '');
  // `??` alone doesn't catch an empty string (a real case: an operator
  // account with no first_name set) - only null/undefined - which left this
  // badge rendering blank instead of falling back to "OP".
  const operatorInitials = (decoded?.first_name || 'OP').slice(0, 2).toUpperCase();
  const isDesktop = useIsDesktopViewport();

  if (!isDesktop) {
    return (
      <MobileOperatorConsole
        section={section}
        setSection={setSection}
        positions={positions}
        connected={connected}
        operatorInitials={operatorInitials}
        onSignOut={onSignOut}
      />
    );
  }

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
          {section === 'children' ? <ChildrenRoster /> : section === 'routes' ? <RoutesPanel /> : <OperatorsPanel />}
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
        <button
          type="button"
          onClick={() => setSection('live')}
          aria-label="Home"
          style={{ border: 'none', background: 'transparent', color: '#FFFFFF', marginBottom: 6, cursor: 'pointer', padding: 4, display: 'flex' }}
        >
          <Icon name="logo" size={24} />
        </button>
        <RailButton active={section === 'live'} onClick={() => setSection('live')} label="Live map">
          <Icon name="van" size={20} />
        </RailButton>
        <RailButton active={section === 'children'} onClick={() => setSection('children')} label="Children">
          <PeopleIcon />
        </RailButton>
        <RailButton active={section === 'routes'} onClick={() => setSection('routes')} label="Routes & zones">
          <Icon name="pin" size={20} />
        </RailButton>
        <RailButton active={section === 'operators'} onClick={() => setSection('operators')} label="Operators">
          <OperatorsIcon />
        </RailButton>
      </nav>

      <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* This is the console's own socket to the backend, not any van's GPS
            signal - "Vans" below already reports each van's actual staleness,
            so this must never claim a tracker itself is online. */}
        <LivenessDot surface="dark" state={connected ? 'ok' : 'stale'} label={connected ? 'Live map connected' : 'Reconnecting…'} />
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

const SECTION_LABEL: Record<Section, string> = {
  live: 'Live map',
  children: 'Children',
  routes: 'Routes & zones',
  operators: 'Operators',
};

// The safe area a fixed bottom element must clear on a notched/home-indicator
// phone - falls back to 0 on a device that doesn't report one.
const SAFE_AREA_BOTTOM = 'env(safe-area-inset-bottom, 0px)';

type MobileConsoleProps = {
  section: Section;
  setSection: (next: Section) => void;
  positions: Record<number, VanPosition>;
  connected: boolean;
  operatorInitials: string;
  onSignOut: () => void;
};

/**
 * Phone-width shell for the same four sections the desktop rail exposes.
 * A left icon rail plus a floating panel (the desktop shape above) doesn't
 * fit a 375-430px screen - there is no room beside a rail for anything else,
 * and the panel's own 116px left offset was sized to clear that rail. This
 * swaps the rail for a thumb-reachable bottom tab bar (one tap to switch
 * sections, same as the rail) and lets each section's panel go edge-to-edge
 * instead of floating, since a phone screen has no spare margin to float in.
 */
function MobileOperatorConsole({ section, setSection, positions, connected, operatorInitials, onSignOut }: MobileConsoleProps) {
  const TOP_BAR_PX = 56;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      <header
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: TOP_BAR_PX,
          background: 'var(--ink)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 16px',
          boxSizing: 'border-box',
        }}
      >
        <Icon name="logo" size={20} />
        <span
          style={{
            fontFamily: 'var(--display)',
            fontSize: 14,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            color: '#FFFFFF',
            flexGrow: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {SECTION_LABEL[section]}
        </span>
        {/* Same "this console's own socket, not a van's GPS" caveat as the
            desktop cluster - see its comment above. */}
        <LivenessDot surface="dark" state={connected ? 'ok' : 'stale'} label={undefined} />
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: '999px',
            background: 'var(--blue)',
            color: '#FFFFFF',
            fontSize: 11,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {operatorInitials}
        </span>
        <Button variant="text" onClick={onSignOut} aria-label="Sign out">
          Sign out
        </Button>
      </header>

      <div
        style={{
          position: 'absolute',
          top: TOP_BAR_PX,
          left: 0,
          right: 0,
          bottom: `calc(${MOBILE_TAB_BAR_PX}px + ${SAFE_AREA_BOTTOM})`,
          overflow: 'hidden',
          background: 'var(--surface)',
        }}
      >
        {section === 'live' ? (
          <VanMap positions={positions} isDesktop={false} />
        ) : section === 'children' ? (
          <ChildrenRoster />
        ) : section === 'routes' ? (
          <RoutesPanel />
        ) : (
          <OperatorsPanel />
        )}
      </div>

      <nav
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: MOBILE_TAB_BAR_PX,
          paddingBottom: SAFE_AREA_BOTTOM,
          boxSizing: 'content-box',
          background: 'var(--ink)',
          boxShadow: '0 -8px 20px rgba(0,0,0,0.18)',
          display: 'flex',
        }}
      >
        <TabBarButton active={section === 'live'} onClick={() => setSection('live')} label="Live" ariaLabel="Live map">
          <Icon name="van" size={20} />
        </TabBarButton>
        <TabBarButton active={section === 'children'} onClick={() => setSection('children')} label="Children">
          <PeopleIcon />
        </TabBarButton>
        <TabBarButton active={section === 'routes'} onClick={() => setSection('routes')} label="Routes" ariaLabel="Routes & zones">
          <Icon name="pin" size={20} />
        </TabBarButton>
        <TabBarButton active={section === 'operators'} onClick={() => setSection('operators')} label="Operators">
          <OperatorsIcon />
        </TabBarButton>
      </nav>
    </div>
  );
}

/** One bottom-tab-bar entry: full tab height is the tap target (well over the
 * 44px minimum), not just the icon, so a thumb doesn't have to be precise. */
function TabBarButton({
  active,
  onClick,
  label,
  ariaLabel,
  children,
}: {
  active: boolean;
  onClick: () => void;
  /** Short caption under the icon - there's no room for "Routes & zones" at 1/4 tab width. */
  label: string;
  /** Full name for assistive tech, matching the desktop rail's own aria-label for the same section. @default label */
  ariaLabel?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel ?? label}
      aria-pressed={active}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        color: active ? 'var(--blue)' : '#9797A0',
      }}
    >
      {children}
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.02em' }}>{label}</span>
    </button>
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

/** Same "no fitting DS glyph" situation as PeopleIcon above - an id-badge
 * shape distinguishes this from the plain person glyph used for Children. */
function OperatorsIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="11" r="2.3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7.5 17c0.8-2 2.4-3 4.5-3s3.7 1 4.5 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

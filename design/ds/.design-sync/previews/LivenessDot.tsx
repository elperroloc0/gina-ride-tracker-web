import { LivenessDot } from 'gina-ride-tracker-ds';

export const OnLight = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <LivenessDot state="ok" label="Tracker online" />
    <LivenessDot state="stale" label="Last fix 6 minutes ago" />
  </div>
);

export const OnDark = () => (
  <div style={{ background: 'var(--ink)', padding: '14px 16px', borderRadius: 12, display: 'flex', gap: 12 }}>
    <LivenessDot state="ok" surface="dark" label="Traccar" />
    <LivenessDot state="stale" surface="dark" label="SMS queue" />
  </div>
);

export const BareDots = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
    <LivenessDot state="ok" />
    <LivenessDot state="stale" />
  </div>
);

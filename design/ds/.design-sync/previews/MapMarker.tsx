import type { ReactNode } from 'react';
import { MapMarker } from 'gina-ride-tracker-ds';

const Cell = ({ label, children }: { label: string; children: ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
    <div style={{ background: '#E9E9E4', borderRadius: 10 }}>{children}</div>
    <span style={{ fontSize: 11, color: 'var(--muted)' }}>{label}</span>
  </div>
);

export const AllMarkers = () => (
  <div style={{ display: 'flex', gap: 16 }}>
    <Cell label="school — pickup"><MapMarker kind="school" /></Cell>
    <Cell label="gym — drop-off"><MapMarker kind="gym" /></Cell>
    <Cell label="van — live"><MapMarker kind="van" /></Cell>
    <Cell label="van — last known"><MapMarker kind="vanStale" /></Cell>
  </div>
);

export const LiveVersusStale = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 20, background: '#E9E9E4', padding: 16, borderRadius: 14 }}>
    <MapMarker kind="van" />
    <MapMarker kind="vanStale" />
  </div>
);

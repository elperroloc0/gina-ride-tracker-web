import { Badge, Card } from 'gina-ride-tracker-ds';

export const Tones = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
    <Badge tone="now">On ride</Badge>
    <Badge tone="scheduled">Scheduled</Badge>
    <Badge tone="info">2 parents notified</Badge>
    <Badge tone="alert">No phone</Badge>
  </div>
);

export const InsideARow = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--ink-2)' }}>
    <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Ana López</span>
    <Badge tone="alert" size="sm">No phone</Badge>
    <Badge tone="scheduled" size="sm">Tue</Badge>
  </div>
);

export const OnColorSurface = () => (
  <div style={{ width: 320 }}>
    <Card variant="color" eyebrow="On ride" title="Maya is on the way">
      <div style={{ display: 'flex', gap: 8 }}>
        <Badge tone="onColor">VAN-1</Badge>
        <Badge tone="onColor">3:14 PM</Badge>
      </div>
    </Card>
  </div>
);

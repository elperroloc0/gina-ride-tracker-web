import { Card, Badge, Button } from 'gina-ride-tracker-ds';

export const ColorCard = () => (
  <div style={{ width: 340 }}>
    <Card variant="color" eyebrow="On ride" title="Maya is on the way">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontSize: 13, opacity: 0.85 }}>Picked up 3:14 PM at Coral Way K-8</span>
        <Badge tone="onColor">VAN-1</Badge>
      </div>
    </Card>
  </div>
);

export const ConsolePanel = () => (
  <div style={{ width: 380 }}>
    <Card variant="console" eyebrow="Route" title="Afternoon — West">
      <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
        Four children, two schools. Runs Monday through Friday, 3:00 – 4:10 PM.
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="secondary">Edit</Button>
        <Button variant="primary">Open route</Button>
      </div>
    </Card>
  </div>
);

export const MobileCard = () => (
  <div style={{ width: 320 }}>
    <Card variant="mobile" eyebrow="Next ride" title="Tomorrow, 3:15 PM">
      <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>
        You'll get a text the moment she's picked up.
      </div>
    </Card>
  </div>
);

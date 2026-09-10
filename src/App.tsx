import {
  Badge,
  Button,
  Card,
  LivenessDot,
  Timeline,
  WeekdayChips,
} from 'gina-ride-tracker-ds';

/**
 * Step 1 smoke screen: proves the design system renders inside the real app -
 * tokens, Archivo, and components straight from the package. No data yet.
 */
export default function App() {
  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card variant="color" eyebrow="On ride" title="Maya is on the way">
        <Timeline
          orientation="horizontal"
          onColor
          steps={[
            { label: 'Picked up', time: '3:14 PM', state: 'done' },
            { label: 'En route', state: 'current' },
            { label: 'Arrives', state: 'future' },
          ]}
        />
      </Card>

      <Card variant="mobile" eyebrow="Next ride" title="Tomorrow, 3:15 PM">
        <WeekdayChips size="card" active={[true, true, false, true, false]} time="3:15 PM" />
      </Card>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <LivenessDot state="ok" label="Tracker online" />
        <Badge tone="now">On ride</Badge>
      </div>

      <Button variant="primary" size="mobile" icon="bell">
        Text me on pickup
      </Button>
    </div>
  );
}

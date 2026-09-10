import { Timeline, Card } from 'gina-ride-tracker-ds';

export const ActiveRide = () => (
  <div style={{ width: 330 }}>
    <Timeline steps={[
      { label: 'Picked up at Coral Way K-8', time: '3:14 PM', state: 'done' },
      { label: 'On the way to the gym', time: 'Now', state: 'current' },
      { label: 'Arrives at the gym', time: '3:40 PM', state: 'future' },
    ]} />
  </div>
);

export const FeedWentQuiet = () => (
  <div style={{ width: 330 }}>
    <Timeline stale steps={[
      { label: 'Picked up at Coral Way K-8', time: '3:14 PM', state: 'done' },
      { label: 'Last fix 6 minutes ago', time: '3:22 PM', state: 'current' },
      { label: 'Arrives at the gym', state: 'future' },
    ]} />
  </div>
);

export const OnColorCard = () => (
  <div style={{ width: 380 }}>
    <Card variant="color" eyebrow="On ride" title="Maya is on the way">
      <Timeline orientation="horizontal" onColor steps={[
        { label: 'Picked up', time: '3:14 PM', state: 'done' },
        { label: 'En route', state: 'current' },
        { label: 'Arrived', state: 'future' },
      ]} />
    </Card>
  </div>
);

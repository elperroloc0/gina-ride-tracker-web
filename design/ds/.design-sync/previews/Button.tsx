import { Button } from 'gina-ride-tracker-ds';

export const ConsoleActions = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
    <Button variant="primary" icon="plus">Add child</Button>
    <Button variant="primary">Save changes</Button>
    <Button variant="secondary">Remove</Button>
    <Button variant="ink" icon="clock">Replay today</Button>
  </div>
);

export const MobileActions = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 320 }}>
    <Button variant="primary" size="mobile" icon="bell">Text me on pickup</Button>
    <Button variant="dark" size="mobile">Not now</Button>
  </div>
);

export const TextActions = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
    <Button variant="text">Edit schedule</Button>
    <Button variant="text">Add a geofence</Button>
  </div>
);

import { Input } from 'gina-ride-tracker-ds';

export const ConsoleField = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 280 }}>
    <Input variant="console" defaultValue="Maya Ruiz" />
    <Input variant="console" placeholder="Parent phone number" />
  </div>
);

export const SearchField = () => (
  <div style={{ width: 260 }}>
    <Input variant="search" icon="search" placeholder="Search children" />
  </div>
);

export const MobileField = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 320 }}>
    <Input variant="mobile" placeholder="Phone number" />
    <Input variant="mobile" icon="mail" defaultValue="elena@example.com" />
  </div>
);

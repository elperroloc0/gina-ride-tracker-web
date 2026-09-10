import { Toggle } from 'gina-ride-tracker-ds';

export const InAList = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
    <Toggle checked size="list" />
    <Toggle checked={false} size="list" />
  </div>
);

export const InAForm = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
    <Toggle checked size="form" />
    <Toggle checked={false} size="form" />
  </div>
);

export const WithConsequence = () => (
  <div style={{ width: 400, display: 'flex', flexDirection: 'column', gap: 10 }}>
    <Toggle
      checked
      label="Text me on pickup"
      consequence="Off means no text when she is picked up."
    />
    <Toggle
      checked={false}
      label="Text me on arrival"
      consequence="Off means no text when she reaches the gym."
    />
  </div>
);

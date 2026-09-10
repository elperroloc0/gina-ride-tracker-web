import { WeekdayChips } from 'gina-ride-tracker-ds';

export const TableSize = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <WeekdayChips active={[true, true, false, true, false]} time="3:15 PM" />
    <WeekdayChips active={[true, false, true, false, true]} time="3:30 PM" />
  </div>
);

export const CardSize = () => (
  <WeekdayChips size="card" active={[true, true, true, true, false]} time="3:15 PM" />
);

export const EveryDay = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <WeekdayChips size="card" active={[true, true, true, true, true]} />
    <WeekdayChips size="card" active={[false, false, false, false, false]} />
  </div>
);

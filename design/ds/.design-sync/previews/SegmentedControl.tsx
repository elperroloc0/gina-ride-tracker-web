import { SegmentedControl } from 'gina-ride-tracker-ds';

export const TwoOptions = () => (
  <SegmentedControl
    value="today"
    options={[{ value: 'today', label: 'Today' }, { value: 'week', label: 'This week' }]}
  />
);

export const ThreeOptions = () => (
  <SegmentedControl
    value="active"
    options={[
      { value: 'active', label: 'Active' },
      { value: 'scheduled', label: 'Scheduled' },
      { value: 'all', label: 'All' },
    ]}
  />
);

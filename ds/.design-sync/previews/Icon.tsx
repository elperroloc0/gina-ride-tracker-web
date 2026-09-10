import { Icon } from 'gina-ride-tracker-ds';

const NAMES = ['van', 'pin', 'school', 'phone', 'mail', 'bell', 'clock', 'alert',
  'search', 'pencil', 'chevron', 'arrow', 'eye', 'plus', 'check', 'logo'] as const;

export const FullSet = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 64px)', gap: 12 }}>
    {NAMES.map((n) => (
      <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'var(--ink)' }}>
        <Icon name={n} size={24} />
        <span style={{ fontSize: 10, color: 'var(--muted)' }}>{n}</span>
      </div>
    ))}
  </div>
);

export const Sizes = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 18, color: 'var(--ink)' }}>
    <Icon name="van" size={16} />
    <Icon name="van" size={20} />
    <Icon name="van" size={24} />
  </div>
);

export const InheritsColor = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
    <span style={{ color: 'var(--blue)' }}><Icon name="pin" size={24} /></span>
    <span style={{ color: 'var(--muted)' }}><Icon name="pin" size={24} /></span>
    <span style={{ color: 'var(--alert)' }}><Icon name="alert" size={24} /></span>
  </div>
);

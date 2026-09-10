import { WaveDivider } from 'gina-ride-tracker-ds';

export const ParentHeader = () => (
  <div style={{ width: 390 }}>
    <div style={{ position: 'relative', background: 'var(--blue)', borderRadius: '12px 12px 0 0', padding: '20px 20px 34px' }}>
      <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: '#FFF', opacity: 0.75 }}>
        On ride
      </div>
      <div style={{ fontFamily: 'var(--display)', fontSize: 30, lineHeight: 1.02, letterSpacing: '-0.025em', textTransform: 'uppercase', color: '#FFF', marginTop: 8 }}>
        Maya is on the way
      </div>
      <WaveDivider fill="var(--bg)" />
    </div>
    <div style={{ background: 'var(--bg)', height: 60, borderRadius: '0 0 12px 12px' }} />
  </div>
);

export const OnInk = () => (
  <div style={{ width: 390 }}>
    <div style={{ position: 'relative', background: 'var(--ink)', borderRadius: '12px 12px 0 0', height: 80 }}>
      <WaveDivider fill="var(--surface)" height={30} />
    </div>
    <div style={{ background: 'var(--surface)', height: 50, borderRadius: '0 0 12px 12px' }} />
  </div>
);

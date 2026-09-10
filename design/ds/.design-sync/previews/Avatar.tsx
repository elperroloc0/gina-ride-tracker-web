import { Avatar, Card } from 'gina-ride-tracker-ds';

export const Sizes = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
    <Avatar initials="MR" size={46} state="selected" />
    <Avatar initials="DC" size={32} />
    <Avatar initials="AL" size={30} state="selected" />
    <Avatar initials="JS" size={24} />
  </div>
);

export const States = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
    <Avatar initials="MR" size={32} state="selected" />
    <Avatar initials="DC" size={32} state="default" />
    <Avatar initials="AL" size={32} state="alert" />
  </div>
);

export const InAPanelHeader = () => (
  <div style={{ width: 320 }}>
    <Card variant="console">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar initials="MR" size={46} state="selected" />
        <div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 19, letterSpacing: '-0.015em' }}>Maya Ruiz</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Coral Way K-8 · 3:15 PM</div>
        </div>
      </div>
    </Card>
  </div>
);

import { Button } from 'gina-ride-tracker-ds';

type Props = {
  onSignOut: () => void;
};

/** Placeholder - replaced with the real map/roster/routes console. */
export default function OperatorConsole({ onSignOut }: Props) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: 'var(--bg)' }}>
      <span style={{ fontFamily: 'var(--display)', fontSize: 24, textTransform: 'uppercase' }}>Console not built yet</span>
      <Button variant="secondary" onClick={onSignOut}>Sign out</Button>
    </div>
  );
}

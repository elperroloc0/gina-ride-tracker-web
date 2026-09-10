import { Table, TableRow, TableCell, Avatar, Badge } from 'gina-ride-tracker-ds';

export const RowStates = () => (
  <div style={{ width: '100%', maxWidth: 860 }}>
    <Table>
      <TableRow selected>
        <TableCell grow={1.4} basis={200}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <Avatar initials="MR" size={32} state="selected" />
            <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Maya Ruiz</span>
          </div>
        </TableCell>
        <TableCell basis={190}>Selected — --blue-row, 3px left edge</TableCell>
        <TableCell variant="day">Mon</TableCell>
      </TableRow>
      <TableRow>
        <TableCell grow={1.4} basis={200}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <Avatar initials="DC" size={32} />
            <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Diego Castro</span>
          </div>
        </TableCell>
        <TableCell basis={190}>Normal</TableCell>
        <TableCell variant="day">Wed</TableCell>
      </TableRow>
      <TableRow>
        <TableCell grow={1.4} basis={200}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <Avatar initials="AL" size={32} state="alert" />
            <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Ana López</span>
          </div>
        </TableCell>
        <TableCell basis={190}><Badge tone="alert" size="sm">No phone</Badge></TableCell>
        <TableCell variant="day">Tue</TableCell>
      </TableRow>
    </Table>
  </div>
);

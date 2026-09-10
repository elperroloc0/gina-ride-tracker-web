import { Table, TableHeader, TableRow, TableCell, Avatar, WeekdayChips, Badge } from 'gina-ride-tracker-ds';

export const ChildrenTable = () => (
  <div style={{ width: '100%', maxWidth: 900 }}>
    <Table>
      <TableHeader>
        <TableCell grow={1.4} basis={200}>Child</TableCell>
        <TableCell basis={190}>Parent</TableCell>
        <TableCell variant="schedule">Schedule</TableCell>
        <TableCell variant="day">Next</TableCell>
      </TableHeader>
      <TableRow selected>
        <TableCell grow={1.4} basis={200}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <Avatar initials="MR" size={32} state="selected" />
            <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Maya Ruiz</span>
          </div>
        </TableCell>
        <TableCell basis={190}>Elena Ruiz</TableCell>
        <TableCell variant="schedule">
          <WeekdayChips active={[true, true, false, true, false]} time="3:15 PM" />
        </TableCell>
        <TableCell variant="day">Mon</TableCell>
      </TableRow>
      <TableRow>
        <TableCell grow={1.4} basis={200}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <Avatar initials="DC" size={32} />
            <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Diego Castro</span>
          </div>
        </TableCell>
        <TableCell basis={190}>Marta Castro</TableCell>
        <TableCell variant="schedule">
          <WeekdayChips active={[true, false, true, false, true]} time="3:30 PM" />
        </TableCell>
        <TableCell variant="day">Wed</TableCell>
      </TableRow>
      <TableRow>
        <TableCell grow={1.4} basis={200}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <Avatar initials="AL" size={32} state="alert" />
            <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Ana López</span>
          </div>
        </TableCell>
        <TableCell basis={190}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Badge tone="alert" size="sm">No phone</Badge>
          </div>
        </TableCell>
        <TableCell variant="schedule">
          <WeekdayChips active={[false, true, true, true, false]} time="3:15 PM" />
        </TableCell>
        <TableCell variant="day">Tue</TableCell>
      </TableRow>
    </Table>
  </div>
);

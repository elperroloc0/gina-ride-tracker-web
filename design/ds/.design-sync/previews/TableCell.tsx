import { Table, TableHeader, TableRow, TableCell, WeekdayChips } from 'gina-ride-tracker-ds';

export const ColumnKinds = () => (
  <div style={{ width: '100%', maxWidth: 860 }}>
    <Table>
      <TableHeader>
        <TableCell grow={1.4} basis={200}>text — grow 1.4</TableCell>
        <TableCell basis={190}>text — grow 1</TableCell>
        <TableCell variant="schedule">schedule — 190px</TableCell>
        <TableCell variant="day">day — 110px</TableCell>
      </TableHeader>
      <TableRow>
        <TableCell grow={1.4} basis={200}>Maya Ruiz</TableCell>
        <TableCell basis={190}>Elena Ruiz</TableCell>
        <TableCell variant="schedule">
          <WeekdayChips active={[true, true, false, true, false]} time="3:15 PM" />
        </TableCell>
        <TableCell variant="day">Mon</TableCell>
      </TableRow>
    </Table>
  </div>
);

export const Truncation = () => (
  <div style={{ width: '100%', maxWidth: 420 }}>
    <Table>
      <TableRow>
        <TableCell grow={1} basis={160}>
          A name long enough to need the ellipsis rather than widening the column
        </TableCell>
        <TableCell variant="day">Mon</TableCell>
      </TableRow>
    </Table>
  </div>
);

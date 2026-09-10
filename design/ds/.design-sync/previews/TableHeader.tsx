import { Table, TableHeader, TableRow, TableCell } from 'gina-ride-tracker-ds';

export const HeaderInContext = () => (
  <div style={{ width: '100%', maxWidth: 860 }}>
    <Table>
      <TableHeader>
        <TableCell grow={1.4} basis={200}>Child</TableCell>
        <TableCell basis={190}>Parent</TableCell>
        <TableCell variant="schedule">Schedule</TableCell>
        <TableCell variant="day">Next</TableCell>
      </TableHeader>
      <TableRow>
        <TableCell grow={1.4} basis={200}>Maya Ruiz</TableCell>
        <TableCell basis={190}>Elena Ruiz</TableCell>
        <TableCell variant="schedule">Mon, Tue, Thu</TableCell>
        <TableCell variant="day">Mon</TableCell>
      </TableRow>
    </Table>
  </div>
);

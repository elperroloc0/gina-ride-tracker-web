---
category: Console
---

# Table

The console table shell: an r14 surface with a clipped border, so the header and
first row sit flush inside the corner radius. Compose it from `TableHeader`,
`TableRow` and `TableCell`.

```jsx
<Table>
  <TableHeader>
    <TableCell grow={1.4} basis={200}>Child</TableCell>
    <TableCell variant="schedule">Schedule</TableCell>
    <TableCell variant="day">Next</TableCell>
  </TableHeader>
  <TableRow selected>
    <TableCell grow={1.4} basis={200}>Maya Ruiz</TableCell>
    <TableCell variant="schedule"><WeekdayChips active={[1,1,0,1,0]} time="3:15 PM" /></TableCell>
    <TableCell variant="day">Mon</TableCell>
  </TableRow>
</Table>
```

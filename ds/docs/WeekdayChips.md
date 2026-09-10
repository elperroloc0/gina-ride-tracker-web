---
category: Scheduling
---

# WeekdayChips

The visual form of a `ChildSchedule`: five weekday squares, M-F in order.
Active days are filled `--blue` with a white letter.

`size="table"` is the 22px chip for a console row; `size="card"` is the 30px
chip for the mobile card.

```jsx
<WeekdayChips active={[true, true, false, true, false]} time="3:15 PM" />
```

Inactive chips sit on `--fill`, not `--line-2` — on `--line-2` the same letter
drops to 4.35:1. The pickup `time` renders in tabular figures so the column
does not shiver between rows.

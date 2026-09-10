---
category: Console
---

# TableCell

One column of a console table.

| variant | width |
| --- | --- |
| `text` | flexible: `flex: {grow} 1 {basis}px`, truncates with an ellipsis |
| `schedule` | fixed 190px |
| `day` | fixed 110px, right aligned, tabular figures |

**Never give a text column a fixed width.** That is the invariant this component
exists to hold: only `schedule` and `day` are fixed, because five 22px chips
plus gaps plus a time cannot compress. The fixed columns together must still fit
at 1280px — the reception laptop — not just at 1440.

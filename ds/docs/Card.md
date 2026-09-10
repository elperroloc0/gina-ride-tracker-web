---
category: Surfaces
---

# Card

| variant | shape |
| --- | --- |
| `console` | r14, 20px padding — operator panels |
| `mobile` | r16, 18px padding — the parent app |
| `color` | filled `--blue`, owns the theme of the screen |

`title` is set in Archivo Black — 27px uppercase on `color`, 19px sentence case
elsewhere. `eyebrow` is the 11/700 caps label above it.

```jsx
<Card variant="color" eyebrow="On ride" title="Maya is on the way">
  <p>You'll get a text the moment she's there.</p>
</Card>
```

One coloured card per screen, and a coloured card never nests inside another.
If a line inside the card repeats what the title already says in a larger size,
delete the line, not the title.

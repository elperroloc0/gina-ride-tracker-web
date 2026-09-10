---
category: Controls
---

# Toggle

34x20 inside a list row (`size="list"`), 40x23 inside a form (`size="form"`).
On is `--blue`, off is `--fill-off`.

With `label` and `consequence` it renders the full bordered settings row:

```jsx
<Toggle
  checked={notify}
  onChange={setNotify}
  label="Text me on pickup"
  consequence="Off means no text when she is picked up."
/>
```

A toggle that switches off notifications always spells out the consequence.
Never leave a parent to infer what turning it off costs them.

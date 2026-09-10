---
category: Foundations
---

# WaveDivider

The brand wave that closes a coloured header. The single decorative element in
the system.

`fill` is always the colour of the section *below* it — the wave is the top edge
of the next section, drawn over this one.

```jsx
<div style={{ position: 'relative', background: 'var(--blue)', padding: 20 }}>
  <h1>Maya is on the way</h1>
  <WaveDivider fill="var(--bg)" />
</div>
```

The parent must be `position: relative`. Used on parent-facing screens only — in
the operator console it fights the dense grid.

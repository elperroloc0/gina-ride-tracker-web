---
category: Console
---

# Avatar

Round initials chip identifying a child.

Sizes: 46 (record panel header), 32 (table row), 30 (topbar), 24 (inside a pill).

States: `selected` (filled `--blue`), `default` (`--line-2` / `--muted`),
`alert` (`--alert-tint`, this row needs action), `onColor` (translucent white on
a `--blue` surface).

```jsx
<Avatar initials="MR" size={32} state="selected" />
```

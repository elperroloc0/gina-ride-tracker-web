---
category: Controls
---

# Input

| variant | size |
| --- | --- |
| `console` | 40-42px, r10, 13px |
| `search` | pill, r999 |
| `mobile` | 52px, r12, 15px — sized for the 44px tap target |

Focus is a 1.5px `--blue` border over `--blue-surface`, the same treatment a
selected card gets, so "this is what you are working on" reads the same
everywhere. Placeholders are `--muted`.

```jsx
<Input variant="search" icon="search" placeholder="Search children" />
```

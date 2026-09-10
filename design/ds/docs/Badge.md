---
category: Status
---

# Badge

Status pill: 11/700 uppercase, 0.05em tracking.

| tone | meaning |
| --- | --- |
| `now` | filled `--blue` — happening right now (On ride, Running) |
| `scheduled` | `--fill` — planned |
| `info` | `--blue-tint` — a neutral fact |
| `alert` | `--alert-tint` — needs someone to act |
| `onColor` | translucent white, on a `--blue` surface; not uppercased |

`size="sm"` (10px) is for inside a dense table row; `md` (11px) stands alone.

```jsx
<Badge tone="now">On ride</Badge>
<Badge tone="alert" size="sm">No phone</Badge>
```

These are small text, so the tones are pre-checked contrast pairs — `alert` is
4.75:1 on its tint. Do not recolour them by hand. `alert` means action is
required; it is never a decorative red.

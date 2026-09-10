---
category: Ride state
---

# Timeline

Ride progress. `orientation="vertical"` is the mobile rail (20px column);
`horizontal` sits across a coloured card — pass `onColor` there so the markers
invert to white.

Step states: `done` (filled, with a check), `current` (a ring), `future` (a
hollow `--fill-off` outline).

```jsx
<Timeline steps={[
  { label: 'Picked up at Coral Way K-8', time: '3:14 PM', state: 'done' },
  { label: 'On the way to the gym', state: 'current' },
  { label: 'Arrives at the gym', state: 'future' },
]} />
```

The current step is a **ring, never a filled white disc** — the ring is what
separates "happening now" from "already done" at a glance. Pass `stale` to turn
that ring `--alert` when the position feed has gone quiet.

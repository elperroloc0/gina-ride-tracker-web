---
category: Status
---

# LivenessDot

7px dot beside the name of whatever's state is being shown. `ok` (`--ok`) means
data is arriving; `stale` (`--alert`) means the stream went quiet.

```jsx
<LivenessDot state="ok" label="Tracker online" />
<LivenessDot state="stale" surface="dark" label="Last fix 6 minutes ago" />
```

Use it only where the state genuinely comes from the backend, and **always ship
both states**. A dot that is only ever green cannot tell a live feed from a
frozen one, which is the single thing it exists to do.

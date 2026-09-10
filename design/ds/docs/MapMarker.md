---
category: Map
---

# MapMarker

Branded map pins, drawn on a 60x60 grid.

| kind | meaning |
| --- | --- |
| `school` | the pickup point |
| `gym` | the drop-off point |
| `van` | the live position, with its accuracy halo |
| `vanStale` | the last known position: grey, dashed uncertainty ring |

```jsx
<MapMarker kind="van" />
```

These are the pins only — the basemap under them is Mapbox in the product.
Ship `van` and `vanStale` together or neither: one alone cannot show that the
feed died.

Marker positions animate on two independent springs (X and Y, damping 1.0,
response 0.4). A single spring on the 2D distance desynchronises when the axes
move at different speeds.

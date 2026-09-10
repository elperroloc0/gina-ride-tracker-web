---
category: Actions
---

# SegmentedControl

Two or three mutually exclusive filters, as pills. The selected pill is
`--blue-surface` inside a `--blue` outline.

```jsx
<SegmentedControl
  value={tab}
  onChange={setTab}
  options={[{ value: 'today', label: 'Today' }, { value: 'week', label: 'This week' }]}
/>
```

Do not use this to choose a child. That is always the dropdown in the header,
identical on every parent screen: segmented pills change the shape of the
control between screens and break past three children.

# Building with Gina's Ride Tracker

The visual language comes from ginasgymnastics.com: electric blue, near-black,
light warm grey, heavy uppercase display type, pill buttons, and one wave.

## Setup — there is no provider

Components need **no wrapper, no theme provider, and no context**. Every token is
a plain CSS custom property declared on `:root` in the stylesheet, so importing
the stylesheet is the entire setup. It also sets `body` to Archivo, `--ink` text
on a `--bg` page — so plain markup you write inherits the brand font instead of
falling back to a browser serif.

Import components directly:

```jsx
import { Button, Card, Badge } from 'gina-ride-tracker-ds';
```

## Style your own layout with the tokens — never hardcode hex

Use `var(--token)` for everything you build around the components. The complete
vocabulary:

| Group | Tokens |
| --- | --- |
| Accent | `--blue` `--blue-tint` `--blue-surface` `--blue-row` |
| Text | `--ink` `--ink-2` `--muted` `--muted-2` |
| Surface | `--bg` `--surface` `--surface-2` |
| Line | `--line` `--line-2` `--fill` `--fill-off` |
| State | `--alert` `--alert-tint` `--ok` |
| Type | `--display` (Archivo Black) `--body` (Archivo) |
| Radius | `--r-pill` `--r-card-mobile` `--r-card` `--r-field` `--r-row` `--r-chip` `--r-chip-table` |

Rules that are not negotiable, because each is a contrast or clarity decision
already made:

- **`--muted` is the only grey you may set text in.** `--muted-2` is for
  non-text only (a disabled arrow); it is 2.80:1 on white.
- **`--alert` means a human must act.** It is never a decorative red.
- **`--ok` and `--alert` always ship as a pair** wherever liveness is shown — one
  colour alone cannot distinguish a live feed from a frozen one.
- Headings use `var(--display)`; everything else `var(--body)`.
- Times, coordinates, IMEIs and IDs get `font-variant-numeric: tabular-nums`.
- Lay out with flex/grid and `gap`. No per-element margins for spacing siblings.
- Icons are `Icon`, never emoji.

## Where the truth is

- `_ds/<folder>/styles.css` — every token and component class, as shipped.
- `_ds/<folder>/guidelines/DESIGN-SYSTEM.md` — the full system: contrast pairs
  with their computed ratios, control sizes, motion springs, layout invariants,
  and the copy voice (short human sentences to parents, exact facts to operators).
- `components/<group>/<Name>/<Name>.prompt.md` — per-component usage and the
  rule each component exists to hold.

## An idiomatic screen

```jsx
<div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 20, background: 'var(--bg)' }}>
  <Card variant="color" eyebrow="On ride" title="Maya is on the way">
    <Timeline orientation="horizontal" onColor steps={[
      { label: 'Picked up', time: '3:14 PM', state: 'done' },
      { label: 'En route', state: 'current' },
      { label: 'Arrives', state: 'future' },
    ]} />
  </Card>
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <LivenessDot state="ok" label="Tracker online" />
    <Badge tone="now">On ride</Badge>
  </div>
  <Button variant="primary" size="mobile" icon="bell">Text me on pickup</Button>
</div>
```

One primary action per screen; secondary is always an outline, never a second fill.

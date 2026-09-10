# Gina's Ride Tracker — design-sync notes

## What this package is

`design/ds/` did not exist before the first sync. The repo had no JS at all: a
Django backend, 15 standalone HTML specimen sheets in `design/library/`, and the
`.dc.html` canvas artboards. The specimens are documentation, not components —
`buttons.html` is four `<div>`s with inline styles and captions, and every file
re-declares the token block.

This package is the React library built **from** those specimens plus
`design/DESIGN-SYSTEM.md`. Every value (padding, radius, size, colour, SVG path)
was transcribed from the specimen markup, not re-derived by eye. `design/library/`
remains the reference; if the two ever disagree, the specimen is the source of
truth for appearance and DESIGN-SYSTEM.md for the rules.

## Setup facts

- Node 26 / npm 11. `npm install` then `npm run build` (tsup → `dist/index.js`
  + `dist/index.d.ts`, then `build:css` concatenates tokens + component CSS).
- `dist/styles.css` is built by **concatenation**, not `@import`. An earlier
  version had `styles.css` `@import "./tokens.css"`, which failed validate with
  `[CSS_IMPORT_MISSING]` — the imported file does not land at the bundle root.
  Keep it self-contained.
- `cfg.tokensGlob` is a **no-op without `cfg.tokensPkg`** (`copyTokens` returns
  early). It was removed from the config. Tokens ship inside `_ds_bundle.css`
  and validate confirms all 25 referenced properties resolve, so `tokens/` in
  the bundle is legitimately empty for this DS.
- `guidelinesGlob` points at `../DESIGN-SYSTEM.md`. The default globs matched
  `docs/*.md` and copied all 17 per-component docs into `guidelines/`, which
  duplicates the `.prompt.md` files.
- Component grouping comes from `category:` frontmatter in `docs/<Name>.md` via
  `cfg.docsDir`. Without it every component lands in a single `general` group.

## Findings worth keeping

- **The stylesheet must own the page font.** Originally `font-family` was set
  only on an enumerated list of `.gds-*` classes, so any text outside a
  component — icon captions, the chip time, and anything a design agent writes
  itself — fell back to the browser serif. Fixed with a `body` rule plus a
  `[class^="gds-"]` attribute selector. This was invisible until the preview
  screenshots were read.
- Five components crop in the product's grid view and carry
  `overrides.<Name>.cardMode = "column"`: Icon, WaveDivider, Timeline, Card,
  Toggle — plus the four Table parts.
- `CardProps` must `Omit<..., 'title'>`: the HTML `title` attribute is
  `string | undefined` and collides with a `ReactNode` title prop.

## Known render warns

None outstanding. `[FONT_REMOTE]` for Archivo / Archivo Black is expected — both
load from Google Fonts via an `@import` in the token layer, exactly as the
specimens and the live site do. `[DTS_STYLE_SYSTEM]` filtering `@types/react`
CSS-shorthand props is informational and correct here.

## Re-sync risks

- **The API is a design decision, not a port.** No prior component API existed,
  so prop names (`variant`, `tone`, `state`, `kind`, `cardMode` groupings) were
  chosen during the first sync and approved by the user. If the real frontend is
  ever built and names things differently, this package — not the app — is what
  should change.
- Fonts are fetched from Google Fonts at render time. No woff2 ships in the
  bundle; an offline render falls back to Helvetica/Arial. PDF/PNG export of the
  artboards has the same caveat, already noted in DESIGN-SYSTEM.md.
- `design/` is its own git repo nested inside the `GinaGymnastics` repo. Commits
  for this package land in the inner repo.
- Sample data in previews (Maya Ruiz, Diego Castro, Ana López, Coral Way K-8,
  VAN-1) is placeholder per DESIGN-SYSTEM.md. The only two real facts in the
  system are the gym address and phone number; neither appears in a preview.
- The map ships markers only, by decision. There is no MapCanvas / GeoFence /
  RoutePath component — the basemap is Mapbox in the product.

---
category: Foundations
---

# Icon

The 16 stroke icons of the system, drawn on a 16/20/24 grid with 1.7-1.9 stroke.
Always `currentColor`, so the icon takes the colour of whatever contains it.

Emoji are never used in this interface: the brand does not use them and they
cannot be recoloured.

```jsx
<Icon name="van" size={20} />
```

Names: `van`, `pin`, `school`, `phone`, `mail`, `bell`, `clock`, `alert`,
`search`, `pencil`, `chevron`, `arrow`, `eye`, `plus`, `check`, `logo`.

An icon is placed only where it distinguishes a type inside a list — School vs
Gym in a zone list, arrival vs problem in a log. Next to a card with only one
possible subject, no glyph: "VAN-1" has already said it in words.

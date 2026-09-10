---
category: Actions
---

# Button

Pill button. Every radius in the system is 999px.

| variant | use |
| --- | --- |
| `primary` | the one filled blue action on the screen |
| `secondary` | outline `--line` — never a fill |
| `ink` | outline `--ink`, page-level action |
| `dark` | filled `--ink`, the mobile escape hatch |
| `text` | bare blue label, entering a secondary flow |

`size="console"` is 42-44px at 13px. `size="mobile"` is 52-54px at 14-15px, to
clear the 44px minimum tap target.

```jsx
<Button variant="primary" icon="plus">Add child</Button>
<Button variant="secondary">Remove</Button>
```

Exactly one primary action per screen. Secondary is always an outline, because
two fills make the operator hunt for which one is the real action.

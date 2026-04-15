# spec-format.md — cell spec schema

Each cell (component × mood × 12 variants) is specified by a single `source.md` file in the cell directory.

Workers consume this spec to generate the 12 variants mechanically.

## Required sections

### 1. Cell identifier
```
component: <op | section | character | transition | text | article | carousel | button | card | ui>
mood: <cool | cute | elegant | modern | retro | fantasy>
count: 12
```

### 2. Base motion primitive
Name the primitive from `/tenstock/_shared/motion-primitives.css`:
```
primitive: ts-<name>
keyframes: <list>
```

### 3. Allowed variant axes
Explicitly list which axes the 12 variants may vary. If an axis is not listed, agents must not vary it.
```
axes:
  - direction   (translate axis + sign)
  - size        (padding/font-size scalar)
  - timing      (duration scalar)
  - easing      (cubic-bezier or steps)
  - geometry    (scale origin / border-radius)
  - trigger     (hover / active / auto)
```

### 4. Mood palette binding
Reference which CSS custom properties from `mood.css` each variant pulls:
```
uses:
  --color-bg       (stage background)
  --color-accent   (fill color)
  --color-text     (button text)
  --ease-default
  --dur-default
```

### 5. Variant catalog (table of 12)
```
| # | class                | axis     | deviation                              |
|---|----------------------|----------|----------------------------------------|
| 01 | <component>-<mood>--01 | <axis> | <concrete change from base>            |
...
```

### 6. Deviation notes
Any non-obvious modification worth documenting. e.g., "variant 12 changes trigger from :hover to :active because pointer:coarse devices have no hover state".

### 7. Evaluation axes for user
What should the user look for when judging this cell?
```
- mood fit (does the color + timing read as <mood>?)
- variant distinguishability (are 12 clearly different at a glance?)
- mobile survival (does the pattern work at 375px?)
- reduced-motion survival (does the no-animation fallback still communicate intent?)
```

## Worker extraction rules

1. Read `source.md` in the target cell directory.
2. Read `/tenstock/_shared/preferences.md` for accumulated feedback (especially for this mood and component).
3. Read `/tenstock/_shared/motion-primitives.css` to find the cited keyframes.
4. Read `/tenstock/_shared/mood.css` to confirm the palette variable names.
5. Generate `index.html` and `style.css` in the cell directory implementing all 12 variants as HTML + CSS.
6. Do not deviate from `source.md`. If ambiguous, leave a TODO comment and report back, do not invent.

## File layout per cell

```
/tenstock/<component>/<mood>/
    source.md     ← spec (commander-authored, agent reads-only)
    index.html    ← 12 variants in a gallery grid (agent-authored)
    style.css     ← 12 variant CSS classes (agent-authored)
```

## Auditor checklist

### Code auditor
- [ ] All 12 variants present, class names follow pattern
- [ ] Motion primitive @keyframes actually used (grep for primitive name)
- [ ] No invented CSS properties (each property must have rationale in spec)
- [ ] PC + Mobile media query coverage (at least 1 breakpoint at 600px)
- [ ] No `transition: all`
- [ ] No inline style on HTML elements
- [ ] palette hex values match mood.css definitions

### Visual auditor (via Claude Preview MCP)
- [ ] Launch cell `index.html` in preview
- [ ] Resize to 1440×900, screenshot, analyze: all 12 visible, no overflow, animation runs on hover
- [ ] Resize to 375×667, screenshot, analyze: all 12 reflow gracefully, touch-friendly
- [ ] Mood impression: palette + timing reads as stated mood
- [ ] No broken layout, no missing elements

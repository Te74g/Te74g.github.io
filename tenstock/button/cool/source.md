# Button × Cool × 6 — cell spec

## 1. Cell identifier

```
component: button
mood:      cool
count:     6        (honest count for real button-interaction motions)
status:    pilot (motion-type calibration)
```

## 2. Scope — what "Button" means here

A Button cell demonstrates motions that respond to user input or run
persistently on a button element. Concretely:

- **hover** — fires when pointer enters (desktop-gated; touch avoided
  to prevent sticky-hover)
- **idle-infinite** — runs persistently from page load, without trigger
- **click** — fires on user commit

Entrance motions (fire once on load to establish presence) belong to a
different cell category and are not included here.

### Prior-iteration correction

An earlier iteration populated 12 variants from an entrance-motion demo
gallery and labelled them "button." On review, the trigger contract was
wrong: those motions fire once on load and then sit static, which is the
opposite of button feedback. This version rebuilds with only motions that
respond to the button's actual interaction model.

## 3. Variant axes

### 3.1 Primary axis: **trigger × motion_family** (6 distinct)

| # | trigger        | motion family               |
|---|----------------|-----------------------------|
| 01| hover          | underline reveal from center|
| 02| idle-infinite  | asymmetric double-pulse     |
| 03| idle-infinite  | subliminal breath           |
| 04| idle-infinite  | pulse glow (opacity)        |
| 05| idle-infinite  | light flicker (15% visible) |
| 06| click          | 8-direction particle burst  |

Three trigger categories each demonstrate a different button-feedback
paradigm:
- **hover**: "this element is selectable" — reveals on user proximity
- **idle-infinite**: "this element is alive" — runs continuously at
  various intensities (asymmetric pulse, subliminal skew, steady glow,
  rare spike)
- **click**: "this element confirms your action" — fires on commit

### 3.2 Secondary axes (shared, not variant-driving)

- **timing**: per-variant (0.65s / 1.2s / 4s / 8s / 0.8s) calibrated per motion
- **easing**: `ease-in-out` for idle-infinite; snap curve
  `cubic-bezier(0.77, 0.02, 0.25, 0.97)` for hover transition; particle
  travel uses `cubic-bezier(0.96, 0.02, 0.04, 0.98)`; particle grow/shrink
  uses `cubic-bezier(0.63, -0.01, 0.29, 1)`.
- **palette**: `var(--color-accent)` = cyan `#00d9ff` (mood cool). Particle
  color inherits at 0.5 alpha. Border/text use currentColor.

### 3.3 Explicitly excluded

- **direction variants** (e.g. breath-R vs breath-L): would be the same
  motion mirrored; one direction is chosen per cell, not counted twice.
- **size variants**: all buttons share the mood-wide skeleton size.
- **entrance motions**: handled by a separate entrance-category cell.

## 4. Mood palette binding

```
uses from _shared/mood.css body.mood-cool:
  --color-bg       #0a0e27
  --color-accent   #00d9ff
  --color-text     #e8eaed
  --ease-default   cubic-bezier(0.7, 0, 0.3, 1)   — used for transitions
  --dur-default    200ms                          — used for hover transitions
```

Zero palette overrides. All motions are transform / opacity based and
inherit color via `var(--color-accent)` or currentColor.

## 5. Deviation notes

### 5.1 Primitive usage

This cell composes primitives from `_shared/motion-primitives.css`
(§interact and §particle sections) onto the `.btn-cool` skeleton
without altering the keyframe bodies.

### 5.2 Layout-adapted local keyframe (#02)

The shared primitive `ts-pulse-outer` includes a `translateX(-50%)`
scaffold transform for absolute-centered layouts. This pilot's button
is `inline-flex`, so we define a local derivative
`ts-btn-cool-pulse-outer` that drops the `translateX(-50%)` scaffold
and keeps only the scale values. Motion values (stop %, amounts,
period, easing) are unchanged; only the positioning scaffold is removed.

**Rule**: when a primitive includes layout-scaffold transforms
(centering, absolute offsets) that the adopting context doesn't need,
those scaffold transforms may be stripped in a local derivative. Motion
values (scale amounts, rotate degrees, translate distances, stop %,
timings, easings) stay intact.

### 5.3 Hover-device gating (#01)

`.btn-cool--01` wraps the `:hover` rule in `@media (hover: hover)`. On
touch devices, the `:hover` pseudo-class would latch after tap, creating
"underline won't go away" UX. Gating against `hover: hover` avoids this.

## 6. Known constraints & gap analysis

### 6.1 Count: 6, not 12

The current primitive library contains approximately 6–7 distinct
button-interaction motion families (spread across hover / idle-infinite
/ click triggers). Padding the cell to 12 would require either:

**A)** Accept 6 as the honest count for Button × N. Other moods (Cute /
Elegant / Modern / Retro / Fantasy) also at 6 variants each. Sets Button
total to 6 × 6 = 36 patterns (not 72).

**B)** Widen the primitive library for button interactions: add hover-scale,
hover-bg-fill, hover-border-morph, ripple click, 3D-card-flip, skew-sweep.
Grows count but increases primitive surface area.

**C)** Split Button into Button-Attention (idle-infinite) + Button-Interaction
(hover/click). Each has fewer but more coherent variants. Total per mood =
4 attention + 3 interaction = 7.

**D)** Pair with an entrance-category cell (Button-Enter × Cool × 6). Reuses
the entrance-motion library under correct category labels. Total per mood =
6 interact + 6 enter = 12.

Default recommendation: **D + A**. Adds an entrance-category cell that
correctly homes the entrance motions, keeps this interaction cell at honest 6.

### 6.2 #01 underline requires `overflow: visible`

The `.btn-cool` skeleton doesn't set `overflow: hidden` in this revision
(it did in a prior revision for clip-path entrance motions; removed here
since interaction motions don't need clipping). `.btn-cool--01` explicitly
sets `overflow: visible` so the `::after` underline (at `bottom: -6px`)
renders outside the border.

### 6.3 #06 particles need `overflow: visible` + `isolation: isolate`

`.btn-cool--06` sets `overflow: visible` so 8 particles can fly outside
the button rectangle, and `isolation: isolate` so the particle stacking
doesn't escape to parent layers.

### 6.4 #06 click replay via class toggle + reflow

Restarting CSS animation on repeated clicks requires stripping the
animation-bearing class, forcing layout reflow (`void el.offsetWidth`),
and re-adding. The IIFE in `index.html` handles this.

## 7. Evaluation axes for user

- **Trigger-type fit**: does each variant feel like a real button
  interaction (hover / idle / click), or does it still feel like
  something else? (This is the core correction — user to confirm.)
- **Mood fit (cool)**: do dark-navy bg + neon cyan + snap easings read
  as "かっこいい"?
- **Triggerability distinguishability**: with 6 side by side, can the
  user tell at a glance which are hover / idle / click? (Idle group is
  4 — risk of monotony; do #02/#03/#04/#05 read as distinct?)
- **Mobile survival**: at 375px, does #01 underline still work (touch
  no-op), do idle motions still play, does #06 click still burst?
- **Count honesty**: is 6 the right stopping point, or should we pursue
  an option from §6.1 to reach 12?

## 8. Open questions

1. Is Button × Cool × 6 acceptable as-is, or should we pursue A/B/C/D from
   §6.1 to reach 12?
2. Is the #02 layout-scaffold strip (dropping `translateX(-50%)`) acceptable,
   or should the button skeleton be restructured to preserve the scaffold?
3. Is #05 light flicker too long at 8s cycle for a CTA button? (It's
   designed for environmental decoration; shortening to 4s would deviate
   from the source timing.)
4. Should we add a paired #03R + #03L breath demo cell to show the "pair"
   design intent, or is single breath sufficient?
5. If #02–#05 are considered too idle-biased ("environmental, not
   button"), is the right move to drop them from this cell and replace
   with hover/click variants even if the primitive library needs to
   grow? (Option B from §6.1.)

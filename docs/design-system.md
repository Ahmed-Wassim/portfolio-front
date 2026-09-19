# DESIGN SYSTEM

```
█████████████████████████████████████████
█                                       █
█   DESIGN STATUS: ONLINE               █
█   NEO-BRUTALIST EDITORIAL STYLE       █
█                                       █
█████████████████████████████████████████
```

> Bold. Square. Hard-edged. No gradients. No rounded corners. No smooth anything.

---

## DESIGN LANGUAGE

Neo-brutalist editorial. Reference precedents: Bloomberg Businessweek, Balenciaga, Drudge Report, Typical Organization, Are.na.

Key traits:

- Oversized mixed filled + outline display type (`-webkit-text-stroke`)
- 2px solid ink borders, square corners — zero `border-radius`
- Hard offset drop shadows (`4px 4px 0 var(--ink)`)
- Visible dot grid + grid-line field background
- Asymmetric "structured chaos" — structured, not random
- No gradients, no glassmorphism, no smooth rounded cards
- Early-web blue flash on hover (links only)
- Window-bar header — `AHMEDWASSIM.exe` + traffic-light dots
- Status LED blink — online `--status-online`, offline `--danger`

---

## TYPOGRAPHY

| Role | Font | Notes |
|---|---|---|
| Display / headings / labels / nav | **IBM Plex Mono** | `next/font`, mono |
| Body / prose | **Space Grotesk** | `next/font`, sans |

Both loaded via `next/font` in `src/app/layout.tsx` and set as CSS custom properties (`--font-mono`, `--font-sans`). Never import Google Fonts directly.

**Display type technique:**

Mix filled + outlined text in the same heading using `-webkit-text-stroke`:

```css
/* filled — default ink */
.role-filled  { color: var(--color-ink); }

/* outlined — transparent fill, ink stroke */
.outline-text {
  color: transparent;
  -webkit-text-stroke: 2px var(--color-ink);
}
```

Screen readers see a visually-hidden full phrase alongside the visual split — required for accessibility.

---

## COLOR TOKENS

Defined in `src/app/globals.css` on `:root` (light) and `[data-theme="dark"]` (dark).

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--bg` | `#F7F5ED` warm paper | `#0F0F0E` | Page field |
| `--ink` | `#111111` | `#F7F5ED` | Text, borders, shadow fill |
| `--panel` | `#FFFFFF` | `#1C1C1C` | Cards, header, outlined buttons |
| `--main` | `#FFF500` yellow | `#FFF500` | CTA surfaces, hero slab |
| `--secondary` | `#3B82F6` blue | `#60A5FA` | Link hover only |
| `--small` | `#F472B6` pink | `#F9A8D4` | Badges, pink deco circle |
| `--muted` | `#6B6B6B` | `#9CA3AF` | Meta copy, timestamps |
| `--status-online` | `#22C55E` | `#4ADE80` | Status LED |
| `--danger` | `#DC2626` | `#F87171` | Errors, delete, offline LED |
| `--success` | `#16A34A` | `#4ADE80` | Toast success |
| `--ghost` | `color-mix(in srgb, var(--ink) 8%, transparent)` | `color-mix(... 12%, ...)` | Grid dots, watermark |

Tailwind aliases (registered in `@theme`):

```
--color-bg        --color-ink       --color-panel
--color-main      --color-secondary --color-small
--color-muted     --color-border    --color-status-online
--color-danger    --color-success   --color-ghost
```

**Rules:**
- Colors only via tokens. Never raw hex in components.
- `--main` slabs use `--ink` for body text — never `--muted` (contrast).
- Decorative shapes use `--secondary` / `--small` as paint only (`pointer-events: none`). Never attach hover flash to decorative geometry.
- Dark mode: yellow and pink stay vivid. `shadow-brutal-lg` uses `6px` offset in dark (same visual weight as `8px` on light).

---

## CSS UTILITIES

All defined in `src/app/globals.css`.

### Borders & Shadows

```css
.border-brutal     { border: 2px solid var(--color-ink); }

.shadow-brutal     { box-shadow: 4px 4px 0 var(--color-ink); }

.shadow-brutal-lg  { box-shadow: 8px 8px 0 var(--color-ink); }
/* dark: */        { box-shadow: 6px 6px 0 var(--color-ink); }
```

### Backgrounds

```css
/* dot grid using --ghost */
.bg-dots  { background-image: radial-gradient(var(--color-ghost) 1px, transparent 1px); }
.bg-grid  { background-image: ... /* 1px lines in --ghost */ }
```

### Buttons

| Class | Fill | Text | Use |
|---|---|---|---|
| `.btn-brutal` | base | any | square, 2px border, hard shadow, active press |
| `.btn-brutal-ink` | `--ink` | `--bg` | primary CTA (VIEW WORK) |
| `.btn-brutal-panel` | `--panel` | `--ink` | secondary CTA (DOWNLOAD CV) |
| `.btn-brutal-main` | `--main` | `--ink` | accent CTA (HIRE ME) |

Button press behavior — CSS only, no JS:

```css
.btn-brutal:active {
  transform: translate(4px, 4px);
  box-shadow: 0 0 0 var(--color-ink);  /* shadow collapses on press */
}
```

### Links

```css
.flash-blue:hover { color: var(--color-secondary); }
```

Apply **only** to real `<a>` / Next `<Link>` elements. Never on decorative shapes.

### Focus

```css
.focus-brutal:focus-visible {
  outline: 2px solid var(--color-ink);
  outline-offset: 2px;
}
```

Apply globally to all interactive elements. Replaces browser default outline.

### Outline Text

```css
.outline-text {
  color: transparent;
  -webkit-text-stroke: 2px var(--color-ink);
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  /* kills: blink animation, Reveal transitions, transform hovers that shift content */
}
```

Status LED solid on (no blink). Reveal wrapper is no-op. Button press transform still works (it is input feedback, not decoration).

---

## COMPONENT PATTERNS

### `StatusPill`

Online/offline indicator. Used in Hero and on fetch-failed sections.

```tsx
<StatusPill status="online" />   /* green LED + blink + label */
<StatusPill status="offline" />  /* red LED, no blink + label */
```

Token: `--status-online` / `--danger`

---

### `PlaceholderBlock`

Brutal geometric SVG shown when:
- A project has no image
- An `<img>` fires `onError`
- WORK section is empty (3 blocks)

Uses only design tokens — never raw color values.

---

### `Reveal`

IntersectionObserver wrapper. Fades + slides in section content on scroll.

```tsx
<Reveal delay={100}>
  <WorkSection />
</Reveal>
```

No-op under `prefers-reduced-motion`. Configurable `delay` (CSS `transition-delay`).

---

### Cards (Work section)

- 2px border (`border-brutal`)
- Hard shadow (`shadow-brutal`)
- Square corners
- Numbered `01 /` prefix in mono
- Full-width image with `onError → PlaceholderBlock`
- Title clamps to 2 lines on cards; full text on detail page

---

### Hero Layout

```
┌─────────────────────────────────────────┐
│  ● SYSTEM STATUS: ONLINE                │  ← StatusPill
│                                         │
│  BACKEND                                │  ← filled (--ink)
│  SOFTWARE ENGINEER                      │  ← outlined (-webkit-text-stroke)
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  I build digital products that  │    │  ← yellow slab (--main)
│  │  refuse to be boring.           │    │
│  │  Laravel · Go · PostgreSQL      │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [VIEW WORK]    [DOWNLOAD CV ↓]         │  ← ink + panel buttons
│                                         │
│                          CODE           │  ← watermark (--ghost)
│  ■          ●   ○                       │  ← deco shapes (pointer-events: none)
└─────────────────────────────────────────┘
```

Decorative shapes (blue square, pink circle, ink dot) are hidden under 640px so they never overlap type.

---

## DARK MODE

Toggle: `localStorage` key `data-theme`. Values: `"light"` | `"dark"`.

- First visit: respects `prefers-color-scheme`
- After manual toggle: ignores system changes
- No-FOUC: inline `<script>` in `layout.tsx` sets `data-theme` on `<html>` before paint
- Fallback if localStorage blocked: uses system preference for session, still allows in-session toggle
- Default if script fails: `data-theme="light"`

---

## ANIMATIONS

CSS-only. No animation libraries.

| Effect | Implementation | Duration |
|---|---|---|
| Button press | `translate(4px,4px)` + shadow collapse | instant |
| Link hover flash | `color: var(--secondary)` | 80–120ms |
| Section reveal | opacity + translateY via IO | ~300ms |
| Status LED blink | `@keyframes blink` opacity pulse | ~1s |

No Lenis, no Framer Motion, no scroll hijack.

---

## ACCESSIBILITY

- Skip link: `"Skip to content"` → `#main` (visually hidden until focused)
- All `.btn-brutal` elements are real `<button>` or `<a>` — never `<div onclick>`
- Outline headings include a visually-hidden full phrase for screen readers
- `:focus-visible` with `.focus-brutal` on every interactive element
- High-contrast / Windows HC: outline display type still communicates full text via hidden span
- `pointer-events: none` on all decorative shapes

---

```
[VIEW WORK]  [DOWNLOAD CV ↓]
```

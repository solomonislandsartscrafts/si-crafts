# SI Crafts — Design System (STRICT — Do Not Deviate)

This document describes the design system **as implemented** in
`tailwind.config.ts` and `src/app/globals.css`. Those two files are the source
of truth; this doc must be updated whenever they change. All new features,
pages, and components MUST follow these standards. Do NOT introduce new
colours, fonts, spacing values, or component patterns outside of what is
defined here.

## Theme: the Solomon Islands flag

The palette is derived from the national flag — blue field, white/gold diagonal,
green. The flag motif appears as a repeated brand device (see Flag motif below)
rather than as decoration on every surface. The crafts and the maker stories
lead; the UI stays quiet.

## Colours (LOCKED — no additions or changes)

| Token | Hex | Usage |
|-------|-----|-------|
| `deep-blue` | `#1B3A4B` | Headings, footer background, admin sidebar |
| `ocean-light` | `#3D7AC4` | Focus-ring offsets, icons, borders — **not text** |
| `ocean` | `#1E5AA8` | Links, interactive accents, info badges |
| `ocean-dark` | `#154A8C` | Hover state for ocean text/links |
| `brand-green-light` | `#28994D` | Focus rings, outline borders — **never a fill behind white text** |
| `brand-green` | `#1E7A3D` | Primary CTA buttons, accent bars |
| `brand-green-dark` | `#166B30` | Hover state for primary CTAs |
| `accent-gold-light` | `#F7C555` | Light gold accents |
| `accent-gold` | `#F4B728` | Accent lines, active nav indicator, ribbons |
| `accent-gold-dark` | `#D89412` | Gold hover/active |
| `terracotta-light` | `#C97B57` | Decorative / dark-text warm accents — **not white text** |
| `terracotta` | `#A9522F` | Warm accents. White heading text OK (4.9:1). Valid `PageHeader` banner colour but not currently assigned to any page — see Page banners |
| `terracotta-dark` | `#8C4426` | Terracotta hover/active |
| `crest-red` | `#C0392B` | Error states only |
| `cream` / `page-bg` | `#FFFFFF` | Page background — white |
| `card-bg` | `#FFFFFF` | Card backgrounds — white |
| `section-warm` | `#FBF7F2` | Alternating body-section band (via `.section-band`). Barely-there **warm** off-white — not cool grey |
| `footer-bg` | `#0E2129` | Footer — deepest surface. Deep-blue hue taken darker; distinct from the deep-blue banners above it |
| `footer-text` | `#FFFFFF` | Footer primary text |
| `footer-muted` | `#CBD5DC` | Footer secondary text |
| `sand-light` | `#F0F0F0` | Note boxes, small local surfaces, admin panels (**not** full section bands, **not** card image wells) |
| `sand` | `#E5E5E5` | Borders, dividers |
| `sand-dark` | `#D4D4D4` | Input borders |
| `warm-gray-100` | `#FAFAFA` | Lightest surface — **background only** |
| `warm-gray-200` | `#F0F0F0` | Light surface — **background only** |
| `warm-gray-400` | `#736B62` | Muted/secondary text, placeholders |
| `warm-gray-600` | `#5C5648` | Secondary body text |
| `warm-gray-800` | `#3D362E` | Primary body text |
| `success` | `#1E7A3D` | Success states, approved badges |
| `warning` | `#F4B728` | **Background only** — GST warnings, pending badges |
| `warning-text` | `#92650A` | Warning **text** on white |
| `error` | `#C0392B` | Error messages, validation errors |

### Colour rules

- Never use raw hex inline. Always use the token class (`text-deep-blue`,
  `bg-sand-light`, `border-ocean`).
- `terracotta` is a real token — the warm earth accent. It is a valid
  `PageHeader` banner colour (see Page banners) alongside `blue`/`green`/`gold`,
  but it is not currently assigned to a page, and it is NOT a general-purpose
  fill outside the banner/accent use. Legacy aliases `teal` and `motto-gold`
  were removed because they pointed at ocean/gold and the names lied about the
  colour.
- White heading text on terracotta is only safe on `terracotta` (4.9:1) and
  `terracotta-dark` (6.0:1). `terracotta-light` fails AA for white text — use it
  for decoration or with dark text.
- The page canvas is white (`cream`/`page-bg`/`card-bg` are all `#FFFFFF`). Card
  boundaries come from `shadow-card` + borders and from the alternating
  `bg-sand-light` section bands, not from a page/card colour difference. The
  warmth in the palette lives in accents — primary buttons, chips, section
  bands and the maker-card craft line — not in the canvas. The page banner is
  no longer blue-only: interior banners rotate across `blue`, `green`, `gold`
  and `terracotta` (see Page banners).
- Never use plain Tailwind greys (`gray-100`, `slate-*`, `zinc-*`). They are
  cool and clash with the warm palette. Use `warm-gray-*` or `sand-*`.
- `ocean-light` fails AA for normal text (4.4:1). Icons, borders, large text only.
- Gold backgrounds ALWAYS take dark text. White on gold fails at every shade.
- `warm-gray-100`/`200` are surfaces, never text.
- `footer-bg` and the admin sidebar require explicit light text — never inherit.

## Typography (LOCKED)

Two families, both loaded via `next/font/google` in `src/app/layout.tsx`:

- **Headings** — Poppins, exposed as `--font-heading`, class `font-heading`
- **Body** — DM Sans, exposed as `--font-body`, class `font-body` (default on `<body>`)

Never add a third family. Never use a display or decorative face.

### Type scale

`base` is 16px and is the accessibility floor for reading text.

| Class | Size | Use |
|-------|------|-----|
| `text-xs` | 12px | Timestamps, metadata, badge text only |
| `text-sm` | 14px | Captions, secondary labels only |
| `text-base` | 16px | Body copy — the minimum for anything read as prose |
| `text-lg` | 18px | Intro/lead paragraphs |
| `text-xl` | 20px | Small h3 |
| `text-2xl` | 24px | h3 / small h2 |
| `text-3xl` | 30px | h2 default |
| `text-4xl` | 36px | h1 on interior pages |
| `text-5xl` | 48px | h1 on the homepage hero |

`text-xs` and `text-sm` are below the 16px floor. Never use them for
paragraphs, maker stories, or any content the user is expected to read.

### Heading treatments — use exactly these

| Element | Class |
|---------|-------|
| Page title (h1) | Always via `<PageHeader>` (plain, or `banner` for the coloured band). Never hand-rolled. |
| Section heading (h2) | `font-heading text-2xl md:text-3xl font-medium text-deep-blue` |
| Card/subsection (h3) | `font-heading text-lg font-semibold text-deep-blue` |
| Small card title (h3) | `font-heading text-base font-semibold text-deep-blue` |
| Body | `text-base leading-body` (inherited — no class needed) |
| Secondary | `text-sm text-warm-gray-600` |
| Tiny label | `text-xs text-warm-gray-400` |
| Code / product codes | `font-mono font-bold` |

### Line height — on the 4px base unit

Line boxes are sized so a run of text stacks in step with the spacing scale
instead of drifting a fraction of a pixel per line. Ratios are unitless (so a
nested larger element still scales), and each one is chosen for the size it pairs
with:

| Class | Ratio | Pairs with | Line box |
|-------|-------|-----------|----------|
| `leading-body` | 1.75 | `text-base` (16px) | 28px — 7 × base |
| `leading-body-lg` | 1.7778 | `text-lg` (18px) | 32px — 8 × base |
| `leading-heading` | 1.3333 | any heading ≥ 18px | 24 / 32 / 40 / 48 / 64px |
| `leading-title-sm` | 1.5 | 16px card headings | 24px — 6 × base |
| `leading-relaxed` | 1.75 | alias of `leading-body` | 28px |

`leading-heading` is 4/3 because every heading size in the scale (18, 24, 30, 36,
48) is a multiple of 3 — so the ratio puts all of them on a multiple of 4px. The
old global `1.2` did not: a 24px h3 took a 28.8px line box, which is what made
multi-line headings sit slightly out of step with the blocks around them.

`leading-tight`, `leading-snug` and `leading-none` are NOT used — none of them
lands on the grid at the sizes this site uses. Pick from the table above.

Rules:
- Headings always `font-heading`; body always inherits `font-body`.
- Heading colour is `deep-blue`; body colour is `warm-gray-800`.
- Poppins reads heavier than a serif — use Medium (500) for h1/h2, Semibold
  (600) for h3. Avoid Bold (700) for headings.
- `leading-body` (1.75) minimum on body copy.
- Never skip heading levels (no h1 → h3).

## Flag motif (brand device)

Defined in `globals.css`. Use these rather than inventing new dividers:

| Class | Height | Use |
|-------|--------|-----|
| `.flag-divider` | 6px | Below the site header |
| `.flag-hairline` | 3px | Caps the top edge of dark bands |
| `.flag-mark` | 4px × 64px | Stub under interior page titles |

`<Logo>` (`src/components/layout/logo.tsx`) is the brand lockup: the SIAC logo
image (`/images/sica logo.png`), which already contains the frangipani mark and
the "Solomon Islands Arts & Crafts" wordmark. Never set text beside it.

- Sized by height with `w-auto` (`h-10 sm:h-11`) so the artwork cannot distort.
- Renders `alt=""` on purpose: it always sits inside a link that carries its own
  `aria-label`, and that label wins over `alt` for the accessible name.
- There is no `light` variant. The artwork is dark ink on transparency, so it
  disappears on dark surfaces. The footer and admin sidebar render their own
  white text instead of using `<Logo>`.

There is no `<FlagMark>` component; the flag device is CSS-only via the classes
above.

## Spacing (LOCKED)

**Base unit: 4px.** Every margin, padding and gap in the project is an exact
multiple of it. Tokens are declared as CSS variables in `src/app/globals.css`
(the `SPACING TOKENS` block at the top of the file) and surfaced as Tailwind
utilities via `theme.extend.spacing` in `tailwind.config.ts`. Those two files are
the source of truth; change a value there and every call site follows.

Never write a raw length. `p-[18px]`, `margin: 1.375rem` and `gap-7` are all
bugs.

### The raw scale

| Token | Value | Typical use |
|-------|-------|-------------|
| `3xs` | 4px | Hairline nudges, icon-to-baseline alignment |
| `2xs` | 8px | Heading → its own subtitle; icon → its label |
| `xs` | 12px | Button rows, chip rows, inline metadata |
| `sm` | 16px | Card padding, tight stacks |
| `md` | 24px | Roomier card padding, block internals |
| `lg` | 32px | Grid gutters (desktop), heading → content (desktop) |
| `xl` | 48px | Section band padding (mobile) |
| `2xl` | 64px | Page gutter (desktop), block separation (desktop) |
| `3xl` | 96px | Section band padding (desktop) |

Usable as `p-md`, `gap-lg`, `mt-2xs`, `space-y-md`, `-mx-2xl`, and so on.

Tailwind's own numeric steps (`p-4`, `gap-2`, `mt-6`) are all multiples of 4px
and remain legal for micro-spacing **inside** a component. Anything structural —
page, section, block, heading-to-content, grid gutter — MUST use a named token.
The 2px half-steps (`p-1.5`, `gap-2.5`, `py-3.5`) are NOT legal: they are off the
base unit. They have all been removed; do not reintroduce them.

### The semantic layer — responsive on its own

These tokens re-point at a different rung of the raw scale at a breakpoint, so a
single class is a complete responsive declaration. `pb-section` replaces
`pb-10 lg:pb-20`.

**Do not prefix them with a breakpoint.** `lg:pb-section` defeats the point and
reintroduces the per-call-site drift they exist to prevent.

| Token | Mobile | Desktop | Use |
|-------|--------|---------|-----|
| `gutter` | 16px | 64px @920 | Page side gutters (via `.site-px`) |
| `page` | 24px | 32px @920 | Whole-page top/bottom padding (via `.page-y`) |
| `section` | 48px | 96px @1024 | Between major page sections (via `.section-y`) |
| `block` | 32px | 64px @1024 | Between blocks inside one section |
| `stack` | 24px | 32px @1024 | Section heading/subtitle → the content below |
| `grid` | 24px | 32px @920 | Card grid gutters, both axes |

### The hierarchy

Largest to smallest. This ordering is the whole point of the system — check any
new spacing against it:

1. **`section`** (48 → 96) between major page sections — hero, "Meet the
   makers", "Featured Crafts", the CTA band, "Latest news", the footer.
2. **`block`** (32 → 64) between blocks inside one section. Deliberately exactly
   half of `section` at both breakpoints, so a block break can never be mistaken
   for a section break.
3. **`stack`** (24 → 32) from a section heading down to the content it
   introduces.
4. **`grid`** (24 → 32) between cards in a grid.
5. **`2xs`** (8px) between a heading and its own subtitle, an icon and its label,
   or any other pair that has to read as one unit.

Heading pattern, and it is not optional: a section heading sits **8px** above its
subtitle (`mb-2xs` — one tight group) and the pair then takes a **`mb-stack`**
step down to the content grid. If a heading has no subtitle it still takes
`mb-stack` to its content.

### Internal ≤ external

Padding inside a component is never larger than the gap separating it from its
neighbours. Card padding is `sm` (16) or `md` (24) against a `grid` gutter of
24 → 32. Check this whenever you add a card or panel variant.

### Mobile is the same ladder, one rung down

Every semantic token steps to a smaller rung of the **same** scale on small
screens — it never switches to a different set of numbers. `section` (48 → 96)
and `block` (32 → 64) are both exactly 1:2.

### Utilities in `globals.css`

| Class | Value | Use |
|-------|-------|-----|
| `.page-y` | `--page-y` (24 → 32) | Top/bottom padding for a whole page |
| `.section-y` | `--section-y` (48 → 96) | Padding for a major band within a page |
| `.site-px` | `--gutter` (16 → 64) | Page gutters, nothing else |
| `.site-container` | `.site-px` + `max-width:1440px` + centred | The standard page container |

`.page-y` and `.section-y` live in the `components` layer, so **any Tailwind
`py-*`/`pt-*`/`pb-*` on the same element silently overrides them.** That is used
deliberately (`<PageHeader>` tightens its own bottom padding to `pb-stack`), but
it also means adding `py-*` to a `.page-y` element cancels the rhythm.

### The container

**Use `.site-container`. Never hand-roll a page container.** Every container on
a page must resolve to the same gutter, or the left edge of the content visibly
steps in and out as you scroll — the most common way to break this layout. A
page header at one gutter above a body at another is a bug, not a style choice.

For a narrower single-column page, pair the width utility with the gutter
utility: `max-w-2xl mx-auto site-px`. Never `max-w-2xl mx-auto px-4`.

To break a child out of the gutter (full-bleed carousel, edge-to-edge media),
use the matching negative margin: `-mx-gutter`.

| Context | Class |
|---------|-------|
| Page container | `site-container` |
| Max content width (bare) | `max-w-site` (1440px) |
| Page bottom padding | `pb-section` |
| Card grid gutters | `gap-grid` |
| Two-column text/media split | `gap-block` |
| Section heading → content | `mb-stack` |
| Heading → its subtitle | `mb-2xs` |
| Card padding | `p-sm` (16) or `p-md` (24) |
| Button padding | Never. `<Button>`/`<ButtonLink>` own it. |
| Prose column | `max-w-2xl` (intro), `max-w-3xl` (article body) |

Every page container is `site-container`. Do not introduce `max-w-7xl` or
`max-w-4xl` page containers — `max-w-7xl` was the old 1280px container and no
longer appears in the codebase.

**Admin is deliberately exempt from the desktop gutter.** Admin surfaces use
`p-md tabtop:p-lg` (24 → 32) instead of `.site-px`: it is dense tabular data, and
128px of side padding would cost real column width. Same scale, two rungs lower.

### The only permitted exceptions

Two, both documented at their call site:

- `-mb-[2px]` in `product-tabs.tsx`, which must equal the container's 2px bottom
  border so the active tab sits over it. Border widths are not on the spacing
  scale.
- Decorative rule heights (`.flag-divider` 6px, `.flag-hairline` 3px). These are
  borders, not spacing.

## Component patterns (LOCKED)

Always use the shared component. Do not hand-roll an equivalent.

| Need | Use | Path |
|------|-----|------|
| Page title | `<PageHeader>` | `components/layout/page-header.tsx` |
| Button | `<Button>` | `components/ui/button.tsx` |
| Form field | `<FormField>` + `inputClasses` | `components/ui/form-field.tsx` |
| Select | `<Select>` | `components/ui/select.tsx` |
| Status pill | `<StatusBadge>` | `components/ui/status-badge.tsx` |
| Breadcrumb | `<Breadcrumb>` | `components/ui/breadcrumb.tsx` |
| Image | `<SafeImage>` | `components/ui/safe-image.tsx` |
| Toast | `useToast()` | `components/ui/toast.tsx` |
| Empty state | `<EmptyState>` | `components/ui/empty-state.tsx` |
| Loading placeholder | `<Skeleton>` | `components/ui/skeleton.tsx` |
| Closing CTA band | `<PageCta>` | `components/layout/page-cta.tsx` |
| Product card | `<ProductCard>` | `components/cards/product-card.tsx` |
| Maker card | `<MakerCard>` | `components/cards/maker-card.tsx` |
| Craft card | `<CraftCard>` | `components/cards/craft-card.tsx` |

### Page banners

The interior-page header is a full-bleed coloured band, produced by
`<PageHeader>` itself — pass the `banner` prop, do NOT build a separate banner
component:

```tsx
<PageHeader
  banner="green"                    // "blue" | "green" | "gold" | "terracotta"
  eyebrow="Full collection"         // short label, rendered with a leading rule
  title={text['catalogue.title']}
  intro={text['catalogue.intro']}
/>
```

- **Interior banners rotate across the flag-stripe palette — `blue`, `green`,
  and `gold` — plus `terracotta`.** This replaces the earlier "every banner is
  blue" rule. The three main colours are the same ones already used in the
  `.flag-divider` / `.flag-hairline` / `.flag-mark` stripe motif, so banner
  variety reuses an existing part of the palette rather than inventing a new
  one. `blue` (`deep-blue`), `green` (`brand-green`), and `terracotta` are dark
  fills and take white heading text (all AA+). `gold` (`accent-gold`) is a
  light fill and takes dark text (`text-deep-blue`) instead — white on gold
  fails AA at every shade, per the locked colour rules, so `<PageHeader>`
  flips the heading, intro, eyebrow rule and motif stroke to deep-blue
  automatically when `banner="gold"` is passed. Do not hand-set text colour on
  banner children for this — `<PageHeader>` owns the flip.
- **Each banner is a lighter, layered gradient, not a flat fill** — a soft
  radial "bloom" over a diagonal linear wash (`BANNER_GRADIENT` in
  `page-header.tsx`), set as an inline `backgroundImage` with the flat
  `BANNER_BG` class kept underneath as the solid fallback. This matches the
  airier, hand-dyed homepage hero so all bands read as one family. Load-bearing
  contrast rule: a banner has NO dark scrim behind its text (unlike the hero)
  and the heading/intro span the full LEFT of the band, so every dark-fill
  variant's gradient must stay AA for white text across the whole text column
  (the left ~0–55%). The gradients are therefore only modestly lightened from
  the flat tokens — the bright end of each ramp lives on the RIGHT, behind the
  motif, not under the text. `gold` (dark text) is free to be genuinely bright.
  If you retune a gradient, re-check white-on-darkest-text-region stays ≥ 4.5:1
  for the three dark variants.
- Assign a colour per page by rough grouping rather than randomly: `blue` for
  the homepage-adjacent/primary pages (Makers, Contact), `green` for the
  earthier/process pages (About, Crafts & Techniques, Care Guide, Stockists,
  For Makers), `gold` for commerce/info pages (Catalogue, Wholesale, FAQs &
  Shipping, Our Promise). Keep the grouping consistent if you add a new page —
  check the nearest sibling page's banner colour before picking one.
- The band carries a subtle CSS-only motif on the right; default motif is
  `waves` for `blue`, `cross` for `green`, `dots` for `gold`/`terracotta`. Pass
  `motif` to override per page.
- `eyebrow` on a banner is a short string, shown small/uppercase with a leading
  rule. A non-string eyebrow (e.g. a `<Breadcrumb>`) renders as-is but has no
  light styling, so pages that need a breadcrumb eyebrow stay on the plain
  header (no `banner`).
- Banner `children` inherit the banner's text colour (light on `blue`/`green`/
  `terracotta`, dark on `gold`) automatically. Do NOT hard-code
  `text-warm-gray-*` or a fixed `text-white`/`text-deep-blue` on banner
  children — it will be wrong on at least one variant. Components rendered
  inside a banner that need variant-aware styling (e.g.
  `<StockistBannerPrompt>`) take an `onLight` prop for the `gold` case.
- The banner is deliberately suppressed when `align="center"` or
  `width="narrow"`: form and confirmation pages (login, code lookup, stockist
  auth) always use the plain header, never a coloured band.
- The homepage hero (`src/app/page.tsx`) is NOT a `<PageHeader>` — it has its
  own split layout with the image gallery — but it wears the same `green` band
  eyebrow rule, white heading/intro — but its background is NOT a flat band.
  It is an artistic multi-stop gradient blending the full flag palette
  (deep-blue #1B3A4B → ocean #1E5AA8 → brand-green #1E7A3D → accent-gold
  #F4B728), set inline as `backgroundImage` on the hero `<section>` with
  `bg-brand-green` kept as the solid fallback. This is the ONE background
  gradient on the site and is explicitly the sanctioned "subtle overlay on hero
  images" exception in the DO NOT list — do not add background gradients
  elsewhere. All stops are locked palette hex values; no new colours. A flat
  `bg-brand-green` band was replaced because it read heavy and collided with the
  green `.btn-primary`. It is built from a `linear-gradient` colour wash plus
  one or more low-opacity `radial-gradient` blooms for a dyed-textile / scenic
  depth rather than a flat CSS ramp; the exact direction and bloom placement
  are an art-directed choice that has been iterated on, so treat the values in
  `page.tsx` as the source of truth rather than any specific angle quoted here.
  The load-bearing INVARIANT, not the styling: deep-blue must stay dominant
  wherever the heading/intro column sits (currently the top of the band) so the
  white hero text keeps its ~11.9:1 contrast, and an aria-hidden deep-blue
  `linear-gradient` scrim reinforces exactly that region so text stays AA-safe
  even as the gradient warms to light gold elsewhere. Any new gradient version
  MUST preserve that dark text region. Over the gradient sits the SAME `waves`
  motif the interior `<PageHeader banner>` uses (the white, right-anchored,
  `opacity-[0.12]` wave SVG — see `BannerMotif` in `page-header.tsx`), layered
  above the gradient + scrim but under the content column, so the hero carries
  the wave device the interior banners do. A `<FlagDivider variant="mark">` also
  sits above the h1, echoing the same stub used under every section heading
  below (Featured Makers, Featured Products, News) and picking up the same flag
  colours the gradient blends.
  Components placed on that band take their dark-background variant:
  `<HeroSlideshow tone="dark">` and `<HeroCodeToggle tone="dark">`. The white
  slideshow frames are unchanged — a white control pops on the band.
  **The primary CTA ("Browse Catalogue") is NOT the site-wide green
  `.btn-primary`.** `.btn-primary`'s fill is `brand-green` — identical to this
  hero's own background — so the default button rendered as text with no
  visible box at all. It is overridden inline to a gold fill with deep-blue
  text (`!bg-accent-gold !text-deep-blue hover:!bg-accent-gold-dark
  focus-visible:!outline-deep-blue`), the flag's own green/gold pairing, so the
  hero keeps one unmistakable primary action. The secondary "Our Story" button
  keeps the white-outline override (outline buttons have no fill-collision
  problem). The same collision exists in miniature on `<PieceLookup>`'s "GO"
  submit button, which also defaults to `bg-brand-green`: `<PieceLookup>` takes
  a `tone` prop, and `dark` (passed by `<HeroCodeToggle tone="dark">`, used only
  on this hero) swaps it to `bg-ocean`/`bg-ocean-dark` instead. The standalone
  `/piece` lookup page renders `<PieceLookup>` at the default `light` tone, on
  white, where the green fill has no such collision. **The slideshow is hidden
  below `lg` (`hidden lg:block` on its wrapper in `page.tsx`) and appears only
  when the hero splits into two columns.** On a phone the hero is the heading,
  intro, buttons and code lookup alone; the makers and products each have their
  own dedicated section directly below, so nothing is lost by dropping the
  gallery there. Hiding it is what keeps the mobile hero short enough that the
  sponsor row stays in the first viewport (a hard requirement — see
  First-viewport layout), and it drops the images the gallery would otherwise
  load on mobile. The gallery's visibility is a homepage layout decision, so it
  lives on the wrapper, not inside `<HeroSlideshow>` (which stays
  layout-agnostic and simply renders wherever it is placed). The sponsor logos
  sit BELOW the band on white (grey label + ink logos need the light
  background).
- **First-viewport layout.** The hero, the flag stripe capping it, and the
  "Supported by" (`<SponsorBanner>`) row are wrapped in one
  `flex flex-col min-h-screen min-h-[100svh]` block, so on a normal screen the
  sponsor row is visible without scrolling. The hero `<section>` is `flex-1` so
  it absorbs the slack and pushes the stripe + sponsors to the bottom. The hero
  content itself is top-aligned on mobile (`items-start`, `lg:items-center`):
  centring it inside the tall `flex-1` band on a phone added vertical slack that
  pushed the sponsor row below the fold on shorter viewports, so on mobile the
  content sits at the top of the band and all the slack is below it, keeping the
  stripe + sponsor row inside the first viewport. Height is
  a MINIMUM (`min-h`, not fixed): on a short/landscape viewport where the hero
  content is taller than the screen, the block grows and scrolls rather than
  clipping the hero — do not change this to a fixed `h-screen`. `100svh` (small
  viewport height, URL bar showing) is used with a `100vh` (`min-h-screen`)
  fallback first, so the sponsor row lands inside the visible area on a phone
  rather than behind the browser chrome. If the supporters list is empty,
  `<SponsorBanner>` renders `null` and the block simply ends at the flag stripe
  — a graceful, gap-free degradation.

  Keeping the sponsor row inside the first viewport on mobile is a hard
  requirement, and two things protect it: the slideshow is hidden below `lg` (so
  the mobile hero is text-only — heading, intro, buttons, code toggle), and the
  hero grid's bottom padding is `pb-lg` (32) on mobile rather than `pb-section`
  (48). If you add anything to the mobile hero, it comes out of this budget —
  measure the first viewport on a ~640px-tall phone before and after, and do not
  reintroduce the gallery on mobile without re-checking the sponsor row.
- `<HeroSlideshow>` is a **centre-stage carousel**: one large frame in the middle
  with the previous and next slides peeking in either side, scaled to `0.8` and
  at `opacity-70`, so the hero shows at a glance that it holds more than one
  piece. Every frame is `rounded-lg bg-card-bg shadow-card` and `aspect-[4/5]`.
  The geometry lives in three constants at the top of the file — `trackWidth`
  (`w-full max-w-[620px]`), `frameWidth` (`w-[68%]`), `PEEK_STEP` (95,
  in units of one frame's own width) and `PEEK_SCALE` (0.8). Tune the look there,
  never at a call site. Two things follow from that geometry and are load-bearing:
  - **`frameWidth` is one share at EVERY width — no breakpoint.** The component
    is width-agnostic: 68% leaves ~13% of the track visible either side, so the
    peek reads the same at whatever size the component is rendered. (On the
    homepage that size is always `lg`+, because the hero hides the whole
    slideshow below `lg` — see the homepage-hero notes above — but that is the
    call site's decision, not the component's.) An earlier version set `w-full`
    below `sm` to turn the peeks off on small screens; do not reintroduce that —
    the peek is part of the device, and where the slideshow shows it always has
    room for it.
  - **`PEEK_STEP` must keep the neighbour clear of the centre frame.** Lowering
    it widens the peek but slides the neighbour under the centre, which shows up
    as a clipped shadow along the centre frame's edge.
  The stage carries `py-xs` — not spacing for its own sake, but so the
  `overflow-hidden` clip does not shave the top and bottom off every frame's
  `shadow-card`. Focus rings on the frames are `ring-inset` for the same reason.
  The centre frame is a `<Link>` to the piece/maker; a neighbour is a
  `<button>` that brings that slide to the centre — never a link, because a
  cropped unlabelled image is not something a user can choose to navigate to.
  **The caption sits BELOW the stage on the band/page, NOT overlaid on the
  image** — the same rule `PosterCard` follows, and for the same reason: an
  overlaid caption failed on a product cut-out. A product is an `object-contain`
  shot floating on white in the middle of the frame, so a caption pinned to the
  bottom sat on the white void with no dark image behind it to read against, and
  it covered the very piece a buyer was assessing. A maker portrait
  (`object-cover`) hid this because its lower third is naturally dark — but the
  two slide kinds share one carousel, so the pattern has to work for both. Below
  the frame the text is always legible on a solid background and the photo is
  never touched. Because it is now on the band/page rather than on a scrim, the
  caption DOES follow `tone`: light text on the dark hero band, ink-on-white
  (`text-deep-blue` title, `text-ocean` eyebrow) elsewhere. The caption row is
  itself a `<Link>` to the active piece — a second, larger target for the same
  destination — capped to `frameWidth` and centred so it sits under the centre
  frame and breaks where the image edges are. It is re-keyed per slide so it
  cross-fades with the image (`animate-fade-in-up`). There is no gradient scrim
  and no `.text-shadow-overlay` on the slideshow any more; do not reintroduce an
  overlaid caption. Round dots + a pause control sit BELOW the caption (WCAG
  2.2.2). Autoplay pauses on hover/focus and is off entirely under
  `prefers-reduced-motion`; swipe and arrow keys are supported. Only the centre
  and its two neighbours are mounted, so the homepage does not request every
  hero image before the first has painted.
- **The hero grid is an even split at `lg`, 3/2 from `xl`**
  (`lg:grid-cols-2 xl:grid-cols-5`, text `xl:col-span-3`, gallery
  `xl:col-span-2`). The gallery needs real width for the peeks to read: at `lg` a
  2-of-5 column is ~330px, and 68% of that is a centre frame smaller than the
  single frame it replaced. The even split costs the h1 one extra line at `lg`
  and buys the gallery ~95px.
- On the homepage the header floats over that band: `<Header
  transparentOverHero>` (set from `LayoutShell` when `pathname === '/'`) starts
  transparent with light content — the `<Logo>` in its white `onDark` variant
  (a `lg:brightness-0 lg:invert` filter on the dark-ink PNG), white nav links and
  a white-outline Login — then flips to the solid `bg-cream` treatment once
  `window.scrollY` passes ~64px. **This transparent-over-hero treatment is
  DESKTOP-only (`lg`+).** Below `lg` the header is solid white from the start on
  the homepage too, exactly like every other page: the header's transparent
  classes are pinned solid with `max-lg:` overrides, the `<Logo>` white filter is
  gated to `lg` (so the dark ink logo shows on the white mobile bar), and the
  mobile menu button always takes its dark treatment. The reasons: the mobile
  hero is a shorter, text-only band (the slideshow is `lg`+), the flip-on-scroll
  was unreliable across mobile browsers, and a solid white bar reads as
  consistent with the rest of the site on a phone. Do not reintroduce the
  transparent header on mobile. `LayoutShell` still pulls the hero up under the
  header with `-mt-20` on `/`; the hero adds `pt-20` back so its content clears
  the 80px nav (the opaque mobile bar simply sits over the top 80px of the
  gradient band, which the padding already keeps clear of content). On the homepage the flag divider does NOT sit
  under the header (a strip there would cut a line across the gradient hero) — it
  caps the BOTTOM edge of the hero cover instead, as the seam between the hero
  and the "Supported by" row (`<FlagDivider>` rendered in `page.tsx`). No other
  route has a flag stripe under the header (see below).

**Banner size.** Every banner is the SAME height regardless of how much text it
holds, so the bands read as one consistent device across the site. The band has
a fixed `min-h-[17rem]` (`tabtop:min-h-[19rem]`) with `flex items-center`, so a
short header (one-line title, no metadata — Catalogue) and a tall one (two-line
title + a stats row — Makers) fill the same block with their content optically
centred. Banner height is a deliberate one-off dimension — it is NOT on the 4px
spacing scale, and it is the one sanctioned arbitrary height. Width is the
standard `max-w-site` + `site-px`, identical to the page body below, so the band
never changes width between pages and the text lines up with the content.

**Banner spacing.** `py-block` (32 → 64) top and bottom is a floor inside the
band (so an unusually long intro can still grow it past the min-height rather
than overflow), balanced top and bottom. The gap from the band down to the page
content is `mb-block` (32 → 64) on the `<section>` itself: a coloured band
cannot create that gap with bottom padding (that only grows the band), so it
lives as an outside margin. Pages that follow a banner add NO top padding of
their own — the `mb-block` is the whole gap. `block` (a rung below `section`) is
used rather than `stack` because the full-strength band reads as a section
boundary.

**No flag divider under the header.** Interior pages open with a full coloured
banner (`<PageHeader banner>`) directly under the header, and a thin flag stripe
crammed between the white header and that band read as two competing dividers.
The header's own `border-b border-sand` is the separation, and `main` is flush
(no top padding) so the banner meets the header cleanly. Plain-header pages
(login, lookups) supply their own top spacing via `<PageHeader>`'s `page-y`. The
flag motif still appears as the `flag-mark` under section headings and as the
`<FlagDivider>` at the bottom of the homepage hero cover — just not under the
header.

### Cards

**Every public card composes `PosterCard` / `PosterFrame` from
`src/components/cards/poster-card.tsx`.** That file is the source of truth for
card appearance — change it there, never at a call site. Do not hand-roll a card.

**Anatomy.** A fixed-ratio frame carries the image full bleed; the caption sits
BELOW the frame on the page background. There is no panel around the pair — on a
white page a border round the caption added weight without adding separation.

- The **frame** owns the surface: `bg-card-bg`, `shadow-card`, `rounded-lg`,
  `overflow-hidden`, and the hover shadow (`group-hover:shadow-md`).
- The **link wrapper** owns the focus ring (`focus:outline-none focus:ring-2
  focus:ring-ocean`) and carries no panel and no `overflow-hidden`, so the ring is
  never clipped.
- Cards have **no panel padding**. The only internal spacing is frame → caption,
  `pt-xs` (12). `p-sm` / `p-md` padding is for non-card panels — note boxes, admin
  panels — not for cards.

**Frame ratios — a fixed set of three, defined in `poster-card.tsx`:**

| Constant | Ratio | Used by |
|----------|-------|---------|
| `FRAME_ASPECT` | `3/4` | products, crafts |
| `MAKER_ASPECT` | `4/5` | makers — a scene of a person with their work, cropped calmer than the house portrait |
| `ARTICLE_ASPECT` | `3/2` | news — a cover photo is a scene, and landscape stops a story reading as a product tile |

Pass one of these or nothing. A free-form ratio per caller is how a grid loses
its rhythm, and a fourth shape is what this set replaced: crafts used to be
`aspect-square` inside a hand-rolled panel card, so `/crafts-and-techniques`
changed card language mid-visit.

**Grids.** Import the shared recipe; never retype a column ramp.
`posterGridClasses` (2-up → 3 at `lg` → 4 at `xl`) for portrait listings,
`articleGridClasses` (1 → 2 → 3) for news, `centeredArticleGridClasses` for a
news list too short to fill a row.

**Hover — two signals, both required.**
`group-hover:scale-105 transition-transform duration-300` on the image, and
`group-hover:text-ocean` on the title (already baked into `posterTitleClasses`
and `posterHeadlineClasses`). Shadow alone is not enough: `shadow-card` is
`0 2px 8px rgba(0,0,0,0.06)` and hover is `shadow-md`, which on a white card on a
white page is a few percent of opacity — a change you have to look for. Hover must
ADD shadow, never remove it.

**Fit.** Keep `object-contain` for products and crafts. `object-cover` would
remove the letterboxing but it crops the edges — handles, spouts, weave borders —
which is exactly what a wholesale buyer is assessing. Use `object-cover` only
where the subject is central and the crop is safe (maker portraits, article
covers).

**Image wells are `bg-card-bg` (white), never `bg-sand-light`, and carry no
padding.** Product and craft photos arrive at mixed aspect ratios, so
`object-contain` always leaves empty space inside the fixed aspect box. On a grey
well that space reads as a frame drawn around every photo, and the frame is
thicker the further the photo is from square — so the grid looks unevenly ruled.
White makes it disappear into the card.

The one exception is a **missing** image: `<SafeImage>` renders a `bg-sand-light`
well with a muted `ImageOff` glyph and no alt text. A photo that has not arrived
yet must look different from one that has; letterboxing around a photo that is
there must not. Never substitute a stock photograph for a missing image — a grid
of repeated identical photos reads as a broken page, and a real `alt` over a
generic image tells a screen reader the wrong thing about a named maker.

**The pill** (`posterPillClasses`, set via `PosterFrame`'s `pill` prop) is solid
`deep-blue` with white text at `right-xs top-xs`. Never a white or translucent
pill: `contain`-fit product shots frequently have white backgrounds, so a light
chip vanishes on exactly the images it is labelling.

**Caption typography — compose the exported constants, never retype the strings:**

- Title `posterTitleClasses` (16px semibold); news headline
  `posterHeadlineClasses` (18px).
- Content lines `posterBodyClasses` (16px) — a maker's name, a village and
  province, a description.
- `posterMetaClasses` (14px) is for **true metadata only**, meaning a publication
  date. Provenance is the point of this site and is never set at 14px.
- Rhythm: `mt-2xs` (8px) between distinct caption lines; `mt-3xs` (4px) only
  inside a pair that has to read as one unit — the news date kicker above its
  headline, or the maker's craft + place block. Three lines all 4px apart read as
  an undifferentiated list rather than a title with support under it.

**The whole card is one `<Link>` — not just the title.** Where a caption must hold
controls (the stockist Add to Order tile), use `PosterFrame` directly and link the
frame and the title separately, because a button cannot be nested inside a link.
Such a caption keeps its own `hover:text-ocean` on the title, since it sits
outside the frame link's `group`.

**List semantics — one pattern, and it is split in exactly one way.** A card
listing announces its length and position ("2 of 12"), which needs a list role.
The container supplies `role="list"` plus an `aria-label`; `PosterCard` supplies
each card's `role="listitem"` on a wrapper `<div>`. Two rules follow, and both
have already been broken once:

- **Never put `role="listitem"` on the `<a>` itself.** ARIA in HTML restricts
  `a[href]` to link-like roles, so axe fails it (`aria-allowed-role`) and it
  displaces the link role the card depends on.
- **Never wrap a card in a native `<li>`.** The card already carries a listitem,
  and nesting one inside another means its nearest list ancestor is a listitem
  rather than a list (`aria-required-parent`). Card containers are
  `div role="list"` — including the makers carousel, which is why it is a div and
  not a `ul`.

A card rendered with no list ancestor at all is also a violation, so a test that
renders a bare card must wrap it in a `role="list"` the way the site does.

### Buttons

Defined once in `globals.css` and wrapped by `<Button>`:

- `.btn-primary` — green fill, the main action on a page
- `.btn-secondary` — ocean outline, subtle hover, never a fill-swap
- `.btn-danger` — red fill, always paired with a confirmation
- `.btn-admin` — deep-blue fill, admin surfaces only

Padding comes from `--btn-py` / `--btn-px` (12px vertical; 16 → 24px horizontal
at 640px) so the four variants cannot drift apart. `<Button>`/`<ButtonLink>`
override it per `size` from the spacing scale, and `tap-target` guarantees the
48px minimum hit area. Never layer your own `px-*`/`py-*` on a `.btn-*` class,
and never hand-roll a button out of raw Tailwind.

### Forms

- One input treatment: the `inputClasses` constant. Never retype the string.
- Labels and errors come from `<FormField>`.
- Errors: `role="alert"`, red border via `data-error="true"`.

### Status badges

`rounded-sm` deliberately, so they are not mistaken for buttons. Variants:
success, warning, error, info, neutral.

- Approved/success `bg-success/10 text-success`
- Pending/warning `bg-warning/10 text-warning-text`
- Error `bg-error/10 text-error`
- Info `bg-ocean/10 text-ocean`

### Section backgrounds

Body sections alternate between white (the page canvas) and a subtle **warm**
band. The band is `section-warm` (`#FBF7F2`), applied with the `.section-band`
utility on a `.section-y` section — `.section-band` sets only the background and
composes with `.section-y`, which still owns the vertical rhythm. It is a
barely-there warm off-white so successive sections read as distinct surfaces
without a hard edge.

Do NOT tint sections with `bg-sand-light` (`#F0F0F0`) — that is a cool grey, and
between white bands it reads as a wireframe / disabled surface and clashes with
the warm craft palette. The band is `section-warm`, never `sand-light`.
`bg-sand-light` is still fine for small local surfaces (note boxes, admin
panels), just not as a full-width section band.

Alternate deliberately — do not band every section. A page of solid warm bands
is as flat as a page of solid white. The pattern is one warm section between
white ones (on the homepage: white Makers → warm Products → deep-blue CTA →
white News), so the warm surface reads as a change rather than the default.
`section-y` spacing plus a `<FlagDivider variant="mark">` under the heading
still does the separating work within a run of same-coloured sections.

Two coloured full-strength bands are the sanctioned exceptions:
- **Page banner** (see Page banners) — the page header only. Rotates across the
  flag-stripe palette: `blue`, `green`, `gold`, `terracotta`.
- **Closing CTA** (`<PageCta>`) — a solid `deep-blue` band with white text and a
  `flag-hairline` top cap. It is the ONE bold accent surface in a page's body
  rhythm. A secondary (ocean-outline) button inside it is auto-flipped to a
  white outline by the component, so call sites don't manage the dark
  background themselves.

Footer `bg-footer-bg text-white`. `footer-bg` (`#0E2129`) is the **darkest
surface on the site** and is deliberately darker than the deep-blue banners /
hero / closing CTA — same flag-blue hue, lower lightness — so the footer reads
as a distinct, heavier anchor rather than repeating the banner colour. It is
still the one dark bookend at the bottom of every page.

### Icons

Lucide React only, 2px stroke. `w-4 h-4` in buttons, `w-5 h-5`/`w-6 h-6`
standalone. Never mix filled and line icons in one context. Interactive icons
need a 44px+ hit area (`tap-target`).

## Layout (LOCKED)

- Container `site-container` (1440px, 16px → 64px gutters)
- Grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Mobile-first — start single column, add breakpoints up
- Tap targets 48px minimum (`.tap-target`)
- No fixed widths, no horizontal scroll, ever
- The desktop nav appears at `lg:` (1024), not `md:`. Eight links plus the auth
  control do not fit at 768px — that combination scrolled the page sideways and
  crushed the logo. The drawer serves everything below 1024.

| Breakpoint | Width | Use |
|-----------|-------|-----|
| default | 0–639 | Mobile, single column |
| `sm:` | 640+ | 2-column grids |
| `md:` | 768+ | 2-col text splits |
| `tabtop:` | 920+ | **`--gutter` 16→64px; `--grid-gap` 24→32px; `--page-y` 24→32px** |
| `lg:` | 1024+ | 3-column grids, **desktop nav appears**; `--section-y` 48→96px, `--block-y` 32→64px, `--stack-y` 24→32px |
| `xl:` | 1280+ | 4-column grids |

`tabtop` is declared in `theme.screens` (not `theme.extend.screens`) so it is
emitted in min-width order. Added via `extend` it would land after `2xl` and
then override `lg:`/`xl:` rules.

## Animation (LOCKED)

Framer Motion or plain CSS transitions. Hover `transition-colors duration-200`.
Image hover `transition-transform duration-300`. Respect
`prefers-reduced-motion` (handled globally in `globals.css`). Keep it subtle —
no bouncing, sliding, or attention-grabbing motion.

## DO NOT

- Add colour values not listed above, or use raw hex in TSX
- Use fonts other than Poppins (headings) and DM Sans (body)
- Use plain Tailwind greys instead of `warm-gray-*` / `sand-*`
- Hand-roll a page title, button, or input when a shared component exists
- Layer padding utilities onto `.btn-*` classes
- Use body text below 16px
- Write a raw length, an arbitrary value (`p-[18px]`), or a 2px half-step
  (`gap-1.5`, `py-2.5`) for spacing — use the scale
- Prefix a semantic spacing token with a breakpoint (`lg:pb-section`)
- Add CSS animation libraries
- Use gradients on text or backgrounds (the ONLY exceptions: the homepage hero's
  flag-palette gradient band — see Page banners — and subtle overlays on hero
  images)
- Add borders heavier than 2px or shadows heavier than `shadow-md`
- Ship `[NEEDS REVIEW]` or other placeholder strings in rendered output
- Add decorative complexity — the crafts and stories lead, not the UI

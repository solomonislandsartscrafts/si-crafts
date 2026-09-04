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
| `.flag-divider` | 6px | Seam at the bottom of the homepage opening block. NOT under the site header — see Page banners |
| `.flag-hairline` | 3px | Caps the top edge of dark bands |
| `.flag-mark` | 4px × 64px | Stub under interior page titles |

`<Logo>` (`src/components/layout/logo.tsx`) is the brand lockup: the SIAC logo
image (`/images/sica logo.png`), which already contains the frangipani mark and
the "Solomon Islands Arts & Crafts" wordmark. Never set text beside it.

- Sized by height with `w-auto` (`h-10 sm:h-11`) so the artwork cannot distort.
- Renders `alt=""` on purpose: it always sits inside a link that carries its own
  `aria-label`, and that label wins over `alt` for the accessible name.
- The artwork is dark ink on transparency, so it disappears on a dark surface.
  `onDark` is the one variant: a `brightness-0 invert` filter that renders the
  mark crisp white, reusing the single PNG rather than shipping a reversed asset.
  The footer uses it; the admin sidebar renders its own white text instead. An
  `onDarkFromLg` variant (white only from `lg` up) existed for the old
  transparent-over-hero header and has been removed with it.

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
| `sm` | 16px | Card padding, tight stacks, grid gutters (mobile) |
| `md` | 24px | Roomier card padding, block internals, grid gutters (desktop) |
| `lg` | 32px | Heading → content (desktop) |
| `xl` | 48px | Section band padding (mobile), page gutter (desktop) |
| `2xl` | 64px | Block separation (desktop) |
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
| `gutter` | 16px | 48px @920 | Page side gutters (via `.site-px`) |
| `page` | 24px | 32px @920 | Whole-page top/bottom padding (via `.page-y`) |
| `section` | 48px | 96px @1024 | Between major page sections (via `.section-y`) |
| `block` | 32px | 64px @1024 | Between blocks inside one section |
| `stack` | 24px | 32px @1024 | Section heading/subtitle → the content below |
| `grid` | 16px | 24px @920 | Card grid gutters, both axes |

The desktop `gutter` is 48px, not 64px. The gutter is pure margin — every pixel
of it comes off the content column, and on an image-led wholesale catalogue that
column IS the product photography. 64px on the 1440px canvas left the grids
noticeably narrower than they needed to be. 48px is still three rungs above the
16px mobile gutter, so the page never reads as edge-to-edge.

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
4. **`grid`** (16 → 24) between cards in a grid — the smallest structural gap,
   and a clear rung below `stack`. That gap between rungs 3 and 4 is
   load-bearing. The two used to be equal (24 → 32 each), which meant the space
   under a section heading was exactly the space between two cards: nothing
   marked where the heading ended and the grid began, and a row of tiles read as
   separate objects rather than one block of imagery. Roughly 1:2 between the
   grid gutter and the heading gap is what makes a grid cohere under its
   heading. If you widen `grid`, widen `stack` with it.
5. **`2xs`** (8px) between a heading and its own subtitle, an icon and its label,
   or any other pair that has to read as one unit.

Heading pattern, and it is not optional: a section heading sits **8px** above its
subtitle (`mb-2xs` — one tight group) and the pair then takes a **`mb-stack`**
step down to the content grid. If a heading has no subtitle it still takes
`mb-stack` to its content.

### Internal ≤ external

Padding inside a component is never larger than the gap separating it from its
neighbours. Card padding is `sm` (16) or `md` (24) against a `grid` gutter of
16 → 24. Check this whenever you add a card or panel variant.

Note the margin here is now zero rather than comfortable: `sm` padding EQUALS the
gutter at both breakpoints, and `md` padding exceeds the mobile gutter. So `p-md`
is no longer safe on a panel that sits inside a card grid. Poster cards have no
panel padding at all — their only internal spacing is the 12px frame → caption —
so this only bites if you add a padded panel variant to a grid. `p-md` remains
correct everywhere else (note boxes, admin panels, standalone panels).

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
96px of side padding would cost real column width. Same scale, one rung lower.

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
### Homepage section order

Fixed, and each position is load-bearing. Do not reorder without re-reading why:

| # | Section | Surface |
|---|---------|---------|
| 1 | Hero (+ `<FlagDivider>` closing it) | white |
| 2 | **Who we are** — the mission statement | warm band |
| 3 | Meet the makers (carousel) | white |
| 4 | Featured products (+ pricing note) | warm band |
| 5 | Wholesale CTA (`<PageCta>`) | deep-blue |
| 6 | Latest news | white |
| 7 | Supporters (`<SponsorBanner>`) | white, `border-y` |

- **Position 2 is the mission statement, not the supporters band.** A first-time
  visitor needs to be told what SIAC is — a volunteer-run wholesale supplier to
  Australian museum and gallery shops — before anything else makes sense. The
  supporters band used to hold this slot and, with one logo in it, read as an
  unfinished placeholder in the most valuable position on the page.
- **The mission statement has no section label.** The statement IS the heading, so
  there is no title to read past — the move Bilum & Bilas uses. It is still a real
  `<h2>` so the site's self-description is reachable by heading navigation.
- **The products grid is followed by a pricing note**
  (`homepage.productsPricingNote`). A visitor who has just scrolled a grid of
  unpriced products cannot tell whether the site is broken, sold out, or not
  selling to them. Wholesale-only is a business rule; the page has to say so.
  Clearing the CMS field hides the note.
- **Supporters go last, above the footer**, where a credit belongs alongside the
  footer's other institutional detail. The band renders `null` with no
  supporters, so the page ends on news.

### The hero

- **The homepage hero is WHITE, and it is not a `<PageHeader>`.** It has its own
  split layout (text left, image gallery right) in `src/app/page.tsx`, and its
  `<section>` is plain `bg-white`. This makes the homepage the least-branded page
  on the site, since every interior page opens with a full coloured banner — a
  deliberate editorial choice, but keep it in mind when judging the page. The
  brand cues in the opening block are the `<FlagDivider variant="mark">` under
  the eyebrow (the same stub used under every section heading below) and the
  `<FlagDivider>` capping the bottom of the block.
- **The hero eyebrow leads with what the business IS**
  (`homepageHeading`, default "Wholesale Solomon Islands handicrafts"). It used to
  default to "Meet the Makers Behind Every Piece", which said almost exactly what
  the "Meet the makers" section heading one screen below says. That line now
  belongs to the makers section alone.
- **Two homepage CMS field names read backwards from where they render.**
  `homepageHeading` is the hero EYEBROW; `homepageMakersHeading` is the hero H1
  and has nothing to do with the makers section (which uses the
  `homepage.makersHeading` site-text key). The admin form labels them correctly,
  so an editor is not misled — only the code reads oddly. Both are Django
  columns, so renaming needs a migration.

  Because the surface is light, everything on it takes its light-background
  treatment, and these go together — changing one alone is a contrast bug:
  `text-deep-blue` heading and eyebrow, `<HeroSlideshow tone="light">`,
  `<HeroCodeToggle tone="light">`, and a plain `.btn-primary` for the "Browse
  Catalogue" CTA (green on white has no fill collision, so no override).

  **History, so the old rationale is not reintroduced piecemeal.** The hero used
  to be a multi-stop gradient blending the flag palette (deep-blue → ocean →
  brand-green → accent-gold) set inline as `backgroundImage`, with white text, an
  aria-hidden deep-blue scrim protecting the text region, a `waves` motif, a gold
  primary CTA (because `.btn-primary`'s green fill vanished into the green band),
  a white-outline secondary, `tone="dark"` on the slideshow and code toggle, and
  `<PieceLookup tone="dark">` swapping its GO button to `bg-ocean`. None of that
  is in the code now. If a coloured hero is restored, all of those pieces have to
  come back together.

  There is currently **no background gradient anywhere on the site.** The DO NOT
  list's gradient exception exists for a hero band; nothing is using it.
- **The slideshow is hidden below `lg`** (`hidden lg:block` on its wrapper in
  `page.tsx`) and appears only when the hero splits into two columns. On a phone
  the hero is the heading, intro, buttons and code lookup alone; the makers and
  the products each have their own section directly below, so nothing is lost.
  Two reasons: the gallery plus caption is the tallest thing in the hero, so on a
  phone it pushes the flag stripe and the supporters band out of the opening
  screen; and it is the only part of the hero that requests images, so dropping
  it saves a phone every hero image before first paint. The visibility decision
  lives on the wrapper, not inside `<HeroSlideshow>`, which stays
  layout-agnostic.
- **Opening-block layout.** The hero, the flag stripe, and the "Supported by"
  (`<SponsorBanner>`) row are wrapped in one `flex flex-col` block so they read
  as one unit. That block sizes to its CONTENT and does **not** stretch to fill
  the viewport. An earlier version made it `min-h-screen min-h-[100svh]` with the
  hero `flex-1` to "push the sponsor row to the bottom", but the hero content is
  far shorter than a desktop viewport, so filling 100vh pushed the sponsor row to
  the very bottom edge — below the fold, the exact problem it was meant to solve.
  Do not reintroduce a forced viewport height here.

  The hero grid is `pt-block` / `pb-lg lg:pb-xl` — bottom deliberately one rung
  shorter than top, because what follows is the flag stripe and the supporters
  band, not a new section, so they sit tight under the hero rather than a full
  section break away. `lg:items-start` aligns the text and gallery columns on a
  shared top edge; centring left the heading floating below the top of the taller
  gallery column.

  If the supporters list is empty, `<SponsorBanner>` renders `null` and the block
  simply ends at the flag stripe — a graceful, gap-free degradation. Note that
  with only one or two supporters the band sits very high on the page for what it
  says; `<SponsorBanner>` softens this by dropping to a modest inline credit line
  below three logos, but moving it nearer the footer is the better fix if the list
  stays short.
- `<HeroSlideshow>` is a **centre-stage carousel**: one large frame in the middle
  with the previous and next slides peeking in either side, scaled down and
  dimmed, so the hero shows at a glance that it holds more than one piece. Every
  frame is `bg-card-bg shadow-card` and square (`frameAspect = 'aspect-square'`),
  matching the card frames elsewhere. The geometry lives in constants at the top
  of the file — `trackWidth`, `frameWidth`, `frameAspect`, `PEEK_STEP` (in units
  of one frame's own width) and `PEEK_SCALE`. **Treat the file as the source of
  truth for these values, not this doc** — they are an art-directed choice that
  has been retuned more than once. Tune the look there, never at a call site. Two
  things follow from that geometry and are load-bearing:
  - **`frameWidth` is one share at EVERY width — no breakpoint.** The component
    is width-agnostic, so the peek reads the same at whatever size it is
    rendered. (On the
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
  caption follows `tone`: ink-on-white (`text-deep-blue` title, `text-ocean`
  eyebrow) at the `light` tone, which is what the homepage passes now that the
  hero is white; `dark` gives light text for a dark surface but nothing uses it
  today. The caption row is
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
- **The header is solid on every route, including the homepage** —
  `sticky top-0 border-b border-sand bg-cream/95 backdrop-blur-sm`, with the
  dark-ink `<Logo>` at every width. `<Header>` takes no props.

  It used to take a `transparentOverHero` prop, set from `LayoutShell` on `/`:
  the bar started transparent with white nav content over the coloured hero band
  and flipped to solid once `window.scrollY` passed ~64px, desktop-only, with
  `LayoutShell` pulling the hero up under it via `-mt-20` and the hero adding
  `pt-20` back. That is all removed — the hero is white, so there is no dark band
  to float over and white nav content would be invisible. The prop had gone
  unused for a while, leaving ~10 unreachable style branches and a scroll listener
  that could never fire. The `<Logo onDarkFromLg>` variant that served it is gone
  too; only `onDark` remains, used by the footer. Recover from git history rather
  than rebuilding if a coloured hero returns.

  On the homepage the flag divider does NOT sit under the header — it caps the
  BOTTOM edge of the opening block, as the seam between the hero and the
  "Supported by" row (`<FlagDivider>` rendered in `page.tsx`). On a white hero
  that stripe is the main piece of brand colour in the opening block. No route
  has a flag stripe under the header (see below).

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
| `FRAME_ASPECT` | `aspect-square` | products, crafts — the house shape |
| `MAKER_ASPECT` | `aspect-square` | makers |
| `ARTICLE_ASPECT` | `aspect-video` (16:9) | news |

**Products, makers and crafts share the square; news is 16:9 landscape.** One
shape across products, makers and crafts means those grids share a rhythm and a
page holding two of those kinds does not change card language halfway down. News
is the deliberate exception: a landscape thumbnail over a date + headline +
standfirst is the shape every news list uses, so a row of news cards reads as an
article list rather than a product grid. This is the divergence the three
separate NAMES were kept for — a call site reads as `aspect={MAKER_ASPECT}` and
one subject can be given its own shape by editing one line in `poster-card.tsx`,
which is exactly what news now does.

Products, makers and crafts used to differ too — `3/4` products, `4/5` makers,
`3/2` landscape news — before being unified. If you are reintroducing a distinct
shape for one of those subjects, that is the history. News now carries a landscape
ratio again AND the caption that distinguishes it (date kicker, headline at
`posterHeadlineClasses`, three-line standfirst) — the two together are what make
it read as news. When a story has no cover image, `ArticleCard` /
`FeaturedArticleCard` pass a branded deep-blue `fallback` to `PosterFrame` (a
`Newspaper` glyph + the first tag) instead of the generic grey `SafeImage` well.

Pass one of these or nothing. A free-form ratio per caller is how a grid loses
its rhythm. Crafts used to be `aspect-square` inside a hand-rolled panel card, so
`/crafts-and-techniques` changed card language mid-visit — the shared frame
replaced that.

**Grids.** Import the shared recipe; never retype a column ramp.

| Recipe | Ramp | Use |
|--------|------|-----|
| `posterGridClasses` | 1 → 2 at `sm` → 3 at `lg` → 4 at `xl` | full listings — catalogue, makers, crafts |
| `featuredPosterGridClasses` | 1 → 2 at `sm` → 3 at `lg` | the homepage showcase — same ramp, capped at 3 |
| `articleGridClasses` | 1 → 2 at `sm` → 3 at `lg` | news listings |
| `centeredArticleGridClasses` | 1 → 2 at `sm`, centred, `max-w-3xl` | a news list too short to fill a row |

One column on a phone, not two: a full-width square gives each piece real
presence, which is the editorial look the site is after. Density returns as the
screen widens.

`featuredPosterGridClasses` is homepage-only and differs from
`posterGridClasses` **only at `xl`**. The catalogue wants density; the homepage is
a showcase, where four small tiles read as an index and three larger ones read as
"here are a few pieces worth looking at". Because only the ceiling differs, the
two still sit in the same rhythm on a page showing both. Pair it with a count that
fills the row — the homepage shows 3 featured products, so there is no lone tile
on a second row.

Use `centeredArticleGridClasses` whenever the list is short: fewer than 3 stories
on the homepage, or a `/news` page with no featured lead card. A 3-up grid holding
one or two cards leaves an empty column and the row hugs the left edge.

**Hover — two signals, both required.**
`group-hover:scale-105 transition-transform duration-300` on the image, and
`group-hover:text-ocean` on the title (already baked into `posterTitleClasses`
and `posterHeadlineClasses`). Shadow alone is not enough: `shadow-card` is
`0 2px 8px rgba(0,0,0,0.06)` and hover is `shadow-md`, which on a white card on a
white page is a few percent of opacity — a change you have to look for. Hover must
ADD shadow, never remove it.

**No "View" overlay on the frame — and do not reintroduce one.** The two hover
signals above are the whole affordance. `PosterFrame` used to add a third, a
`deep-blue` "View" label on the image, and it went through three versions: a
full-bleed `bg-deep-blue/30` veil with the label centred, then a full-width bar
inset at the bottom of the frame, then a small pill in the bottom-left corner.
Shrinking it never fixed it, because the problem was not its size — it was that
opaque chrome sat on top of the photograph. On a wholesale catalogue the
photograph IS the product information (weave, finish, grain, colour), and on a
`contain`-fit shot the object floats mid-frame so there is no reliably empty
corner to tuck a label into. It was redundant on top of that: the card is a
link, the title already turns `ocean`, and the image already scales — two
signals that cost no image area, against a third that cost real ones.

If a card genuinely needs a control, it goes BELOW the frame in the caption,
the way `StockistProductCard` puts its Add to Order controls there.

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

It is now the **only** thing drawn over the photograph, so it is kept as tight as
its label allows: `px-xs` (12) not `px-sm`, `text-xs`, and no `shadow-card` (the
shadow was invisible against a dark fill and only made the chip's footprint read
larger than it is). It earns the space because material category and article tag
are content a buyer scans. Do not add anything else on top of the image.

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

### The catalogue filter rail

`/catalogue` puts its controls in a 260px left rail
(`lg:grid-cols-[260px_1fr] gap-block`), sticky at `lg:top-24`, hidden behind a
"Filters" toggle below `lg`. Four rules, each of which replaced the opposite:

- **Filters narrow; sort does not. Keep them apart.** The rail holds Search,
  Material and Maker — three controls that all answer "show me fewer things".
  **Sort sits beside the result count above the grid**, because it reorders
  results rather than narrowing them, and that is where the visitor is already
  looking when the count changes.
- **Search first, then Material, then Maker.** Search is the shortest path for a
  visitor who knows what they want (a product type, a product code). It used to
  sit third, below a six-item material list.
- **No panel around the rail.** It was a `bg-warm-gray-100` box with a
  `border-sand` outline and `p-md`. On a white page a near-white fill adds weight
  without adding separation — the same conclusion the poster card reached about
  its caption. `gap-block` already separates rail from grid. Do not re-box it.
- **Rail controls are all full width**, so their left and right edges line up.
  `<Select>` shrinks to its label from `sm` up by default, so a select in a rail
  needs `fullWidth` (the same prop `SearchInput` has). Passing `w-full` via
  `className` does NOT work — Tailwind emits `sm:w-auto` after the base
  utilities, so the responsive variant wins.

The material list is `<CategoryFilter>`
(`components/catalogue/category-filter.tsx`) — a plain vertical list of text
options, active state `brand-green` + semibold, no pill chrome. A single-select
filter in a rail is a list. Options are `text-base`: they are content a visitor
reads and chooses between, so they sit on the 16px floor. Only the small caps
field labels above each control are `text-xs`.

### Long-form articles

The news article page (`src/app/news/[slug]/page.tsx`) has an editorial reading
treatment that no other page uses. The body itself is admin-authored HTML
injected into a `.article-content` container, so its rules live in `globals.css`
(the `.article-content` block), NOT in a component — that CSS is the source of
truth for body styling. The parts:

- **Measure (line length).** Body prose (`p`, `ul`, `ol`, `blockquote`, `h2`,
  `h3` inside `.article-content`) is capped at `68ch` — the readable band, ~68
  characters — while the article column stays `max-w-3xl` (720px) so figures and
  images break wider than the text and read as a deliberate change. Text stays
  left-aligned; only the right edge pulls in. `ch`, not `px`, so the cap tracks
  the reader's font size. Do not remove the cap to "use the full width" — an
  over-long measure is the change that hurts readability most.
- **Lead paragraph.** The first paragraph (`> p:first-of-type`, so it survives an
  opening image or heading) is set one step up at 20px/1.6 — the editorial
  standfirst treatment. `first-of-type`, never `first-child`.
- **Drop cap.** The first letter of that opening paragraph
  (`> p:first-of-type::first-letter`) is enlarged in `deep-blue` Poppins (the
  heading colour and face, so it reads as a typographic mark, not an oversized
  body letter). `initial-letter: 3` sinks it three lines on Safari/Chrome; a
  `float` + `font-size` fallback approximates it on Firefox, and an
  `@supports (initial-letter)` block turns the fallback OFF where the real
  property works so the two never fight. It fires only on the very first
  paragraph. This is the one decorative typographic flourish on the site — do
  not extend the drop cap to other pages or to mid-article paragraphs.
- **Pull quote.** `.article-content blockquote` is a rest point set at the lead
  size (20px) with the `brand-green` left rule and `deep-blue` text — not small
  italic. Italic is deliberately dropped (hard to read in long runs; the size
  already sets it apart).
- **Standfirst / dek.** An optional `Article.standfirst` field, rendered between
  the h1 and the byline via `<CmsText>` at `text-lg leading-body-lg
  text-warm-gray-600`. It is a real data field wired end to end (frontend type +
  service, backend model/serializer/API/write-view, admin editor). It renders
  only when non-empty. Distinct from `excerpt`, which is the card summary and the
  meta description — do not conflate the two.
- **"Keep reading" block.** The article foot carries up to three related stories
  as `<ArticleCard>`s in `articleGridClasses`, ranked by shared tags with a
  recency fallback. Reuses the shared card so it cannot drift from the /news
  index; wrap it in `role="list"` like every other card grid.

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
is as flat as a page of solid white. Warm and white take turns, so the warm
surface reads as a change rather than the default. The homepage runs white hero →
warm "Who we are" → white Makers → warm Products → deep-blue CTA → white News →
supporters, which alternates the whole way down rather than dropping a single warm
band into a white page.
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

- Container `site-container` (1440px, 16px → 48px gutters)
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
| `tabtop:` | 920+ | **`--gutter` 16→48px; `--grid-gap` 16→24px; `--page-y` 24→32px** |
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
- Use gradients on text or backgrounds. The one sanctioned exception is the
  `<PageHeader banner>` band, whose four variants are each a soft radial bloom
  over a diagonal linear wash (`BANNER_GRADIENT` in `page-header.tsx`). The
  homepage hero used to be the other exception; it is plain `bg-white` now, so
  there is no background gradient outside the page banners
- Add borders heavier than 2px or shadows heavier than `shadow-md`
- Ship `[NEEDS REVIEW]` or other placeholder strings in rendered output
- Add decorative complexity — the crafts and stories lead, not the UI

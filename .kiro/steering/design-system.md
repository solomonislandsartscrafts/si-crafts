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
| `crest-red` | `#C0392B` | Error states only |
| `cream` / `page-bg` | `#FFFFFF` | Page background |
| `card-bg` | `#FFFFFF` | Card backgrounds |
| `footer-bg` | `#1B3A4B` | Footer (same as deep-blue) |
| `footer-text` | `#FFFFFF` | Footer primary text |
| `footer-muted` | `#CBD5DC` | Footer secondary text |
| `sand-light` | `#F0F0F0` | Section backgrounds, note boxes (**not** card image wells) |
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
- There are no `terracotta`, `teal`, or `motto-gold` tokens. They were legacy
  aliases that pointed at green/blue/gold and were removed because the names
  lied about the colour.
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
| Page title (h1) | Always via `<PageHeader>`. Never hand-rolled. |
| Section heading (h2) | `font-heading text-2xl md:text-3xl font-medium text-deep-blue` |
| Card/subsection (h3) | `font-heading text-lg font-semibold text-deep-blue` |
| Small card title (h3) | `font-heading text-base font-semibold text-deep-blue` |
| Body | `text-base leading-body` (inherited — no class needed) |
| Secondary | `text-sm text-warm-gray-600` |
| Tiny label | `text-xs text-warm-gray-400` |
| Code / product codes | `font-mono font-bold` |

Rules:
- Headings always `font-heading`; body always inherits `font-body`.
- Heading colour is `deep-blue`; body colour is `warm-gray-800`.
- Poppins reads heavier than a serif — use Medium (500) for h1/h2, Semibold
  (600) for h3. Avoid Bold (700) for headings.
- `leading-body` (1.6) minimum on body copy.
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

The scale is a stepped ladder on a 5px base, with **920px (`tabtop:`)** as the
breakpoint where the layout opens up. Values step at breakpoints rather than
scaling fluidly with `vw` — a fixed ladder produces the same measurement on
every device at a given width, which makes layouts predictable to reason about.

**The ladder: 10 · 15 · 20 · 25 · 30 · 40 · 70 px**

Structural spacing (gutters, page rhythm, container) uses the ladder exactly.
Spacing *inside* a component snaps to Tailwind's own 4px scale (so 15px → `4`,
30px → `8`), which keeps one spacing scale in the project instead of two
competing ones. Where the two disagree by 1–2px, prefer the Tailwind token.

### Vertical rhythm — utilities in `globals.css`

| Class | Value | Use |
|-------|-------|-----|
| `.page-y` | 20px → 40px @920 | Top/bottom padding for a whole page |
| `.section-y` | 40px → 80px @1024 | Padding for a band within a page |

Both live in the `components` layer, so **any Tailwind `py-*`/`pt-*`/`pb-*` on
the same element silently overrides them.** That is used deliberately (e.g.
`<PageHeader>` tightens its own bottom padding to `pb-5`), but it also means
adding `py-*` to a `.page-y` element cancels the rhythm.

### Horizontal — the container

| Class | Value | Use |
|-------|-------|-----|
| `.site-px` | 20px → 70px @920 | Page gutters, nothing else |
| `.site-container` | `.site-px` + `max-width:1440px` + centred | The standard page container |

**Use `.site-container`. Never hand-roll a page container.** Every container on
a page must resolve to the same gutter, or the left edge of the content visibly
steps in and out as you scroll — the most common way to break this layout. A
page header at one gutter above a body at another is a bug, not a style choice.

For a narrower single-column page, pair the width utility with the gutter
utility: `max-w-2xl mx-auto site-px`. Never `max-w-2xl mx-auto px-4`.

To break a child out of the gutter (full-bleed carousel, edge-to-edge media),
use the matching negative margin: `-mx-page-x tabtop:-mx-page-x-lg`.

| Context | Class |
|---------|-------|
| Page container | `site-container` |
| Max content width (bare) | `max-w-site` (1440px) |
| Card grid gutters | `gap-x-8 gap-y-5` (30px col / 20px row) |
| Dense grid gutters | `gap-5` (20px) |
| Two-column text split | `gap-10` (40px) |
| Page block bottom | `pb-10 lg:pb-20` (40 → 80px) |
| Card padding | `p-4` (15px-equivalent) or `p-5` (20px) |
| Card caption inset | `px-5 py-4` |
| Prose column | `max-w-2xl` (intro), `max-w-3xl` (article body) |

Every page container is `site-container`. Do not introduce `max-w-7xl` or
`max-w-4xl` page containers — `max-w-7xl` was the old 1280px container and no
longer appears in the codebase.

**Admin is deliberately exempt from the 70px gutter.** Admin surfaces use
`p-5 tabtop:p-8` instead: it is dense tabular data, and 140px of side padding
would cost real column width.

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

### Cards

- Background `bg-card-bg`, shadow `shadow-card`, hover `hover:shadow-md`
- Radius `rounded-lg`, focus `focus:outline-none focus:ring-2 focus:ring-ocean`
- Image aspect: `aspect-square` (products), `aspect-[4/3]` (makers),
  `aspect-[3/2]` (articles), `aspect-[16/9]` (crafts)
- Image hover `group-hover:scale-105 transition-transform duration-300`
- **Image wells are `bg-card-bg` (white), never `bg-sand-light`, and carry no
  padding.** Product and craft photos arrive at mixed aspect ratios, so
  `object-contain` always leaves empty space inside the fixed aspect box. On a
  grey well that space reads as a frame drawn around every photo, and the frame
  is thicker the further the photo is from square — so the grid looks unevenly
  ruled. White makes it disappear into the card.
- Keep `object-contain` for products and crafts. `object-cover` would remove the
  empty space entirely but crops, and it crops the edges — handles, spouts, weave
  borders — which is exactly what a wholesale buyer is assessing. Use
  `object-cover` only where the subject is central and the crop is safe (maker
  portraits, article headers).
- Hover must ADD shadow, never remove it
- The whole card is one `<Link>` — not just the title

### Buttons

Defined once in `globals.css` and wrapped by `<Button>`:

- `.btn-primary` — green fill, the main action on a page
- `.btn-secondary` — ocean outline, subtle hover, never a fill-swap
- `.btn-danger` — red fill, always paired with a confirmation
- `.btn-admin` — deep-blue fill, admin surfaces only

These classes set their own padding. Never layer `px-*`/`py-*` on top of them.
Never hand-roll a button out of raw Tailwind.

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

Alternate at most two: transparent (default) and `bg-sand-light`. Accent band
`bg-ocean/5 border-t border-ocean/10`. Footer `bg-footer-bg text-white`.

### Icons

Lucide React only, 2px stroke. `w-4 h-4` in buttons, `w-5 h-5`/`w-6 h-6`
standalone. Never mix filled and line icons in one context. Interactive icons
need a 44px+ hit area (`tap-target`).

## Layout (LOCKED)

- Container `site-container` (1440px, 20px → 70px gutters)
- Grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Mobile-first — start single column, add breakpoints up
- Tap targets 48px minimum (`.tap-target`)
- No fixed widths, no horizontal scroll, ever

| Breakpoint | Width | Use |
|-----------|-------|-----|
| default | 0–639 | Mobile, single column |
| `sm:` | 640+ | 2-column grids |
| `md:` | 768+ | Desktop nav appears, 2-col text |
| `tabtop:` | 920+ | **Gutters widen 20→70px; grid gutter 20→30px** |
| `lg:` | 1024+ | 3-column grids, full wordmark, `.section-y` reaches 80px |
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
- Add CSS animation libraries
- Use gradients on text or backgrounds (exception: subtle overlays on hero images)
- Add borders heavier than 2px or shadows heavier than `shadow-md`
- Ship `[NEEDS REVIEW]` or other placeholder strings in rendered output
- Add decorative complexity — the crafts and stories lead, not the UI

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
| `sand-light` | `#F0F0F0` | Section backgrounds, image wells, note boxes |
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

Vertical rhythm uses the fluid utilities in `globals.css`, not fixed tokens:

| Class | Value | Use |
|-------|-------|-----|
| `.page-y` | 24px → 64px | Top/bottom padding for a whole page |
| `.section-y` | 32px → 80px | Padding for a band within a page |

| Context | Class |
|---------|-------|
| Horizontal page padding | `px-4 sm:px-6 lg:px-8` |
| Max content width | `max-w-7xl mx-auto` |
| Grid gutters | `gap-6` (cards), `gap-4` (dense grids) |
| Card padding | `p-4` or `p-6` |
| Prose column | `max-w-2xl` (intro), `max-w-3xl` (article body) |

Every page uses `max-w-7xl`. Do not introduce `max-w-4xl` page containers.

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

- Container `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Mobile-first — start single column, add breakpoints up
- Tap targets 48px minimum (`.tap-target`)
- No fixed widths, no horizontal scroll, ever

| Breakpoint | Width | Use |
|-----------|-------|-----|
| default | 0–639 | Mobile, single column |
| `sm:` | 640+ | 2-column grids |
| `md:` | 768+ | Desktop nav appears, 2-col text |
| `lg:` | 1024+ | 3-column grids, full wordmark |
| `xl:` | 1280+ | 4-column grids |

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

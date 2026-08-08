# SI Crafts — Design System (STRICT — Do Not Deviate)

This document defines the exact design system for the SI Crafts website. All new features, pages, and components MUST follow these standards precisely. Do NOT introduce new colours, fonts, spacing values, or component patterns outside of what is defined here.

## Colours (LOCKED — no additions or changes)

| Token | Hex | Usage |
|-------|-----|-------|
| `deep-blue` | `#1B3A4B` | Headings, primary text, footer background, admin sidebar |
| `ocean` | `#2E7D8C` | Links, interactive accents, focus rings, active states |
| `ocean-light` | `#5B9EAF` | Focus ring offset, secondary interactive |
| `ocean-dark` | `#1A5C6A` | Hover state for ocean elements |
| `terracotta` | `#C06A3A` | Primary CTA buttons, accent bars, warm highlights |
| `terracotta-light` | `#D4845A` | Hover state for terracotta |
| `terracotta-dark` | `#9C4F28` | Active/pressed state for terracotta |
| `sand-light` | `#F5F0E8` | Light backgrounds, card hover states, section backgrounds |
| `sand` | `#E8DFD0` | Borders, dividers, image placeholders |
| `sand-dark` | `#C4B8A5` | Input borders, subtle separators |
| `cream` / `page-bg` | `#FFFDF8` | Page background (warm off-white) |
| `card-bg` | `#FFFFFF` | Card backgrounds |
| `footer-bg` | `#1B3A4B` | Footer (same as deep-blue) |
| `warm-gray-100` | `#F7F5F2` | Lightest neutral background |
| `warm-gray-200` | `#EDE9E3` | Light neutral background |
| `warm-gray-400` | `#B8AFA3` | Placeholder text, muted labels |
| `warm-gray-600` | `#7A7067` | Secondary body text |
| `warm-gray-800` | `#4A433B` | Primary body text |
| `success` | `#2D7A4F` | Success states, approved badges |
| `warning` | `#C4882A` | GST warnings, pending badges |
| `error` | `#B83A3A` | Error messages, validation errors |

**RULE:** Never use raw hex values inline. Always reference token names via Tailwind classes (e.g. `text-deep-blue`, `bg-sand-light`, `border-ocean`).

## Typography (LOCKED)

| Element | Font | Size | Weight | Line-height | Class |
|---------|------|------|--------|-------------|-------|
| Page title (h1) | Fraunces | 2.25–3rem | Medium (500) | 1.2 | `font-heading text-3xl md:text-4xl font-medium` |
| Section heading (h2) | Fraunces | 1.5–1.875rem | Medium (500) | 1.2 | `font-heading text-2xl md:text-3xl font-medium` |
| Card/subsection heading (h3) | Fraunces | 1–1.25rem | Semibold (600) | 1.2 | `font-heading text-sm font-semibold` or `text-lg font-semibold` |
| Body text | Inter | 1rem | Normal (400) | 1.6 | `text-base leading-body` |
| Small/secondary text | Inter | 0.875rem | Normal (400) | 1.6 | `text-sm text-warm-gray-600` |
| Tiny labels | Inter | 0.75rem | Normal (400) | 1.6 | `text-xs text-warm-gray-400` |
| Monospace (codes) | System mono | 0.875rem | Bold (700) | — | `font-mono font-bold` |

**RULES:**
- Headings ALWAYS use `font-heading` (Fraunces)
- Body text ALWAYS uses `font-body` (Inter) — this is the default, no class needed
- Body text colour is `warm-gray-800` (`#4A433B`)
- Heading colour is `deep-blue` (`#1B3A4B`)
- Never use decorative or display fonts beyond Fraunces
- Minimum body font size: 16px (1rem)
- Line-height for body: 1.6 minimum
- Fraunces reads heavier than most serifs — use Medium (500) for h1/h2, not Bold (700)

## Spacing (LOCKED)

| Context | Value | Class |
|---------|-------|-------|
| Between content sections | 24px min | `py-section-lg` (48px) or `mb-section` (24px) |
| Card internal padding | 16px | `p-4` |
| Section internal padding | 16–32px | `px-4 sm:px-6 lg:px-8` |
| Gap between grid items | 24px | `gap-6` |
| Max content width | 80rem (1280px) | `max-w-7xl mx-auto` |

## Component Patterns (LOCKED)

### Cards
- Background: `bg-card-bg` (white)
- Shadow: `shadow-card` (subtle)
- Hover: `hover:shadow-md`
- Border radius: `rounded-lg`
- Image aspect: `aspect-square` (products) or `aspect-[3/4]` (makers) or `aspect-[16/9]` (crafts)
- Focus: `focus:outline-none focus:ring-2 focus:ring-ocean`
- Image hover: `group-hover:scale-105 transition-transform duration-300`

### Buttons — Primary
```
className="tap-target inline-flex items-center gap-2 px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta-light"
```

### Buttons — Secondary
```
className="tap-target inline-flex items-center gap-2 px-6 py-3 border-2 border-ocean text-ocean hover:bg-ocean hover:text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light"
```

### Buttons — Subtle/Text Link
```
className="text-sm font-medium text-ocean hover:text-ocean-dark transition-colors"
```

### Form Inputs
```
className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
```

### Error Messages
```
className="text-sm text-error mt-1" aria-live="assertive"
```

### Status Badges
- Approved/Success: `bg-success/10 text-success`
- Pending/Warning: `bg-warning/10 text-warning`
- Error/Rejected: `bg-error/10 text-error`
- Ocean/Info: `bg-ocean/10 text-ocean`

### Section Backgrounds
- Default: transparent (page-bg shows through)
- Alternate: `bg-sand-light`
- Accent: `bg-ocean/5 border-t border-ocean/10`
- Footer: `bg-footer-bg text-white`

### Icons
- Library: Lucide React ONLY
- Size in buttons: `w-4 h-4`
- Size standalone: `w-5 h-5` or `w-6 h-6`
- Colour: inherit from text or use `text-ocean` / `text-terracotta`
- Minimum touch size when interactive: 44×44px (`tap-target` class)

## Layout Rules (LOCKED)

- Max width container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Grid: use Tailwind grid, typically `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Mobile-first: always start with single column, add breakpoints up
- No fixed widths that cause overflow
- No horizontal scroll ever
- Tap targets: minimum 44×44px on all interactive elements

## Responsive Breakpoints

| Breakpoint | Width | Usage |
|-----------|-------|-------|
| Default | 0–639px | Mobile single column |
| `sm:` | 640px+ | 2-column grids |
| `md:` | 768px+ | Desktop nav visible, 2-col text layouts |
| `lg:` | 1024px+ | 3-column grids |
| `xl:` | 1280px+ | 4-column grids, max content width |

## Animation (LOCKED)

- Library: Framer Motion ONLY (or CSS transitions for simple hover states)
- Hover transitions: `transition-colors duration-200` or `transition-shadow`
- Image hover: `transition-transform duration-300`
- Respect `prefers-reduced-motion`
- Keep animations subtle — no bouncing, sliding, or attention-grabbing motion

## DO NOT

- Introduce new colour values not listed above
- Use fonts other than Inter (body) and Fraunces (headings)
- Add new CSS animation libraries
- Use inline styles for colours or fonts
- Create components that don't follow the card/button/input patterns above
- Use raw hex values — always use Tailwind token classes
- Add decorative complexity — the crafts and stories lead, not the UI
- Use gradients on text or backgrounds (exception: subtle gradient overlays on hero images)
- Add borders heavier than 2px
- Use shadows heavier than `shadow-md`

# SI Crafts — KISS + Responsive Principles (Non-Negotiable)

These principles apply to EVERY phase, EVERY component, EVERY decision.

## KISS — Keep It Simple

- **Simplest solution wins** — favour the simplest approach that meets the requirement.
- **Plain, readable code** — no clever abstractions, no "just in case" complexity.
- **Minimal dependencies** — if Next.js/React/Tailwind can do it, don't add a library.
- **Small, single-purpose components** — one job per component, clear names, minimal props.
- **No premature optimisation** — get it working simply first.
- **No feature creep** — do NOT add features, pages, or libraries beyond what the current phase asks for.
- **When in doubt, choose simpler** — and state the trade-off.

## Responsive on All Devices

- **Mobile-first** — design for small screens (~320 px) first, then enhance with Tailwind breakpoints (`sm:`, `md:`, `lg:`, `xl:`).
- **Fluid layouts** — use grid/flex that reflows naturally. Never fixed widths that overflow.
- **Tap targets ≥ 44 px** — all interactive elements must be comfortably tappable.
- **Readable typography** — text must be legible without zooming on any device.
- **No horizontal scroll** — ever, on any viewport.
- **Responsive images** — use `next/image` with appropriate sizing.
- **Test at three widths** — mobile (~375 px), tablet (~768 px), desktop (~1280 px) before marking a phase complete.
- **Provenance pages mobile-first by default** — `/piece/*` pages are designed primarily for phone scanning.

# SI Crafts — Tech Stack & Build Rules

## Stack (mandatory — do not substitute)
| Layer | Technology |
|-------|-----------|
| Frontend framework | Next.js (App Router, TypeScript, Turbopack) + React |
| Styling | Tailwind CSS |
| Components | shadcn/ui + Radix UI primitives |
| Icons | Lucide |
| Animation | Framer Motion (subtle transitions); optional Animate.css for simple entrances |
| CMS (future) | Wagtail (Django, Python) — headless, REST API only |
| Delivery | Cloudflare Pages (Next.js front end) |
| Extras | PWA (installable, offline shell), Open Graph tags, Priority Hints |

## Critical Build Rules
1. **Mock data first** — build the ENTIRE site on dummy/mock data. Do NOT connect Wagtail or any real API, payment gateway, or database until Phase 9.
2. **Separated mock layer** — all mock data lives in `/src/data/mock/*.ts` with TypeScript types so it can be swapped later by changing one service file.
3. **Service/repository pattern** — pages call functions like `getProducts()`, `getMaker(slug)`. These read from mock data now and will later call the Wagtail REST API. Pages and components must NOT know where data comes from.
4. **Phase-by-phase** — build in the numbered phases. After each phase, stop, summarise, provide run/test instructions, and wait for approval.
5. **No public pricing** — wholesale pricing and ordering visible ONLY to logged-in stockists. No retail pricing anywhere on the open site.
6. **KISS** — simplest solution that meets the requirement. Prefer plain, readable code over clever abstractions. No unnecessary dependencies, config, state, or premature optimisation. If built-in Next.js/React/Tailwind can do it, don't add a library.
7. **Responsive on all devices** — mobile-first with Tailwind breakpoints; fluid layouts (grid/flex), tap targets ≥ 44 px, readable type, no horizontal scroll, responsive images (next/image).

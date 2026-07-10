# SI Crafts — Folder Conventions & Service-Layer Rule

## Folder Structure
```
/app                  → Next.js App Router routes
/src/components       → Reusable UI components (small, single-purpose)
/src/data/mock        → All mock data files (*.ts) with TypeScript types
/src/services         → Service layer (the ONLY place that touches data sources)
/src/theme            → Design tokens (colours, spacing, typography)
/src/types            → Shared TypeScript type definitions
/src/lib              → Utility functions and helpers
```

## Service-Layer Rule (non-negotiable)
- ALL data access goes through `/src/services/*.ts`.
- Pages and components call service functions (e.g. `getProducts()`, `getMaker(slug)`, `login()`).
- Service functions currently import from `/src/data/mock/` — later they will call the Wagtail REST API.
- **Pages and components must NEVER import directly from `/src/data/mock/`.**
- Route ALL create/update/delete operations through the service layer so they map cleanly onto Wagtail's admin + API later.

## Naming Conventions
- Files: kebab-case (`maker-card.tsx`, `get-products.ts`)
- Components: PascalCase (`MakerCard`, `ProductGrid`)
- Types: PascalCase (`Maker`, `Product`, `Stockist`)
- Service functions: camelCase (`getProducts`, `getMaker`, `createProduct`)
- Mock data files: kebab-case (`makers.ts`, `products.ts`, `crafts.ts`)

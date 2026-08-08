# SI Crafts — Technology Stack

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│  Frontend (Cloudflare Pages)                    │
│  Next.js 15 · React 19 · TypeScript            │
│  Tailwind CSS · shadcn/ui · Radix UI           │
├─────────────────────────────────────────────────┤
│  API Routes (Next.js Edge)                      │
│  Auth · Stockist Management · File Uploads      │
├─────────────────────────────────────────────────┤
│  Database (Neon)                                │
│  PostgreSQL (serverless) — auth & sessions      │
├─────────────────────────────────────────────────┤
│  Content (Mock Data → Wagtail CMS)             │
│  Products · Makers · Crafts · Orders            │
└─────────────────────────────────────────────────┘
```

## Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 15.x | App Router, server components, API routes, static generation |
| **React** | 19.x | UI rendering |
| **TypeScript** | 5.7+ | Type safety across the entire codebase |
| **Turbopack** | (bundled) | Fast dev server bundler |

## Styling & UI

| Technology | Purpose |
|-----------|---------|
| **Tailwind CSS** 3.4 | Utility-first styling, custom design tokens |
| **shadcn/ui** | Component primitives (buttons, dialogs, selects) |
| **Radix UI** | Accessible headless components (dialog, dropdown, toast, select, toggle) |
| **Lucide React** | Icon library (consistent, tree-shakeable) |
| **Framer Motion** | Animation library (installed, used sparingly for subtle transitions) |

## Database & Auth

| Technology | Purpose |
|-----------|---------|
| **Neon** | Serverless PostgreSQL — stores admin accounts, stockist accounts, sessions |
| **@neondatabase/serverless** | HTTP-based Neon driver (works on Cloudflare edge, no TCP required) |
| **Custom JWT-like tokens** | Session management via `sessions` table with expiry |

## Content Layer

| Layer | Current | Future |
|-------|---------|--------|
| **Products, Makers, Crafts** | Mock data (`/src/data/mock/`) | Wagtail CMS REST API |
| **Orders, Enquiries** | Mock data | Wagtail + Django models |
| **Auth (admins, stockists)** | Neon PostgreSQL (live) | Same (or Wagtail auth) |

## Hosting & Deployment

| Service | Purpose |
|---------|---------|
| **Cloudflare Pages** | Frontend hosting (Next.js via OpenNext adapter, server-rendered — not static export) |
| **GitHub** | Source control + CI/CD trigger |
| **Neon** (ap-southeast-2) | Database hosting (Sydney region) |
| **Cloudflare R2** (future) | Image/media storage for uploads |

> **Note:** The app uses Next.js API routes for auth, stockist management, and file uploads, which require a server-capable runtime. Do not use `output: 'export'` in next.config.

## Development Tools

| Tool | Purpose |
|------|---------|
| **Vitest** | Unit and property testing |
| **fast-check** | Property-based testing |
| **@testing-library/react** | Component testing |
| **ESLint** | Linting (Next.js config) |
| **PostCSS** | CSS processing for Tailwind |
| **tsx** | TypeScript script runner (migrations, utilities) |

## Project Structure

```
/src/app                → Next.js App Router pages & API routes
  /api                  → Server-side API routes (auth, upload, stockists, admins)
  /admin                → Admin dashboard pages
  /stockist             → Stockist portal pages
  /craft/[slug]         → Craft detail pages
  /maker/[slug]         → Maker detail pages
  /piece/[productCode]  → Provenance "meet the maker" pages
  /p/[productCode]      → Short URL redirects (QR code targets)
/src
  /components           → Reusable UI components
    /admin              → Admin form modals, layout, sidebar
    /cards              → Maker, product, craft cards
    /catalogue          → Filters, search, product grid
    /layout             → Header, footer, mobile nav, skip link
    /provenance         → Piece page sections
    /shared             → Piece lookup, hero toggle
  /data/mock            → Mock data (TypeScript, typed)
  /lib                  → Utilities (db client, auth client, cart, metadata, motion)
  /services             → Service layer (sole data access point)
  /types                → TypeScript type definitions
  /theme                → Design tokens
/public
  /images               → Static images
  /uploads              → User-uploaded images (gitignored)
  /icons                → PWA icons
  manifest.json         → PWA manifest
/scripts                → Database migrations and utilities
```

## Key Design Decisions

### Service Layer Pattern
All data access goes through `/src/services/`. Pages and components never import from `/src/data/mock/` directly. This means swapping from mock data to a real API only requires changing service files — zero changes to pages or components.

### Client/Server Boundary
- **Server-only**: Database queries, service functions that touch Neon
- **API routes**: Bridge between client components and server-side data
- **Client helpers** (`/src/lib/auth-client.ts`): Fetch wrappers that call API routes from `'use client'` components

### Auth Architecture
- Sessions stored in Neon `sessions` table with expiry-based validation
- Tokens passed via Authorization header (`Bearer <token>`) for API requests
- Client holds token in localStorage for convenience (future: migrate to HttpOnly Secure cookies with CSRF protection)
- Validation happens server-side via API route → Neon query
- Admin: 60-min session timeout, 5-attempt lockout (15 min), bcrypt password hashing
- Stockist: 8-hour session timeout, bcrypt password hashing

### Image Handling
- Client-side compression (Canvas API → WebP at 80% quality)
- Resize to max 1200px width before upload
- Saved to `/public/uploads/` in dev (Cloudflare R2 in production)
- Typical 5MB JPEG → 100-300KB WebP after compression

### Product Code System
- Pattern: `{material}-{maker initial}-{sequential number}`
- Examples: P-J-1 (pandanus, Julie, #1), W-PK-3 (wood, Peter Kera, #3)
- Auto-generated when creating products, editable by admin
- Uniqueness enforced on save

## Environment Variables

| Variable | Location | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | `.env.local` | Neon PostgreSQL connection string |

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run test:run` | Run tests once |
| `npx tsx --env-file=.env.local scripts/migrate.ts` | Create/seed database tables |
| `npx tsx --env-file=.env.local scripts/check-admin.ts` | Debug: view admin accounts |

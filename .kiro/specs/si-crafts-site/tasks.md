# Implementation Plan: SI Crafts Website

## Overview

This plan implements the SI Crafts website across 10 phases, building progressively on mock data. Each phase produces a testable deliverable. The architecture uses Next.js App Router with TypeScript, a service-layer pattern for data access, and consent gating enforced at every level.

## Tasks

- [ ] 1. Phase 0 — Project Setup and Foundation
  - [ ] 1.1 Initialise Next.js project with App Router, TypeScript, Turbopack, and Tailwind CSS
    - Run `npx create-next-app@latest` with App Router and TypeScript enabled
    - Configure Turbopack in `next.config.ts`
    - Install and configure Tailwind CSS with shadcn/ui and Radix UI
    - Install Lucide React, Framer Motion
    - Install Vitest and fast-check as dev dependencies
    - _Requirements: 1.1, 20.4, 22.1_

  - [ ] 1.2 Create folder structure and design tokens
    - Create directories: `/src/types/`, `/src/services/`, `/src/data/mock/`, `/src/components/` (with subdirs: layout, cards, catalogue, provenance, forms, admin, shared), `/src/theme/`, `/src/lib/`
    - Create route groups: `/app/(public)/`, `/app/(stockist)/`, `/app/(admin)/`
    - Implement design tokens in `/src/theme/`: colours.ts, typography.ts, spacing.ts, breakpoints.ts, effects.ts
    - Configure Tailwind to consume design tokens (extend theme)
    - _Requirements: 22.1, 22.2, 22.5_

  - [ ] 1.3 Create layout shell — Header, Footer, MobileNav, SkipLink
    - Implement `Header` component with 6 navigation links (Home, Catalogue, Meet the Makers, About, Wholesale, Contact)
    - Implement `Footer` component with 3 content boxes (Crafts & Techniques, Care Guide, FAQs & Shipping)
    - Implement `MobileNav` with hamburger toggle at <768px, keyboard-focusable, aria-label "Menu", focus trap
    - Implement `SkipLink` for skip-to-main-content
    - Create root layout using these components
    - Verify: tap targets ≥44px, responsive at 320px/375px/768px/1280px, no horizontal scroll
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 19.5, 19.7, 22.6_

  - [ ] 1.4 Configure PWA manifest and service worker
    - Create `/public/manifest.json` with name, short_name, start_url, display: "standalone", icons (192px, 512px)
    - Implement service worker for offline shell (renders nav + "you are offline" message)
    - Register service worker in root layout
    - _Requirements: 1.7, 20.8_

  - [ ] 1.5 Set up Open Graph meta tag helper and base SEO
    - Create utility in `/src/lib/metadata.ts` for generating OG tags (og:title ≤60 chars, og:description ≤155 chars, og:image, og:url)
    - Apply to root layout as defaults; individual pages override
    - _Requirements: 1.8, 20.9_

  - [ ] 1.6 Configure Vitest and testing infrastructure
    - Set up `vitest.config.ts` with path aliases matching tsconfig
    - Create test helper utilities in `/tests/` directory structure (unit, integration, properties)
    - Verify test runner works with a trivial test
    - _Requirements: 20.1_

  - [ ]* 1.7 Write property test — OG tags valid on all public pages (Property 1)
    - **Property 1: Open Graph Tags Valid on All Public Pages**
    - **Validates: Requirements 1.8, 20.9**

- [ ] 2. Checkpoint — Phase 0 Complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify: project builds (`npm run build`), layout renders at all breakpoints, PWA installable, OG tags present

- [ ] 3. Phase 1 — Data Model + Mock Data
  - [ ] 3.1 Define TypeScript types for all entities
    - Create `/src/types/maker.ts` — Maker, ConsentStatus
    - Create `/src/types/product.ts` — Product, MaterialCategory, ProductType
    - Create `/src/types/craft.ts` — Craft
    - Create `/src/types/stockist.ts` — Stockist, StockistStatus
    - Create `/src/types/admin.ts` — AdminUser, AdminRole
    - Create `/src/types/order.ts` — OrderRequest, CartItem, OrderStatus
    - Create `/src/types/contact.ts` — ContactSubmission
    - Create `/src/types/common.ts` — CulturalReviewStatus
    - Create `/src/types/index.ts` barrel export
    - _Requirements: 2.1, 2.6_

  - [ ] 3.2 Create mock data files with cultural guardrails
    - Create `/src/data/mock/makers.ts` — ≥6 makers (≥4 with consent "Signed"), real names, real villages, first-person stories
    - Create `/src/data/mock/products.ts` — ≥18 products with valid Product_Codes (pattern: {P|W|S}-{A-Z+}-{integer})
    - Create `/src/data/mock/crafts.ts` — 3 crafts (pandanus weaving, wood carving, shell-money jewellery)
    - Create `/src/data/mock/stockists.ts` — ≥2 stockists (1 approved, 1 pending)
    - Create `/src/data/mock/admins.ts` — 2 admins (1 Super_Admin, 1 Editor)
    - Create `/src/data/mock/orders.ts` — sample order requests
    - Create `/src/data/mock/contacts.ts` — empty initial array
    - Ensure Cultural_Review_Flags default to "unreviewed" for cultural content
    - _Requirements: 2.3, 2.4, 18.5, 18.8_

  - [ ] 3.3 Implement service layer — Makers service
    - Create `/src/services/makers.ts` with public (consent-gated) and admin functions
    - `getPublicMakers()` returns only makers with consentStatus="Signed" AND publishedFlag=true
    - `getPublicMakerBySlug(slug)` returns null for unpublished/non-consented makers
    - Admin functions return all makers regardless of consent
    - `setConsentStatus()` automatically sets publishedFlag
    - _Requirements: 2.1, 2.2, 2.5, 2.9_

  - [ ] 3.4 Implement service layer — Products service
    - Create `/src/services/products.ts` with public, stockist, and admin functions
    - `getPublicProducts()` excludes products linked to unpublished makers
    - Implement filter AND logic (materialCategory + productType + makerId)
    - Implement case-insensitive search on name + description
    - `getPublicProductByCode()` returns null for unknown codes
    - `validateProductCode()` validates pattern {P|W|S}-{A-Z+}-{integer}
    - _Requirements: 2.1, 2.2, 2.5, 2.7, 2.8, 2.10_

  - [ ] 3.5 Implement service layer — Crafts, Stockists, Admins, Orders, Auth, Contact services
    - Create `/src/services/crafts.ts` — CRUD + public access
    - Create `/src/services/stockists.ts` — application, approval/rejection
    - Create `/src/services/admins.ts` — CRUD, lockout logic, role checks
    - Create `/src/services/orders.ts` — create, history, reference number generation
    - Create `/src/services/auth.ts` — stockist auth (8h timeout), admin auth (60min timeout, 5-attempt lockout)
    - Create `/src/services/contact.ts` — form submission
    - _Requirements: 2.1, 2.2, 2.5, 11.5, 15.3, 15.8_

  - [ ]* 3.6 Write property test — Service returns null for unknown identifier (Property 2)
    - **Property 2: Service Returns Null for Unknown Identifier**
    - **Validates: Requirements 2.5**

  - [ ]* 3.7 Write property test — Product codes valid and unique (Property 3)
    - **Property 3: Product Codes Valid and Unique**
    - **Validates: Requirements 2.6, 16.7**

  - [ ]* 3.8 Write property test — Filter AND logic (Property 4)
    - **Property 4: Filter AND Logic**
    - **Validates: Requirements 2.7, 5.3**

  - [ ]* 3.9 Write property test — Search case-insensitive substring (Property 5)
    - **Property 5: Search Returns Case-Insensitive Substring Matches**
    - **Validates: Requirements 2.8**

  - [ ]* 3.10 Write property test — Public makers consent gating (Property 6)
    - **Property 6: Public Makers Consent Gating**
    - **Validates: Requirements 2.9, 6.2, 18.1**

  - [ ]* 3.11 Write property test — Public products exclude unpublished-maker products (Property 7)
    - **Property 7: Public Products Exclude Unpublished-Maker Products**
    - **Validates: Requirements 2.10, 5.9**

  - [ ]* 3.12 Write property test — Consent status and published flag linkage (Property 23)
    - **Property 23: Consent Status and Published Flag Linkage**
    - **Validates: Requirements 16.3, 16.4**

  - [ ]* 3.13 Write property test — Product code validation (Property 24)
    - **Property 24: Product Code Validation**
    - **Validates: Requirements 16.7, 16.8**

  - [ ]* 3.14 Write property test — New maker content defaults to unreviewed (Property 25)
    - **Property 25: New Maker Content Defaults to Unreviewed**
    - **Validates: Requirements 18.8**

- [ ] 4. Checkpoint — Phase 1 Complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify: types compile cleanly, mock data meets minimum counts, service functions return expected shapes

- [ ] 5. Phase 2 — Public Site: Home, About, Wholesale, Our Promise
  - [ ] 5.1 Implement Home page (`/app/(public)/page.tsx`)
    - Hero section with featured image, heading, 3-sentence intro
    - Featured products section (3–6 products, no pricing) using ProductCard component
    - "Meet the Makers" preview (≥2 maker portrait cards) using MakerCard component
    - "Featured Crafts" section highlighting 3 craft techniques with CraftCard component
    - Wholesale CTA linking to /wholesale
    - "See an example tag" link to sample provenance page `/piece/{product-code}`
    - All data fetched via service layer
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ] 5.2 Create shared card components — MakerCard, ProductCard, CraftCard
    - `MakerCard`: portrait, name, village, craft — links to /maker/[slug]
    - `ProductCard`: photo (or placeholder), name, code, material, type, maker name — links to /piece/[code]; `showPrice` prop defaults to false
    - `CraftCard`: image, name, short description — links to /craft/[slug]
    - All cards responsive, tap targets ≥44px, alt text with product/maker name + craft type
    - _Requirements: 5.7, 19.2, 22.4, 22.6_

  - [ ] 5.3 Implement About page (`/app/(public)/about/page.tsx`)
    - Three navigable sections: "About Solomon Islands", "About the SIAC Team", "Why We're Doing This"
    - Alternating text-and-imagery layout (2-col ≥768px, 1-col mobile)
    - Image placeholder for Solomon Islands landscape/cultural context
    - Cultural_Review_Flag on cultural significance content
    - Uses "Solomon Islands" (never "the Solomons")
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 18.5_

  - [ ] 5.4 Implement Wholesale explainer page (`/app/(public)/wholesale/page.tsx`)
    - Explain wholesale process, minimum order info, bank transfer payment
    - Login button/link for existing stockists → /stockist/login
    - "Apply to become a stockist" link → /stockist/apply
    - No pricing displayed anywhere
    - Statement: orders are expressions of interest, not confirmed purchases
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ] 5.5 Implement Our Promise page (`/app/(public)/our-promise/page.tsx`)
    - Values and promise content with cultural review flagging
    - Responsive layout consistent with design tokens
    - _Requirements: 22.3, 22.5_

  - [ ] 5.6 Implement Contact page (`/app/(public)/contact/page.tsx`)
    - Contact form: name, email, message fields with inline validation
    - Email address display for SIAC team
    - Link to Wholesale page for stockist enquiries
    - Form submission via service layer with confirmation message
    - Accessible labels, aria-describedby for errors, aria-live for announcements
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 19.6, 19.8_

  - [ ]* 5.7 Write property test — No pricing for unauthenticated users (Property 8)
    - **Property 8: No Pricing for Unauthenticated Users**
    - **Validates: Requirements 5.6, 10.4**

  - [ ]* 5.8 Write property test — Product card required fields (Property 9)
    - **Property 9: Product Card Required Fields**
    - **Validates: Requirements 5.7**

- [ ] 6. Checkpoint — Phase 2 Complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify: Home, About, Wholesale, Our Promise, Contact pages render correctly at all breakpoints; no pricing visible; OG tags present

- [ ] 7. Phase 3 — Makers & Crafts
  - [ ] 7.1 Implement Makers index page (`/app/(public)/makers/page.tsx`)
    - List all published makers as cards, sorted alphabetically by name
    - Each card: name, village/province, primary craft, portrait photo
    - Responsive grid: 1-col mobile → 2-col tablet → 3-4 col desktop
    - Only shows makers with publishedFlag = true (via getPublicMakers service)
    - _Requirements: 6.1, 6.2, 22.4_

  - [ ] 7.2 Implement Maker detail page (`/app/(public)/maker/[slug]/page.tsx`)
    - Display: name, village/province, portrait, first-person story, products grid
    - Products grid links each product to `/piece/{product-code}`
    - Cross-link to relevant craft technique page
    - Neutral placeholder if no portrait available (never depicts a person)
    - Hide products grid if maker has zero published products (no empty-state error)
    - No generic/anonymising phrases (no "skilled artisan", etc.)
    - First-person voice for stories; "pending cultural review" if story is null/empty
    - _Requirements: 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 18.2, 18.3, 18.6_

  - [ ] 7.3 Implement Craft technique pages (`/app/(public)/craft/[slug]/page.tsx`)
    - One page per craft: pandanus-weaving, wood-carving, shell-money-jewellery
    - Display: technique description (≥1 paragraph), process imagery (≥1 placeholder), linked makers (published only), linked products
    - Cultural_Review_Flag on ceremonial/cultural context content
    - If zero published makers or products: show informational message, not empty container
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 7.4 Write property test — Makers index alphabetical sort (Property 11)
    - **Property 11: Makers Index Alphabetical Sort**
    - **Validates: Requirements 6.1**

  - [ ]* 7.5 Write property test — No generic identity-erasing phrases (Property 12)
    - **Property 12: No Generic Identity-Erasing Phrases**
    - **Validates: Requirements 6.6, 18.2**

  - [ ]* 7.6 Write property test — Unreviewed cultural content not rendered publicly (Property 14)
    - **Property 14: Unreviewed Cultural Content Not Rendered Publicly**
    - **Validates: Requirements 8.9, 18.4**

- [ ] 8. Checkpoint — Phase 3 Complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify: Makers index shows only published makers sorted alphabetically; maker detail shows first-person stories; craft pages link to makers and products; cultural review flags enforced

- [ ] 9. Phase 4 — Catalogue (Public, Price-Free)
  - [ ] 9.1 Implement Catalogue page with filtering and search (`/app/(public)/catalogue/page.tsx`)
    - Default view: products grouped by Material_Category
    - GroupToggle component: switch between material and product type grouping
    - MakerFilter component: dropdown to filter by maker
    - SearchInput component: case-insensitive search (max 200 chars), debounced
    - ProductGrid component: responsive grid of ProductCards
    - No pricing visible (unauthenticated)
    - Show "login required to view wholesale pricing" prompt
    - "No products match" message with clear-filters suggestion when empty results
    - Only products from published makers visible
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.9_

  - [ ] 9.2 Implement Product detail navigation from catalogue
    - Clicking a product card navigates to `/piece/{product-code}` (Provenance page)
    - Product detail shows: image gallery, product code, material category, product type, dimensions, care notes, maker name
    - No pricing for unauthenticated users
    - _Requirements: 5.8, 5.10_

  - [ ]* 9.3 Write unit tests for catalogue filtering and search
    - Test filter AND logic with multiple active filters
    - Test search returns case-insensitive matches
    - Test empty state rendering
    - Test grouping toggle preserves filters
    - _Requirements: 5.2, 5.3, 5.4, 5.5_

- [ ] 10. Checkpoint — Phase 4 Complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify: Catalogue renders with all grouping/filter/search combinations; no pricing visible; products from unpublished makers hidden

- [ ] 11. Phase 5 — Provenance "Meet the Maker" (Hero Feature)
  - [ ] 11.1 Implement Provenance page (`/app/(public)/piece/[product-code]/page.tsx`)
    - Five sections in order: "This Piece", "Your Maker", "The Craft", "The Place", "Where to Buy"
    - "This Piece": product name, photo, code, materials, care instructions
    - "Your Maker": maker name, portrait, village/province, first-person story excerpt (≤300 chars)
    - "The Craft": technique name + link to full /craft/[slug] page
    - "The Place": island/province name + cultural context (only if reviewed)
    - "Where to Buy": link to wholesale enquiry page
    - Mobile-first: no horizontal scroll, tap targets ≥44px from 320px up
    - Publicly accessible (no auth required)
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ] 11.2 Implement error states and consent gating on Provenance page
    - Unknown product code: show "piece not found" message with link back to Catalogue
    - Unpublished maker: show product info + "maker details pending" in place of "Your Maker" section
    - Unreviewed cultural context: show island/province name without narrative
    - _Requirements: 8.5, 8.6, 8.9_

  - [ ] 11.3 Implement short URL redirect (`/app/(public)/p/[product-code]/page.tsx`)
    - Redirect `/p/{product-code}` → `/piece/{product-code}` for QR code tags
    - _Requirements: 8.8_

  - [ ]* 11.4 Write property test — Provenance page five sections in order (Property 13)
    - **Property 13: Provenance Page Five Sections in Order**
    - **Validates: Requirements 8.2**

  - [ ]* 11.5 Write property test — Product detail required fields (Property 10)
    - **Property 10: Product Detail Required Fields**
    - **Validates: Requirements 5.10**

- [ ] 12. Checkpoint — Phase 5 Complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify: Provenance pages render all 5 sections; short URL redirects work; consent gating hides unpublished makers; cultural review flags respected

- [ ] 13. Phase 6 — Stockist Gate + Wholesale (Mocked Auth)
  - [ ] 13.1 Implement Stockist login page (`/app/(stockist)/login/page.tsx`)
    - Email + password form
    - Generic error message on invalid credentials (never reveals which field failed)
    - On success: set HTTP-only session cookie, redirect to /stockist/catalogue
    - _Requirements: 11.1, 11.2_

  - [ ] 13.2 Implement stockist middleware and session management
    - Create middleware protecting all `/stockist/*` routes (except /stockist/apply, /stockist/login)
    - Validate session token from HTTP-only cookie
    - 8-hour inactivity timeout
    - Redirect unauthenticated users to /stockist/login without exposing pricing/order data
    - Implement logout: destroy session, clear cookie, redirect to /wholesale
    - _Requirements: 11.4, 11.5, 11.6_

  - [ ] 13.3 Implement Stockist wholesale catalogue (`/app/(stockist)/catalogue/page.tsx`)
    - Same product grid as public catalogue BUT with wholesale pricing visible
    - Downloadable price list available in gated area
    - _Requirements: 11.3_

  - [ ] 13.4 Implement Stockist application form (`/app/(stockist)/apply/page.tsx`)
    - Fields: business name (required), ABN (required, 11 digits), contact name (required), email (required, validated), phone (required), description (required, max 500 chars)
    - Inline validation errors on invalid fields
    - On success: store with "pending" status via service layer, show confirmation message
    - Publicly accessible (no auth required)
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [ ]* 13.5 Write property test — Authenticated stockist sees pricing (Property 15)
    - **Property 15: Authenticated Stockist Sees Pricing**
    - **Validates: Requirements 11.3**

  - [ ]* 13.6 Write property test — Unauthenticated redirect from stockist routes (Property 16)
    - **Property 16: Unauthenticated Redirect from Stockist-Gated Routes**
    - **Validates: Requirements 11.6**

- [ ] 14. Checkpoint — Phase 6 Complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify: Stockist login/logout works; pricing visible only when authenticated; session expires after 8h; application form validates correctly; middleware blocks unauthenticated access

- [ ] 15. Phase 7 — Order Request Flow (Mocked)
  - [ ] 15.1 Implement draft order builder (cart) with localStorage persistence
    - Add products to draft, adjust quantity (1–999), remove line items
    - Running total in AUD (2 decimal places), updates within 1 second of change
    - Cart persists in localStorage across page navigation and refresh
    - No duplicate productIds in cart
    - _Requirements: 13.1, 13.7_

  - [ ] 15.2 Implement GST threshold warning
    - Display persistent banner when draft total exceeds A$1,000
    - Banner indicates GST registration obligations may apply
    - _Requirements: 13.3_

  - [ ] 15.3 Implement order submission and confirmation (`/app/(stockist)/orders/page.tsx`)
    - Order review page with bank transfer notice ("expressions of interest, not confirmed purchases")
    - On submit: store via service layer, display confirmation with unique reference number and timestamp
    - GST warning visible on review page and confirmation if applicable
    - _Requirements: 13.4, 13.6_

  - [ ] 15.4 Implement order history page (`/app/(stockist)/order-history/page.tsx`)
    - List all past orders for authenticated stockist, sorted by date descending
    - Show: reference number, submission date, status (Submitted/Confirmed/Shipped)
    - _Requirements: 13.5_

  - [ ]* 15.5 Write property test — Cart state consistency (Property 17)
    - **Property 17: Cart State Consistency After Operations**
    - **Validates: Requirements 13.1**

  - [ ]* 15.6 Write property test — Cart total equals sum of line items (Property 18)
    - **Property 18: Cart Total Equals Sum of Line Items**
    - **Validates: Requirements 13.2**

  - [ ]* 15.7 Write property test — GST warning threshold (Property 19)
    - **Property 19: GST Warning Threshold**
    - **Validates: Requirements 13.3**

  - [ ]* 15.8 Write property test — Order history sorted descending (Property 20)
    - **Property 20: Order History Sorted Descending**
    - **Validates: Requirements 13.5**

- [ ] 16. Checkpoint — Phase 7 Complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify: Cart adds/removes/adjusts items; total calculates correctly; GST warning appears at threshold; order submits with reference number; order history sorted correctly; cart persists in localStorage

- [ ] 17. Phase 8 — Admin Dashboard & Content Management (Mocked)
  - [ ] 17.1 Implement Admin login and session management (`/app/(admin)/login/page.tsx`)
    - Email + password form with generic error message
    - 5 consecutive failures → lock account 15 minutes
    - Session: HTTP-only cookie, 60-minute inactivity timeout, 24-hour absolute timeout
    - On success: redirect to /admin/dashboard
    - _Requirements: 15.1, 15.2, 15.3, 15.8_

  - [ ] 17.2 Implement Admin middleware and role-based access control
    - Middleware on all /admin/* routes (except /admin/login)
    - Validate admin session + check role permissions
    - Editor: access makers, products, crafts, orders CRUD; denied admin management
    - Super_Admin: full access including /admin/admins
    - Non-admin users: redirect to public home (never reveal admin area exists)
    - Expired sessions: redirect to /admin/login with "session expired" message
    - _Requirements: 15.4, 15.5, 15.6, 15.7, 15.8_

  - [ ] 17.3 Implement Admin dashboard and sidebar (`/app/(admin)/dashboard/page.tsx`)
    - AdminSidebar with role-conditional navigation items
    - Dashboard overview with quick stats
    - _Requirements: 15.4, 15.5_

  - [ ] 17.4 Implement Makers CRUD interface (`/app/(admin)/makers/page.tsx`)
    - CRUDTable listing all makers with Consent_Status and Published_Flag columns
    - Create/edit form with consent toggle (sets publishedFlag automatically)
    - Cultural_Review_Flag toggle on story content fields
    - Media upload for portraits (JPEG/PNG/WebP, ≤5MB)
    - Delete confirmation dialog
    - Setting consent "Signed" → publishedFlag true (makes maker + products public)
    - Setting consent "Not Signed" → publishedFlag false (removes from public)
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.9_

  - [ ] 17.5 Implement Products CRUD interface (`/app/(admin)/products/page.tsx`)
    - CRUDTable for products with all fields
    - Product_Code validation on create/edit (pattern: {P|W|S}-{A-Z+}-{integer})
    - Inline error on invalid product code showing expected format
    - Media upload for product photos (JPEG/PNG/WebP, ≤5MB)
    - Delete confirmation dialog
    - _Requirements: 16.1, 16.5, 16.7, 16.8, 16.9_

  - [ ] 17.6 Implement Crafts CRUD, Stockist management, and Orders management
    - `/app/(admin)/crafts/page.tsx` — CRUD for craft records with cultural review flags
    - `/app/(admin)/stockists/page.tsx` — List stockists, approve/reject applications
    - `/app/(admin)/orders/page.tsx` — View/manage order requests, update status
    - Delete confirmation dialogs on all entities
    - _Requirements: 16.1, 16.9, 16.10_

  - [ ] 17.7 Implement Admin management — Super Admin only (`/app/(admin)/admins/page.tsx`)
    - List, create, edit, deactivate admin accounts
    - Assign roles (Super_Admin or Editor)
    - Deny Editor access (redirect + "insufficient permissions" message)
    - Reject self-deactivation with error message
    - _Requirements: 17.1, 17.2, 17.3, 17.4_

  - [ ]* 17.8 Write property test — Editor denied admin-management routes (Property 21)
    - **Property 21: Editor Denied Admin-Management Routes**
    - **Validates: Requirements 15.5, 15.6**

  - [ ]* 17.9 Write property test — Non-admin redirect from admin routes (Property 22)
    - **Property 22: Non-Admin Redirect from Admin Routes**
    - **Validates: Requirements 15.7**

- [ ] 18. Checkpoint — Phase 8 Complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify: Admin login with lockout works; role gating enforced; CRUD operations on all entities; consent toggle cascades to published flag; product code validation; delete confirmation dialogs

- [ ] 19. Phase 9 — Footer Information Pages + Accessibility + Performance
  - [ ] 19.1 Implement footer information pages
    - `/app/(public)/crafts-and-techniques/page.tsx` — 3 craft categories with name, 2-sentence description, image, link to detail page
    - `/app/(public)/care-guide/page.tsx` — care section per material (pandanus, wood, shell) with ≥3 recommendations each
    - `/app/(public)/faqs-and-shipping/page.tsx` — ≥4 Q&A entries (ordering, delivery/shipping, returns, "Do you provide retail?" → wholesale only)
    - All pages accessible without login
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

  - [ ] 19.2 Implement accessibility compliance across all pages
    - Semantic HTML landmarks on all pages (header, nav, main, footer)
    - Visible focus indicators (≥2px outline) on all focusable elements
    - Keyboard navigation for all interactive elements (Tab, Enter/Space, Escape)
    - Alt text on all images (product name + craft type; decorative → empty alt)
    - Colour contrast ≥4.5:1 body text, ≥3:1 large text
    - ARIA live regions for dynamic content (filter counts, validation errors)
    - Focus trap in hamburger menu and modals; focus returns on close
    - Labels on all form inputs with aria-describedby for errors
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 19.8_

  - [ ] 19.3 Implement prefers-reduced-motion support and performance optimizations
    - Framer Motion respects `prefers-reduced-motion: reduce` (duration → 0)
    - All public pages pre-rendered as static (SSG)
    - next/image for all images with responsive sizing
    - Verify Lighthouse Performance ≥90 on public pages
    - Provenance page LCP <3s on simulated 3G
    - _Requirements: 20.1, 20.2, 20.3, 20.5, 20.7_

  - [ ]* 19.4 Write accessibility audit tests
    - Run automated axe-core audit on all public pages
    - Test keyboard navigation flows
    - Test focus trap in mobile nav and modals
    - _Requirements: 19.1, 19.3, 19.7_

- [ ] 20. Checkpoint — Phase 9 Complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify: Footer pages render with required content; accessibility audit passes; Lighthouse ≥90; reduced motion supported; all pages statically generated

- [ ] 21. Phase 10 — Wagtail CMS Integration Documentation
  - [ ] 21.1 Create Wagtail integration README
    - Document every service function: name, corresponding Wagtail endpoint, HTTP method, request params, response shape
    - Document Wagtail content models: Makers, Products, Crafts, Stockists, Orders (fields, types, relationships)
    - Document auth integration: login flow between Next.js and Wagtail, token/session handling, role mapping
    - Document that replacing mock imports with fetch calls affects only `/src/services/` files
    - Document deployment plan: Cloudflare Pages for Next.js, SEO/OG tags management post-integration, auth/payment plug-in points, admin dashboard mapping (custom vs native Wagtail)
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5_

  - [ ] 21.2 Verify service layer swap-point architecture
    - Confirm no page or component imports from `/src/data/mock/`
    - Confirm all data access flows through service layer
    - Document any adjustments needed for API migration
    - _Requirements: 21.4_

- [ ] 22. Final Checkpoint — All Phases Complete
  - Ensure all tests pass, ask the user if questions arise.
  - Full site review: all 22 requirements covered, all pages responsive at 320px/375px/768px/1280px, consent gating enforced, cultural guardrails active, no public pricing, PWA installable

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation between phases
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All data access goes through the service layer — pages/components never import from `/src/data/mock/`
- Cultural guardrails (consent gating, cultural review flags, real names) are enforced from Phase 1 onward
- Mock auth uses plaintext passwords and in-memory sessions (development only)
- The "Our Promise" page is a simple static content page introduced in Phase 2
- Footer information pages are grouped with accessibility/performance in Phase 9 to allow holistic quality pass

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.6"] },
    { "id": 2, "tasks": ["1.3", "1.4", "1.5"] },
    { "id": 3, "tasks": ["1.7", "3.1"] },
    { "id": 4, "tasks": ["3.2"] },
    { "id": 5, "tasks": ["3.3", "3.4", "3.5"] },
    { "id": 6, "tasks": ["3.6", "3.7", "3.8", "3.9", "3.10", "3.11", "3.12", "3.13", "3.14"] },
    { "id": 7, "tasks": ["5.1", "5.2", "5.3", "5.4", "5.5", "5.6"] },
    { "id": 8, "tasks": ["5.7", "5.8"] },
    { "id": 9, "tasks": ["7.1", "7.3"] },
    { "id": 10, "tasks": ["7.2", "7.4", "7.5", "7.6"] },
    { "id": 11, "tasks": ["9.1"] },
    { "id": 12, "tasks": ["9.2", "9.3"] },
    { "id": 13, "tasks": ["11.1"] },
    { "id": 14, "tasks": ["11.2", "11.3", "11.4", "11.5"] },
    { "id": 15, "tasks": ["13.1", "13.4"] },
    { "id": 16, "tasks": ["13.2"] },
    { "id": 17, "tasks": ["13.3", "13.5", "13.6"] },
    { "id": 18, "tasks": ["15.1"] },
    { "id": 19, "tasks": ["15.2", "15.3", "15.4", "15.5", "15.6", "15.7", "15.8"] },
    { "id": 20, "tasks": ["17.1"] },
    { "id": 21, "tasks": ["17.2"] },
    { "id": 22, "tasks": ["17.3", "17.4", "17.5", "17.6"] },
    { "id": 23, "tasks": ["17.7", "17.8", "17.9"] },
    { "id": 24, "tasks": ["19.1", "19.2", "19.3"] },
    { "id": 25, "tasks": ["19.4"] },
    { "id": 26, "tasks": ["21.1", "21.2"] }
  ]
}
```

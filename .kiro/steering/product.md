# SI Crafts — Product & Business Context

## Business
Solomon Islands Arts and Crafts (SI Crafts / SIAC) is a volunteer-run **wholesale** business that imports Solomon Islands handicrafts — pandanus weaving, wood carving, and shell-money jewellery — and sells them to Australian museum and gallery shops.

## Audience
1. **Public visitors** — anyone interested in Solomon Islands culture and craft. They browse stories, makers, and product photos but never see pricing.
2. **Stockists** — approved wholesale buyers (museum/gallery shops) who log in to view pricing and place order requests.
3. **Admins** — volunteers who manage content, products, stockists, and other admins.

## Goals
- Tell authentic maker stories and build provenance trust (the "meet the maker" QR flow).
- Drive wholesale enquiries from Australian retail/museum shops.
- Protect cultural IP and respect maker consent.
- Keep operations simple — bank-transfer orders, no live payments at launch.

## Key Business Rules
- **Wholesale only** — no public retail pricing anywhere on the open site.
- Product code system: `{material initial}-{maker initial}-{number}` (e.g. "P-J-1" = pandanus item by Julie).
- Provenance URL: `/piece/{product-code}` — public, mobile-first, no login required.
- Only publish makers whose Consent status is "Signed" (controlled by a "Published to web" flag).
- Orders are "expressions of interest" / wholesale order requests — bank transfer, not card payments.
- Warn when a draft order exceeds A$1 000 (GST threshold note).
- Target domain: solomonislandsartsandcrafts.com.au

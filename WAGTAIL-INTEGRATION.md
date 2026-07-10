# Wagtail CMS Integration Guide

How to replace mock data with the Wagtail REST API and deploy to production.

## Service Layer → Wagtail API Mapping

All data access is in `/src/services/`. Replace mock imports with `fetch()` calls to the Wagtail API.

### Makers (`/src/services/makers.ts`)

| Function | Endpoint | Method | Notes |
|----------|----------|--------|-------|
| `getPublicMakers()` | `/api/v2/pages/?type=makers.MakerPage&fields=*&consent_status=Signed` | GET | Filter by consent |
| `getPublicMakerBySlug(slug)` | `/api/v2/pages/?type=makers.MakerPage&slug={slug}` | GET | Return null if not published |
| `getMakersByCraft(craftId)` | `/api/v2/pages/?type=makers.MakerPage&craft={craftId}&consent_status=Signed` | GET | |
| `getAllMakers()` | `/api/v2/pages/?type=makers.MakerPage&fields=*` | GET | Admin — no consent filter |
| `createMaker(data)` | `/api/v2/pages/` | POST | Wagtail admin API |
| `updateMaker(id, data)` | `/api/v2/pages/{id}/` | PATCH | |
| `deleteMaker(id)` | `/api/v2/pages/{id}/` | DELETE | |
| `setConsentStatus(id, status)` | `/api/v2/pages/{id}/` | PATCH | Sets `consent_status` field |

### Products (`/src/services/products.ts`)

| Function | Endpoint | Method | Notes |
|----------|----------|--------|-------|
| `getPublicProducts(filters)` | `/api/v2/pages/?type=products.ProductPage&fields=*` | GET | Exclude unpublished-maker products |
| `getPublicProductByCode(code)` | `/api/v2/pages/?type=products.ProductPage&product_code={code}` | GET | |
| `searchProducts(query)` | `/api/v2/pages/?type=products.ProductPage&search={query}` | GET | Wagtail search backend |
| `getWholesaleProducts(filters)` | `/api/v2/pages/?type=products.ProductPage&fields=*,wholesale_price` | GET | Include price field |
| `validateProductCode(code)` | Client-side only | — | Regex: `/^[PWS]-[A-Z]+-\d+$/` |

### Crafts (`/src/services/crafts.ts`)

| Function | Endpoint | Method |
|----------|----------|--------|
| `getAllCrafts()` | `/api/v2/pages/?type=crafts.CraftPage&fields=*` | GET |
| `getCraftBySlug(slug)` | `/api/v2/pages/?type=crafts.CraftPage&slug={slug}` | GET |

### Orders (`/src/services/orders.ts`)

| Function | Endpoint | Method |
|----------|----------|--------|
| `createOrderRequest(stockistId, items)` | `/api/orders/` | POST |
| `getOrdersByStockist(stockistId)` | `/api/orders/?stockist={stockistId}` | GET |
| `getAllOrders()` | `/api/orders/` | GET |
| `updateOrderStatus(id, status)` | `/api/orders/{id}/` | PATCH |

### Auth (`/src/services/auth.ts`)

| Function | Endpoint | Method |
|----------|----------|--------|
| `loginStockist(email, password)` | `/api/auth/stockist/login/` | POST |
| `validateStockistSession(token)` | `/api/auth/stockist/verify/` | GET |
| `loginAdmin(email, password)` | `/api/auth/admin/login/` | POST |
| `validateAdminSession(token)` | `/api/auth/admin/verify/` | GET |

## Wagtail Content Models

### MakerPage (wagtail Page)
```python
class MakerPage(Page):
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=200)
    village = models.CharField(max_length=200)
    province = models.CharField(max_length=200)
    island = models.CharField(max_length=200)
    portrait = models.ForeignKey('wagtailimages.Image', null=True, blank=True)
    story = RichTextField(blank=True, null=True)
    story_cultural_review_flag = models.CharField(choices=['unreviewed','reviewed'])
    craft = models.ForeignKey('CraftPage')
    consent_status = models.CharField(choices=['Signed','Not Signed'])
    published_flag = models.BooleanField(default=False)
```

### ProductPage (wagtail Page)
```python
class ProductPage(Page):
    product_code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=300)
    description = RichTextField()
    material_category = models.CharField(choices=['pandanus','wood','shells'])
    product_type = models.CharField(choices=['bags','jewellery','trays','fans','bowls','ornaments','baskets'])
    maker = models.ForeignKey('MakerPage')
    craft = models.ForeignKey('CraftPage')
    dimensions = models.CharField(max_length=100, blank=True, null=True)
    care_notes = models.TextField(blank=True, null=True)
    wholesale_price = models.DecimalField(max_digits=10, decimal_places=2)
    published_flag = models.BooleanField(default=False)
    # Images via InlinePanel → ProductImage
```

### CraftPage (wagtail Page)
```python
class CraftPage(Page):
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=200)
    description = RichTextField()
    cultural_context = RichTextField(blank=True, null=True)
    cultural_context_review_flag = models.CharField(choices=['unreviewed','reviewed'])
    material_category = models.CharField(choices=['pandanus','wood','shells'])
    # Process images via InlinePanel → CraftProcessImage
```

### Stockist (Django model, not Page)
```python
class Stockist(models.Model):
    business_name = models.CharField(max_length=300)
    abn = models.CharField(max_length=11)
    contact_name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    description = models.TextField(max_length=500)
    status = models.CharField(choices=['pending','approved','rejected'])
    user = models.OneToOneField(User, null=True)  # Django auth user
```

### OrderRequest (Django model)
```python
class OrderRequest(models.Model):
    reference_number = models.CharField(max_length=20, unique=True)
    stockist = models.ForeignKey(Stockist)
    total_aud = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(choices=['Submitted','Confirmed','Shipped'])
    submitted_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)
    # Items via related OrderItem model
```

## Authentication Integration

### Stockist Auth
- Login: POST credentials to Wagtail custom endpoint → receive JWT token
- Session: Store JWT in HTTP-only cookie (not localStorage in production)
- Validation: Send JWT in Authorization header; Wagtail middleware validates
- Timeout: 8 hours inactivity (server-side token expiry)

### Admin Auth
- Login: POST to Wagtail admin auth endpoint → receive session token
- Session: HTTP-only cookie, 60-minute inactivity, 24-hour absolute
- Lockout: 5 failed attempts → 15 min lock (Django-side rate limiting)
- Roles: Map to Wagtail Groups (Super Admin → full access, Editor → content only)

### Role Mapping
| SI Crafts Role | Wagtail Group | Permissions |
|----------------|---------------|-------------|
| super_admin | Administrators | All pages, all snippets, user management |
| editor | Editors | Page CRUD (Makers, Products, Crafts), no user mgmt |
| stockist | Stockists (custom) | API access to orders + pricing only |

## Deployment Plan

### Frontend (Cloudflare Pages)
- Build: `next build` produces static + edge functions
- Deploy: Connect GitHub repo to Cloudflare Pages
- Environment: Set `WAGTAIL_API_URL` env variable
- Edge Functions: Handle auth token validation at `/stockist/*` and `/admin/*` routes

### Wagtail API (Separate host)
- Options: Fly.io, Railway, AWS ECS, or any Django host
- Database: PostgreSQL
- Media: Cloudflare R2 or AWS S3 for images
- URL: e.g. `https://api.solomonislandsartsandcrafts.com.au`
- CORS: Allow `https://solomonislandsartsandcrafts.com.au`

### SEO & Performance Post-Integration
- OG tags: Generated from Wagtail page fields via `generatePageMetadata()`
- PWA: manifest.json and service worker remain static in `/public/`
- Priority Hints: Add `fetchpriority="high"` to hero images via next/image priority prop
- ISR: Consider Incremental Static Regeneration for product/maker pages (revalidate: 3600)

### Where Auth & Payments Plug In
- **Real auth**: Replace localStorage tokens with HTTP-only cookies set by Wagtail login endpoints
- **Payments**: When ready, add Stripe/payment gateway at order submission step. The `createOrderRequest` service function becomes a POST to a payment-aware endpoint.

### Admin Dashboard: Custom vs Native Wagtail
| Feature | Native Wagtail | Custom (keep) |
|---------|---------------|---------------|
| Page editing (Makers, Products, Crafts) | ✅ Wagtail admin | — |
| Media library | ✅ Wagtail admin | — |
| Snippets/collections | ✅ Wagtail admin | — |
| User/group management | ✅ Wagtail admin | — |
| Stockist approval | — | ✅ Custom admin view (or Wagtail ModelAdmin) |
| Order management | — | ✅ Custom admin view |
| Consent/Published flags | ✅ Wagtail page fields | — |
| Cultural review flags | ✅ Wagtail page fields | — |

Most admin functionality maps to native Wagtail. Only stockist approval and order management need custom views (which can be Wagtail ModelAdmin or standalone Django views served at a subpath).

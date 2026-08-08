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
| `logoutStockist(token)` | `/api/auth/stockist/logout/` | POST |
| `loginAdmin(email, password)` | `/api/auth/admin/login/` | POST |
| `validateAdminSession(token)` | `/api/auth/admin/verify/` | GET |
| `logoutAdmin(token)` | `/api/auth/admin/logout/` | POST |

### Admins (`/src/services/admins.ts`)

| Function | Endpoint | Method | Notes |
|----------|----------|--------|-------|
| `getAdminById(id)` | `/api/admins/{id}/` | GET | |
| `getAdminByEmail(email)` | `/api/admins/?email={email}` | GET | |
| `getAllAdmins()` | `/api/admins/` | GET | Super Admin only |
| `createAdmin(data)` | `/api/admins/` | POST | Super Admin only |
| `updateAdmin(id, data)` | `/api/admins/{id}/` | PATCH | |
| `deactivateAdmin(id, requestingId)` | `/api/admins/{id}/deactivate/` | POST | Prevents self-deactivation |
| `incrementFailedLogin(id)` | Server-side only | — | Django signal on failed auth |
| `resetFailedLogin(id)` | Server-side only | — | Django signal on success |

### Stockists (`/src/services/stockists.ts`)

| Function | Endpoint | Method | Notes |
|----------|----------|--------|-------|
| `getStockistById(id)` | `/api/stockists/{id}/` | GET | |
| `getStockistByEmail(email)` | `/api/stockists/?email={email}` | GET | |
| `getAllStockists()` | `/api/stockists/` | GET | Admin only |
| `createApplication(data)` | `/api/stockists/apply/` | POST | Public endpoint |
| `approveStockist(id)` | `/api/stockists/{id}/approve/` | POST | Admin only |
| `rejectStockist(id)` | `/api/stockists/{id}/reject/` | POST | Admin only |

### Enquiries (`/src/services/enquiries.ts`)

| Function | Endpoint | Method | Notes |
|----------|----------|--------|-------|
| `submitMakerEnquiry(data)` | `/api/enquiries/maker/` | POST | Public (from For Makers page) |
| `submitStockistRequest(data)` | `/api/enquiries/stockist-request/` | POST | Authenticated stockist |
| `submitContactEnquiry(data)` | `/api/enquiries/contact/` | POST | Public (from Contact page) |
| `listEnquiries(filter?)` | `/api/enquiries/?type={filter}` | GET | Admin only |
| `markHandled(type, id)` | `/api/enquiries/{id}/handled/` | POST | Admin only |

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

class OrderItem(models.Model):
    order = models.ForeignKey(OrderRequest, related_name='items')
    product = models.ForeignKey('ProductPage')
    product_code = models.CharField(max_length=20)
    product_name = models.CharField(max_length=300)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
```

### AdminUser (Django User + Profile)
```python
# Uses Django's built-in User model with a profile extension
class AdminProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(choices=['super_admin', 'editor'])
    is_active = models.BooleanField(default=True)
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
```

### Enquiries (Django models)
```python
class MakerEnquiry(models.Model):
    name = models.CharField(max_length=200)
    village = models.CharField(max_length=200)
    province = models.CharField(max_length=200)
    craft = models.CharField(max_length=200)
    message = models.TextField()
    contact = models.CharField(max_length=200)
    submitted_at = models.DateTimeField(auto_now_add=True)
    handled = models.BooleanField(default=False)

class StockistRequest(models.Model):
    stockist = models.ForeignKey(Stockist)
    request_data = models.JSONField()  # {kind, productCode, quantity} or {kind, description}
    submitted_at = models.DateTimeField(auto_now_add=True)
    handled = models.BooleanField(default=False)

class ContactEnquiry(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField()
    reason = models.CharField(choices=['general', 'wholesale', 'media', 'other'])
    message = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    handled = models.BooleanField(default=False)
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

## Service Layer Swap Process

When ready to connect real data:

### Step 1: Environment setup
```bash
# .env.local
WAGTAIL_API_URL=https://api.solomonislandsartsandcrafts.com.au
```

### Step 2: Create API client utility
```typescript
// src/lib/api-client.ts
const API_URL = process.env.WAGTAIL_API_URL || 'http://localhost:8000';

export async function apiGet<T>(path: string, token?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { headers });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
```

### Step 3: Replace mock imports in each service file
Each service file currently imports from `@/data/mock`. Replace with API calls:

```typescript
// Before (mock):
import { mockMakers } from '@/data/mock';
export async function getPublicMakers() {
  return mockMakers.filter(m => m.consentStatus === 'Signed');
}

// After (real):
import { apiGet } from '@/lib/api-client';
export async function getPublicMakers() {
  return apiGet<Maker[]>('/api/v2/pages/?type=makers.MakerPage&consent_status=Signed&fields=*');
}
```

### Step 4: Order of migration
1. **Crafts** (simplest, 3 records, read-only for public)
2. **Makers** (read + consent gating)
3. **Products** (depends on makers being migrated)
4. **Auth** (stockist + admin login/session)
5. **Orders** (depends on auth)
6. **Stockists** (depends on auth)
7. **Enquiries** (independent, low priority)

### What does NOT change
- Pages and components — they call service functions, not data directly
- Types in `/src/types/` — Wagtail API responses map to these same shapes
- Cart logic in `/src/lib/cart.ts` — client-side localStorage, no API needed
- `validateProductCode()` — client-side regex, no API needed

### Neon Database Connection
Your Neon PostgreSQL database will be configured in the Wagtail/Django settings:

```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'si_crafts',
        'USER': 'your_user',
        'PASSWORD': 'your_password',
        'HOST': 'ep-xxxxx.region.aws.neon.tech',
        'PORT': '5432',
        'OPTIONS': {'sslmode': 'require'},
    }
}
```

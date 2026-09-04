import { apiGet, apiPost, apiPatch, apiDelete, getAdminToken } from '@/lib/api-client';
import type { Product, MaterialCategory, ProductType } from '@/types';

interface WagtailProductResponse {
  id: number;
  meta?: {
    slug?: string;
    first_published_at?: string | null;
    last_published_at?: string | null;
  };
  slug?: string;
  title: string;
  product_code: string;
  description: string;
  material_category: string;
  product_type: string;
  maker?: { id: number } | number | null;
  craft?: { id: number } | number | null;
  dimensions: string | null;
  care_notes: string | null;
  wholesale_price: string | number;
  published_flag: boolean;
  featured?: boolean;
  image_urls?: string[] | null;
  image_alts?: string[] | null;
  images?: { image: { meta: { download_url: string } } }[];
  first_published_at?: string;
  last_published_at?: string;
}

interface WagtailListResponse {
  items: WagtailProductResponse[];
}

function mapProduct(raw: WagtailProductResponse): Product {
  // maker/craft can be {id: number} (read API) or number (write API) or null
  let makerId = '';
  if (raw.maker) {
    makerId = typeof raw.maker === 'object' ? String(raw.maker.id) : String(raw.maker);
  }
  let craftId = '';
  if (raw.craft) {
    craftId = typeof raw.craft === 'object' ? String(raw.craft.id) : String(raw.craft);
  }

  // Photos come from image_urls (uploaded via the admin UI). Fall back to
  // images added directly in the Wagtail admin.
  const imageUrls =
    raw.image_urls && raw.image_urls.length > 0
      ? raw.image_urls
      : (raw.images?.map((img) => img.image.meta.download_url) ?? []);
  const imageAlts =
    raw.image_alts && raw.image_alts.length > 0
      ? raw.image_alts
      : imageUrls.map((_, i) => `${raw.title} — photo ${i + 1}`);

  return {
    id: String(raw.id),
    productCode: raw.product_code ?? '',
    slug: raw.meta?.slug ?? raw.slug ?? '',
    name: raw.title ?? '',
    description: raw.description ?? '',
    materialCategory: (raw.material_category ?? '') as MaterialCategory,
    productType: (raw.product_type ?? '') as ProductType,
    makerId,
    craftId,
    imageUrls,
    imageAlts,
    dimensions: raw.dimensions ?? null,
    careNotes: raw.care_notes ?? null,
    wholesalePrice: typeof raw.wholesale_price === 'string' ? parseFloat(raw.wholesale_price) : (raw.wholesale_price ?? 0),
    publishedFlag: raw.published_flag ?? false,
    featured: raw.featured ?? false,
    // Read API nests timestamps under `meta`; the write API returns them flat.
    createdAt: raw.meta?.first_published_at ?? raw.first_published_at ?? '',
    updatedAt: raw.meta?.last_published_at ?? raw.last_published_at ?? '',
  };
}

export interface ProductFilters {
  materialCategory?: MaterialCategory;
  productType?: ProductType;
  makerId?: string;
  search?: string;
}

// Product code validation
export function validateProductCode(code: string): boolean {
  return /^[A-Z]+-[A-Z]+-\d+$/.test(code);
}

function buildQueryString(filters?: ProductFilters): string {
  const params: string[] = [];
  if (filters?.materialCategory) params.push(`material_category=${filters.materialCategory}`);
  if (filters?.productType) params.push(`product_type=${filters.productType}`);
  if (filters?.makerId) params.push(`maker=${filters.makerId}`);
  if (filters?.search) params.push(`search=${encodeURIComponent(filters.search)}`);
  return params.length > 0 ? '&' + params.join('&') : '';
}

// --- Public ---

/**
 * Get all published products, optionally filtered.
 * 
 * Used by the /catalogue page. Only returns products with publishedFlag = true.
 * Supports filtering by material category, product type, maker, and text search.
 * 
 * @param filters - Optional filters to narrow results
 * @param filters.materialCategory - Filter by material (e.g. "pandanus", "shell-money")
 * @param filters.productType - Filter by type (e.g. "basket", "necklace")
 * @param filters.makerId - Show only products by a specific maker
 * @param filters.search - Text search across product name and description
 * @returns Promise<Product[]> - Array of published products matching filters
 * 
 * @example
 * ```tsx
 * // Get all published products
 * const all = await getPublicProducts();
 * 
 * // Get only pandanus baskets
 * const baskets = await getPublicProducts({ 
 *   materialCategory: 'pandanus', 
 *   productType: 'basket' 
 * });
 * ```
 */
export async function getPublicProducts(filters?: ProductFilters): Promise<Product[]> {
  const qs = buildQueryString(filters);
  const data = await apiGet<WagtailListResponse>(
    `/api/v2/products/?published_flag=true&fields=*${qs}`
  );
  return data.items.map(mapProduct);
}

/**
 * Get products marked as "featured" for homepage display.
 * 
 * Returns products where featured = true and publishedFlag = true. If the
 * backend doesn't support the featured field yet, gracefully returns empty
 * array so the homepage can fall back to auto-selecting recent products.
 * 
 * @returns Promise<Product[]> - Featured products, or empty array if not supported
 * 
 * @example
 * ```tsx
 * const featured = await getFeaturedProducts();
 * const toShow = featured.length > 0 ? featured : recentProducts.slice(0, 4);
 * ```
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const data = await apiGet<WagtailListResponse>(
      `/api/v2/products/?published_flag=true&featured=true&fields=*`
    );
    return data.items.map(mapProduct);
  } catch {
    // Backend may not have the 'featured' field yet — return empty so
    // the homepage falls back to auto-selection logic.
    return [];
  }
}

/**
 * Get a single published product by its product code.
 * 
 * Product codes follow the format: {material}-{maker}-{number} (e.g. "P-J-1").
 * This endpoint gates on publishedFlag, so unpublished products return null.
 * Used by the public /piece/[productCode] provenance page.
 * 
 * @param productCode - Product code (e.g. "P-J-1", case-sensitive)
 * @returns Promise<Product | null> - The product if found and published, null otherwise
 * 
 * @example
 * ```tsx
 * const product = await getPublicProductByCode('P-J-1');
 * if (!product) notFound();
 * ```
 */
export async function getPublicProductByCode(productCode: string): Promise<Product | null> {
  const data = await apiGet<WagtailListResponse>(
    `/api/v2/products/?product_code=${productCode}&published_flag=true&fields=*`
  );
  if (data.items.length === 0) return null;
  return mapProduct(data.items[0]);
}

/**
 * Get all published products by a specific maker.
 * 
 * Used by the /maker/[slug] page to show "Pieces by {maker}" section. Only
 * returns published products. If the maker is unpublished, this still returns
 * their published products (consent gating applies to maker profile, not products).
 * 
 * @param makerId - Maker ID (stringified number)
 * @returns Promise<Product[]> - Published products by this maker
 * 
 * @example
 * ```tsx
 * const products = await getProductsByMaker(maker.id);
 * ```
 */
export async function getProductsByMaker(makerId: string): Promise<Product[]> {
  const data = await apiGet<WagtailListResponse>(
    `/api/v2/products/?maker=${makerId}&published_flag=true&fields=*`
  );
  return data.items.map(mapProduct);
}

/**
 * Search published products by text query.
 * 
 * Searches across product name and description. Backend uses full-text search
 * with stemming and relevance ranking. Returns empty array for empty/whitespace queries.
 * 
 * @param query - Search text
 * @returns Promise<Product[]> - Matching published products, ranked by relevance
 * 
 * @example
 * ```tsx
 * const results = await searchProducts('basket');
 * ```
 */
export async function searchProducts(query: string): Promise<Product[]> {
  if (!query.trim()) return [];
  const data = await apiGet<WagtailListResponse>(
    `/api/v2/products/?search=${encodeURIComponent(query)}&published_flag=true&fields=*`
  );
  return data.items.map(mapProduct);
}

// --- Stockist ---

/**
 * Get products for wholesale buyers (authenticated stockists).
 * 
 * Currently delegates to getPublicProducts (wholesale pricing is visible to all).
 * Kept as separate function so wholesale-specific logic (min order qty, stock
 * levels) can be added later without changing call sites.
 * 
 * @param filters - Optional product filters
 * @returns Promise<Product[]> - Products available for wholesale order
 */
export async function getWholesaleProducts(filters?: ProductFilters): Promise<Product[]> {
  return getPublicProducts(filters);
}

// --- Admin ---

/**
 * Get ALL products, regardless of published status.
 * 
 * Admin-only. Used by the admin products page. Returns every product in the
 * database so admins can see drafts and manage the full catalogue. DO NOT use
 * this on public or stockist pages.
 * 
 * @returns Promise<Product[]> - All products in the system
 */
export async function getAllProducts(): Promise<Product[]> {
  const data = await apiGet<WagtailListResponse>('/api/v2/products/?fields=*&limit=100');
  return data.items.map(mapProduct);
}

/**
 * Get a single product by ID, regardless of published status.
 * 
 * Admin-only. Returns null if the product doesn't exist. Used by admin forms
 * and the product detail modal.
 * 
 * @param id - Product ID (stringified number)
 * @returns Promise<Product | null> - The product if found, null otherwise
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const raw = await apiGet<WagtailProductResponse>(`/api/v2/products/${id}/?fields=*`);
    return mapProduct(raw);
  } catch {
    return null;
  }
}

/**
 * Get a single product by product code, regardless of published status.
 * 
 * Admin-only. Unlike getPublicProductByCode, this does NOT gate on publishedFlag,
 * so unpublished products are returned. Used by the /piece/[productCode] page
 * to show QR previews of unpublished pieces (reachable by direct link, not indexed).
 * 
 * @param code - Product code (e.g. "P-J-1")
 * @returns Promise<Product | null> - The product if found, null otherwise
 */
export async function getProductByCode(code: string): Promise<Product | null> {
  const data = await apiGet<WagtailListResponse>(
    `/api/v2/products/?product_code=${code}&fields=*`
  );
  if (data.items.length === 0) return null;
  return mapProduct(data.items[0]);
}

/**
 * Create a new product in the admin.
 * 
 * Admin-only, requires auth token. The publishedFlag is NOT auto-set based on
 * any field — admins control publish state explicitly via the toggle in the UI.
 * 
 * @param data - Product fields (excludes server-generated id/timestamps/publishedFlag)
 * @returns Promise<Product> - The newly created product
 * @throws {ApiError} - If creation fails (validation, network, auth)
 */
export async function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'publishedFlag'>): Promise<Product> {
  const token = getAdminToken();
  const raw = await apiPost<WagtailProductResponse>('/api/write/products/', {
    title: data.name,
    slug: data.slug,
    product_code: data.productCode,
    description: data.description,
    material_category: data.materialCategory,
    product_type: data.productType,
    maker: data.makerId ? parseInt(data.makerId) : null,
    craft: data.craftId ? parseInt(data.craftId) : null,
    dimensions: data.dimensions,
    care_notes: data.careNotes,
    wholesale_price: data.wholesalePrice,
    featured: data.featured ?? false,
    image_urls: data.imageUrls ?? [],
    image_alts: data.imageAlts ?? [],
  }, token);
  return mapProduct(raw);
}

/**
 * Update an existing product.
 * 
 * Admin-only, requires auth token. Only provided fields are updated (partial update).
 * 
 * @param id - Product ID
 * @param data - Partial product fields to update
 * @returns Promise<Product | null> - Updated product, or null if not found
 * @throws {ApiError} - If update fails (validation, network, auth)
 */
export async function updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
  const token = getAdminToken();
  const body: Record<string, unknown> = {};
  if (data.name !== undefined) body.title = data.name;
  if (data.slug !== undefined) body.slug = data.slug;
  if (data.productCode !== undefined) body.product_code = data.productCode;
  if (data.description !== undefined) body.description = data.description;
  if (data.materialCategory !== undefined) body.material_category = data.materialCategory;
  if (data.productType !== undefined) body.product_type = data.productType;
  if (data.makerId !== undefined) body.maker = data.makerId ? parseInt(data.makerId) : null;
  if (data.craftId !== undefined) body.craft = data.craftId ? parseInt(data.craftId) : null;
  if (data.dimensions !== undefined) body.dimensions = data.dimensions;
  if (data.careNotes !== undefined) body.care_notes = data.careNotes;
  if (data.wholesalePrice !== undefined) body.wholesale_price = data.wholesalePrice;
  if (data.featured !== undefined) body.featured = data.featured;
  if (data.publishedFlag !== undefined) body.published_flag = data.publishedFlag;
  if (data.imageUrls !== undefined) body.image_urls = data.imageUrls;
  if (data.imageAlts !== undefined) body.image_alts = data.imageAlts;

  const raw = await apiPatch<WagtailProductResponse>(`/api/write/products/${id}/`, body, token);
  return mapProduct(raw);
}

/**
 * Delete a product permanently.
 * 
 * Admin-only, requires auth token. This is destructive and cannot be undone.
 * Orders referencing this product may have their line items orphaned.
 * 
 * @param id - Product ID to delete
 * @returns Promise<boolean> - true if deleted, false if delete failed
 */
export async function deleteProduct(id: string): Promise<boolean> {
  const token = getAdminToken();
  try {
    await apiDelete(`/api/write/products/${id}/`, token);
    return true;
  } catch {
    return false;
  }
}

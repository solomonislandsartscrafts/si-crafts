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

export async function getPublicProducts(filters?: ProductFilters): Promise<Product[]> {
  const qs = buildQueryString(filters);
  const data = await apiGet<WagtailListResponse>(
    `/api/v2/products/?published_flag=true&fields=*${qs}`
  );
  return data.items.map(mapProduct);
}

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

export async function getPublicProductByCode(productCode: string): Promise<Product | null> {
  const data = await apiGet<WagtailListResponse>(
    `/api/v2/products/?product_code=${productCode}&published_flag=true&fields=*`
  );
  if (data.items.length === 0) return null;
  return mapProduct(data.items[0]);
}

export async function getProductsByMaker(makerId: string): Promise<Product[]> {
  const data = await apiGet<WagtailListResponse>(
    `/api/v2/products/?maker=${makerId}&published_flag=true&fields=*`
  );
  return data.items.map(mapProduct);
}

export async function searchProducts(query: string): Promise<Product[]> {
  if (!query.trim()) return [];
  const data = await apiGet<WagtailListResponse>(
    `/api/v2/products/?search=${encodeURIComponent(query)}&published_flag=true&fields=*`
  );
  return data.items.map(mapProduct);
}

// --- Stockist ---

export async function getWholesaleProducts(filters?: ProductFilters): Promise<Product[]> {
  return getPublicProducts(filters);
}

// --- Admin ---

export async function getAllProducts(): Promise<Product[]> {
  const data = await apiGet<WagtailListResponse>('/api/v2/products/?fields=*&limit=100');
  return data.items.map(mapProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const raw = await apiGet<WagtailProductResponse>(`/api/v2/products/${id}/?fields=*`);
    return mapProduct(raw);
  } catch {
    return null;
  }
}

export async function getProductByCode(code: string): Promise<Product | null> {
  const data = await apiGet<WagtailListResponse>(
    `/api/v2/products/?product_code=${code}&fields=*`
  );
  if (data.items.length === 0) return null;
  return mapProduct(data.items[0]);
}

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
  if (data.imageUrls !== undefined) body.image_urls = data.imageUrls;
  if (data.imageAlts !== undefined) body.image_alts = data.imageAlts;

  const raw = await apiPatch<WagtailProductResponse>(`/api/write/products/${id}/`, body, token);
  return mapProduct(raw);
}

export async function deleteProduct(id: string): Promise<boolean> {
  const token = getAdminToken();
  try {
    await apiDelete(`/api/write/products/${id}/`, token);
    return true;
  } catch {
    return false;
  }
}

import { apiGet, apiPost, apiPatch, apiDelete, getAdminToken } from '@/lib/api-client';
import type { Craft } from '@/types';

interface WagtailCraftResponse {
  id: number;
  meta?: { slug: string };
  slug?: string;
  title: string;
  description: string;
  cultural_context: string | null;
  cultural_context_review_flag: string;
  material_category: string;
  process_images?: { image: { meta: { download_url: string } }; caption: string }[];
}

interface WagtailListResponse {
  items: WagtailCraftResponse[];
}

function mapCraft(raw: WagtailCraftResponse): Craft {
  return {
    id: String(raw.id),
    slug: raw.meta?.slug ?? raw.slug ?? '',
    name: raw.title ?? '',
    description: raw.description ?? '',
    processImageUrls: raw.process_images?.map((pi) => pi.image.meta.download_url) ?? [],
    processImageAlt: raw.process_images?.[0]?.caption || `${raw.title ?? ''} craft process`,
    culturalContext: raw.cultural_context ?? null,
    culturalContextReviewFlag: (raw.cultural_context_review_flag ?? 'unreviewed') as Craft['culturalContextReviewFlag'],
    materialCategory: raw.material_category ?? '',
  };
}

export async function getAllCrafts(): Promise<Craft[]> {
  const data = await apiGet<WagtailListResponse>('/api/v2/crafts/?fields=*');
  const crafts = data.items.map(mapCraft).map(mergeCraftImages);
  if (crafts.length > 0) return crafts;

  // Fallback to mock data when API returns empty
  const { mockCrafts } = await import('@/data/mock/crafts');
  return mockCrafts.map(mergeCraftImages);
}

export async function getCraftBySlug(slug: string): Promise<Craft | null> {
  const data = await apiGet<WagtailListResponse>(`/api/v2/crafts/?slug=${slug}&fields=*`);
  if (data.items.length > 0) return mergeCraftImages(mapCraft(data.items[0]));

  // Fallback to mock
  const { mockCrafts } = await import('@/data/mock/crafts');
  const mock = mockCrafts.find((c) => c.slug === slug);
  return mock ? mergeCraftImages(mock) : null;
}

export async function getCraftById(id: string): Promise<Craft | null> {
  try {
    const raw = await apiGet<WagtailCraftResponse>(`/api/v2/crafts/${id}/?fields=*`);
    return mergeCraftImages(mapCraft(raw));
  } catch {
    // Fallback to mock
    const { mockCrafts } = await import('@/data/mock/crafts');
    const mock = mockCrafts.find((c) => c.id === id);
    return mock ? mergeCraftImages(mock) : null;
  }
}

export async function createCraft(data: Omit<Craft, 'id'>): Promise<Craft> {
  const token = getAdminToken();
  try {
    const raw = await apiPost<WagtailCraftResponse>('/api/write/crafts/', {
      title: data.name,
      slug: data.slug,
      description: data.description,
      material_category: data.materialCategory,
      cultural_context: data.culturalContext,
      cultural_context_review_flag: data.culturalContextReviewFlag,
    }, token);
    const craft = mapCraft(raw);
    // Store image data locally (Wagtail StreamField doesn't accept URL-based images easily)
    if (data.processImageUrls.length > 0) {
      saveCraftImages(craft.id, data.processImageUrls, data.processImageAlt);
    }
    return { ...craft, processImageUrls: data.processImageUrls, processImageAlt: data.processImageAlt };
  } catch {
    // Backend unavailable — no-op for now, images are stored locally
    const craft: Craft = {
      id: `local-${Date.now()}`,
      slug: data.slug,
      name: data.name,
      description: data.description,
      processImageUrls: data.processImageUrls,
      processImageAlt: data.processImageAlt,
      culturalContext: data.culturalContext,
      culturalContextReviewFlag: data.culturalContextReviewFlag,
      materialCategory: data.materialCategory,
    };
    saveCraftImages(craft.id, data.processImageUrls, data.processImageAlt);
    return craft;
  }
}

export async function updateCraft(id: string, data: Partial<Craft>): Promise<Craft | null> {
  const token = getAdminToken();
  const body: Record<string, unknown> = {};
  if (data.name !== undefined) body.title = data.name;
  if (data.slug !== undefined) body.slug = data.slug;
  if (data.description !== undefined) body.description = data.description;
  if (data.materialCategory !== undefined) body.material_category = data.materialCategory;
  if (data.culturalContext !== undefined) body.cultural_context = data.culturalContext;
  if (data.culturalContextReviewFlag !== undefined) body.cultural_context_review_flag = data.culturalContextReviewFlag;

  // Always persist images locally (Wagtail doesn't accept URL-based images via API easily)
  if (data.processImageUrls !== undefined) {
    saveCraftImages(id, data.processImageUrls, data.processImageAlt ?? '');
  }

  try {
    const raw = await apiPatch<WagtailCraftResponse>(`/api/write/crafts/${id}/`, body, token);
    const craft = mapCraft(raw);
    return mergeCraftImages(craft);
  } catch {
    return null;
  }
}

export async function deleteCraft(id: string): Promise<boolean> {
  const token = getAdminToken();
  // Clean up local image data
  removeCraftImages(id);
  try {
    await apiDelete(`/api/write/crafts/${id}/`, token);
    return true;
  } catch {
    return false;
  }
}

// --- Local image storage for crafts ---
// Wagtail's StreamField requires image IDs, not URLs. Until backend integration
// supports URL-based image creation, we store uploaded image URLs in localStorage
// and merge them into craft data when reading.

const CRAFT_IMAGES_KEY = 'siac_craft_images';

interface CraftImageEntry {
  processImageUrls: string[];
  processImageAlt: string;
}

function getCraftImagesMap(): Record<string, CraftImageEntry> {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(CRAFT_IMAGES_KEY);
  if (!stored) return {};
  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

function saveCraftImages(craftId: string, urls: string[], alt: string): void {
  if (typeof window === 'undefined') return;
  const map = getCraftImagesMap();
  map[craftId] = { processImageUrls: urls, processImageAlt: alt };
  localStorage.setItem(CRAFT_IMAGES_KEY, JSON.stringify(map));
}

function removeCraftImages(craftId: string): void {
  if (typeof window === 'undefined') return;
  const map = getCraftImagesMap();
  delete map[craftId];
  localStorage.setItem(CRAFT_IMAGES_KEY, JSON.stringify(map));
}

function mergeCraftImages(craft: Craft): Craft {
  if (typeof window === 'undefined') return craft;
  const map = getCraftImagesMap();
  const entry = map[craft.id];
  if (entry && entry.processImageUrls.length > 0) {
    return {
      ...craft,
      processImageUrls: entry.processImageUrls,
      processImageAlt: entry.processImageAlt || craft.processImageAlt,
    };
  }
  return craft;
}

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
  /** URL-based process photo (admin-uploaded, stored on R2). */
  process_image_url?: string;
  process_image_alt?: string;
  /** Legacy Wagtail image-library entries, still supported for reads. */
  process_images?: { image: { meta: { download_url: string } }; caption: string }[];
}

interface WagtailListResponse {
  items: WagtailCraftResponse[];
}

function mapCraft(raw: WagtailCraftResponse): Craft {
  // Prefer the URL field (set via the admin UI); fall back to any images
  // attached through the Wagtail image library.
  const libraryUrls = raw.process_images?.map((pi) => pi.image.meta.download_url) ?? [];
  const urlField = raw.process_image_url?.trim();
  const processImageUrls = urlField ? [urlField, ...libraryUrls] : libraryUrls;

  return {
    id: String(raw.id),
    slug: raw.meta?.slug ?? raw.slug ?? '',
    name: raw.title ?? '',
    description: raw.description ?? '',
    processImageUrls,
    processImageAlt:
      raw.process_image_alt?.trim() ||
      raw.process_images?.[0]?.caption ||
      `${raw.title ?? ''} craft process`,
    culturalContext: raw.cultural_context ?? null,
    culturalContextReviewFlag: (raw.cultural_context_review_flag ?? 'unreviewed') as Craft['culturalContextReviewFlag'],
    materialCategory: raw.material_category ?? '',
  };
}

// NOTE: these readers deliberately do NOT fall back to mock data. Substituting
// invented crafts when the backend is asleep or empty made it impossible to tell
// real content from placeholder content, and risks publishing unreviewed
// cultural material. An empty result now stays empty.

export async function getAllCrafts(): Promise<Craft[]> {
  const data = await apiGet<WagtailListResponse>('/api/v2/crafts/?fields=*');
  return data.items.map(mapCraft);
}

export async function getCraftBySlug(slug: string): Promise<Craft | null> {
  const data = await apiGet<WagtailListResponse>(`/api/v2/crafts/?slug=${slug}&fields=*`);
  if (data.items.length > 0) return mapCraft(data.items[0]);
  return null;
}

export async function getCraftById(id: string): Promise<Craft | null> {
  try {
    const raw = await apiGet<WagtailCraftResponse>(`/api/v2/crafts/${id}/?fields=*`);
    return mapCraft(raw);
  } catch {
    return null;
  }
}

export async function createCraft(data: Omit<Craft, 'id'>): Promise<Craft> {
  const token = getAdminToken();
  const raw = await apiPost<WagtailCraftResponse>('/api/write/crafts/', {
    title: data.name,
    slug: data.slug,
    description: data.description,
    material_category: data.materialCategory,
    cultural_context: data.culturalContext,
    cultural_context_review_flag: data.culturalContextReviewFlag,
    process_image_url: data.processImageUrls[0] ?? '',
    process_image_alt: data.processImageAlt ?? '',
  }, token);
  return mapCraft(raw);
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
  if (data.processImageUrls !== undefined) body.process_image_url = data.processImageUrls[0] ?? '';
  if (data.processImageAlt !== undefined) body.process_image_alt = data.processImageAlt;

  const raw = await apiPatch<WagtailCraftResponse>(`/api/write/crafts/${id}/`, body, token);
  return mapCraft(raw);
}

export async function deleteCraft(id: string): Promise<boolean> {
  const token = getAdminToken();
  try {
    await apiDelete(`/api/write/crafts/${id}/`, token);
    return true;
  } catch {
    return false;
  }
}

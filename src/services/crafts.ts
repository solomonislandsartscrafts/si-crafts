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
  return data.items.map(mapCraft);
}

export async function getCraftBySlug(slug: string): Promise<Craft | null> {
  const data = await apiGet<WagtailListResponse>(`/api/v2/crafts/?slug=${slug}&fields=*`);
  if (data.items.length === 0) return null;
  return mapCraft(data.items[0]);
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

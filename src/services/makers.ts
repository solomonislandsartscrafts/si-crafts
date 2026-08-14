import { apiGet, apiPost, apiPatch, apiDelete, getAdminToken } from '@/lib/api-client';
import type { Maker, ConsentStatus } from '@/types';

interface WagtailMakerResponse {
  id: number;
  meta?: {
    slug?: string;
    first_published_at?: string | null;
    last_published_at?: string | null;
  };
  slug?: string;
  title: string;
  village: string;
  province: string;
  island: string;
  portrait?: { meta: { download_url: string } } | null;
  portrait_url?: string;
  portrait_alt?: string;
  story: string | null;
  story_cultural_review_flag: string;
  craft?: { id: number } | number | null;
  consent_status: string;
  published_flag: boolean;
  age: number | null;
  years_active: number | null;
  first_published_at?: string;
  last_published_at?: string;
}

interface WagtailListResponse {
  items: WagtailMakerResponse[];
}

/**
 * Normalize province strings to always end with " Province" so they match
 * the province map component's ID_TO_PROVINCE values (e.g. "Choiseul Province").
 * Handles values stored without the suffix or with inconsistent casing.
 */
function normalizeProvince(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  // Already ends with " Province" (case-insensitive check)
  if (/\s+province$/i.test(trimmed)) {
    // Ensure consistent casing: capitalize first letter of each word
    return trimmed.replace(/\b\w/g, (c) => c.toUpperCase());
  }
  // Append " Province"
  return `${trimmed.replace(/\b\w/g, (c) => c.toUpperCase())} Province`;
}

function mapMaker(raw: WagtailMakerResponse): Maker {
  // craft can be {id: number} (read API) or number (write API) or null
  let craftId = '';
  if (raw.craft) {
    craftId = typeof raw.craft === 'object' ? String(raw.craft.id) : String(raw.craft);
  }

  return {
    id: String(raw.id),
    slug: raw.meta?.slug ?? raw.slug ?? '',
    name: raw.title,
    village: raw.village ?? '',
    province: normalizeProvince(raw.province ?? ''),
    island: raw.island ?? '',
    portraitUrl: raw.portrait_url || raw.portrait?.meta?.download_url || null,
    portraitAlt: raw.portrait_alt || `Portrait of ${raw.title} from ${raw.village || ''}, ${raw.province || ''}`,
    story: raw.story ?? null,
    storyCulturalReviewFlag: (raw.story_cultural_review_flag ?? 'unreviewed') as Maker['storyCulturalReviewFlag'],
    craftId,
    consentStatus: (raw.consent_status ?? 'Not Signed') as ConsentStatus,
    publishedFlag: raw.published_flag ?? false,
    age: raw.age ?? null,
    yearsActive: raw.years_active ?? null,
    pieceCount: null,
    createdAt: raw.meta?.first_published_at ?? raw.first_published_at ?? '',
    updatedAt: raw.meta?.last_published_at ?? raw.last_published_at ?? '',
  };
}

// --- Public (consent-gated) ---

export async function getPublicMakers(): Promise<Maker[]> {
  const data = await apiGet<WagtailListResponse>(
    '/api/v2/makers/?consent_status=Signed&published_flag=true&fields=*'
  );
  return data.items.map(mapMaker).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getPublicMakerBySlug(slug: string): Promise<Maker | null> {
  const data = await apiGet<WagtailListResponse>(
    `/api/v2/makers/?slug=${slug}&consent_status=Signed&published_flag=true&fields=*`
  );
  if (data.items.length === 0) return null;
  return mapMaker(data.items[0]);
}

export async function getMakersByCraft(craftId: string): Promise<Maker[]> {
  const data = await apiGet<WagtailListResponse>(
    `/api/v2/makers/?craft=${craftId}&consent_status=Signed&published_flag=true&fields=*`
  );
  return data.items.map(mapMaker);
}

// --- Admin (all makers regardless of consent) ---

export async function getAllMakers(): Promise<Maker[]> {
  const data = await apiGet<WagtailListResponse>('/api/v2/makers/?fields=*&limit=100');
  return data.items.map(mapMaker);
}

export async function getMakerById(id: string): Promise<Maker | null> {
  try {
    const raw = await apiGet<WagtailMakerResponse>(`/api/v2/makers/${id}/?fields=*`);
    return mapMaker(raw);
  } catch {
    return null;
  }
}

export async function createMaker(data: Omit<Maker, 'id' | 'createdAt' | 'updatedAt' | 'publishedFlag'>): Promise<Maker> {
  const token = getAdminToken();
  const raw = await apiPost<WagtailMakerResponse>('/api/write/makers/', {
    title: data.name,
    slug: data.slug,
    village: data.village,
    province: data.province,
    island: data.island,
    story: data.story,
    story_cultural_review_flag: data.storyCulturalReviewFlag,
    consent_status: data.consentStatus,
    age: data.age,
    years_active: data.yearsActive,
    craft: data.craftId ? parseInt(data.craftId) : null,
    portrait_url: data.portraitUrl ?? '',
    portrait_alt: data.portraitAlt ?? '',
  }, token);
  return mapMaker(raw);
}

export async function updateMaker(id: string, data: Partial<Maker>): Promise<Maker | null> {
  const token = getAdminToken();
  const body: Record<string, unknown> = {};
  if (data.name !== undefined) body.title = data.name;
  if (data.slug !== undefined) body.slug = data.slug;
  if (data.village !== undefined) body.village = data.village;
  if (data.province !== undefined) body.province = data.province;
  if (data.island !== undefined) body.island = data.island;
  if (data.story !== undefined) body.story = data.story;
  if (data.storyCulturalReviewFlag !== undefined) body.story_cultural_review_flag = data.storyCulturalReviewFlag;
  if (data.consentStatus !== undefined) body.consent_status = data.consentStatus;
  if (data.age !== undefined) body.age = data.age;
  if (data.yearsActive !== undefined) body.years_active = data.yearsActive;
  if (data.craftId !== undefined) body.craft = data.craftId ? parseInt(data.craftId) : null;
  if (data.portraitUrl !== undefined) body.portrait_url = data.portraitUrl ?? '';
  if (data.portraitAlt !== undefined) body.portrait_alt = data.portraitAlt ?? '';

  const raw = await apiPatch<WagtailMakerResponse>(`/api/write/makers/${id}/`, body, token);
  return mapMaker(raw);
}

export async function deleteMaker(id: string): Promise<boolean> {
  const token = getAdminToken();
  try {
    await apiDelete(`/api/write/makers/${id}/`, token);
    return true;
  } catch {
    return false;
  }
}

export async function setConsentStatus(id: string, status: ConsentStatus): Promise<Maker | null> {
  return updateMaker(id, { consentStatus: status });
}

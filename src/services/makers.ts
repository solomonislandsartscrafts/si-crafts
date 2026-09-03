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

/**
 * Get all makers who have signed consent and are published to the web.
 * 
 * Used by the public /makers directory page. Only returns makers whose consent
 * status is "Signed" and whose publishedFlag is true. The cultural guardrail:
 * a maker cannot appear on the open site unless their consent form is on file.
 * 
 * Results are sorted alphabetically by name.
 * 
 * @returns Promise<Maker[]> - Array of published makers, sorted by name
 * 
 * @example
 * ```tsx
 * const makers = await getPublicMakers();
 * // Returns only makers with consentStatus === 'Signed' && publishedFlag === true
 * ```
 */
export async function getPublicMakers(): Promise<Maker[]> {
  const data = await apiGet<WagtailListResponse>(
    '/api/v2/makers/?consent_status=Signed&published_flag=true&fields=*'
  );
  return data.items.map(mapMaker).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get a single published maker by their slug.
 * 
 * Used by the /maker/[slug] detail page. Only returns the maker if their
 * consent status is "Signed" and publishedFlag is true. Returns null if the
 * maker doesn't exist or isn't published, triggering a 404 on the detail page.
 * 
 * @param slug - URL-safe maker identifier (e.g. "julie-fiuga")
 * @returns Promise<Maker | null> - The maker if found and published, null otherwise
 * 
 * @example
 * ```tsx
 * const maker = await getPublicMakerBySlug('julie-fiuga');
 * if (!maker) notFound();
 * ```
 */
export async function getPublicMakerBySlug(slug: string): Promise<Maker | null> {
  const data = await apiGet<WagtailListResponse>(
    `/api/v2/makers/?slug=${slug}&consent_status=Signed&published_flag=true&fields=*`
  );
  if (data.items.length === 0) return null;
  return mapMaker(data.items[0]);
}

/**
 * Get all published makers who practice a specific craft.
 * 
 * Used by the /craft/[slug] page to show "makers who practice this craft"
 * section. Only returns makers with signed consent and published flag.
 * 
 * @param craftId - Craft ID (stringified number from the backend)
 * @returns Promise<Maker[]> - Array of published makers for this craft
 * 
 * @example
 * ```tsx
 * const makers = await getMakersByCraft(craft.id);
 * // Returns only published makers where maker.craftId === craft.id
 * ```
 */
export async function getMakersByCraft(craftId: string): Promise<Maker[]> {
  const data = await apiGet<WagtailListResponse>(
    `/api/v2/makers/?craft=${craftId}&consent_status=Signed&published_flag=true&fields=*`
  );
  return data.items.map(mapMaker);
}

// --- Admin (all makers regardless of consent) ---

/**
 * Get ALL makers, regardless of consent status or published flag.
 * 
 * Admin-only. Used by the admin makers page and maker form dropdown. Returns
 * every maker in the database so admins can see unpublished makers and manage
 * consent workflow. DO NOT use this on public pages.
 * 
 * @returns Promise<Maker[]> - All makers in the system
 * 
 * @example
 * ```tsx
 * const allMakers = await getAllMakers();
 * // Returns makers with any consentStatus, published or not
 * ```
 */
export async function getAllMakers(): Promise<Maker[]> {
  const data = await apiGet<WagtailListResponse>('/api/v2/makers/?fields=*&limit=100');
  return data.items.map(mapMaker);
}

/**
 * Get a single maker by ID, regardless of consent or published status.
 * 
 * Admin-only. Used by product detail pages to show maker info even when the
 * maker is unpublished (consent gating applies to the display, not the fetch).
 * Returns null if the maker doesn't exist.
 * 
 * @param id - Maker ID (stringified number)
 * @returns Promise<Maker | null> - The maker if found, null otherwise
 * 
 * @example
 * ```tsx
 * const maker = await getMakerById(product.makerId);
 * const publishedMaker = maker?.publishedFlag ? maker : null; // Apply gating at display time
 * ```
 */
export async function getMakerById(id: string): Promise<Maker | null> {
  try {
    const raw = await apiGet<WagtailMakerResponse>(`/api/v2/makers/${id}/?fields=*`);
    return mapMaker(raw);
  } catch {
    return null;
  }
}

/**
 * Create a new maker in the admin.
 * 
 * Admin-only, requires auth token. The publishedFlag is auto-set based on
 * consentStatus: if consent is "Signed", the maker is immediately published;
 * otherwise they're created as a draft.
 * 
 * @param data - Maker fields (excludes server-generated id/timestamps/publishedFlag)
 * @returns Promise<Maker> - The newly created maker
 * @throws {ApiError} - If creation fails (validation, network, auth)
 * 
 * @example
 * ```tsx
 * const newMaker = await createMaker({
 *   name: 'Julie Fiuga',
 *   slug: 'julie-fiuga',
 *   village: 'Taro',
 *   province: 'Choiseul Province',
 *   island: 'Choiseul',
 *   consentStatus: 'Signed',
 *   // ... other fields
 * });
 * ```
 */
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
    published_flag: data.consentStatus === 'Signed',
    age: data.age,
    years_active: data.yearsActive,
    craft: data.craftId ? parseInt(data.craftId) : null,
    portrait_url: data.portraitUrl ?? '',
    portrait_alt: data.portraitAlt ?? '',
  }, token);
  return mapMaker(raw);
}

/**
 * Update an existing maker.
 * 
 * Admin-only, requires auth token. Only provided fields are updated (partial
 * update). When consentStatus changes, publishedFlag is auto-synced: "Signed"
 * → published, anything else → unpublished.
 * 
 * @param id - Maker ID
 * @param data - Partial maker fields to update
 * @returns Promise<Maker | null> - Updated maker, or null if not found
 * @throws {ApiError} - If update fails (validation, network, auth)
 * 
 * @example
 * ```tsx
 * await updateMaker(maker.id, {
 *   consentStatus: 'Signed', // This will also set publishedFlag = true
 *   story: 'Updated story text',
 * });
 * ```
 */
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
  if (data.consentStatus !== undefined) {
    body.consent_status = data.consentStatus;
    // Auto-publish when consent is signed, unpublish when not
    body.published_flag = data.consentStatus === 'Signed';
  }
  if (data.age !== undefined) body.age = data.age;
  if (data.yearsActive !== undefined) body.years_active = data.yearsActive;
  if (data.craftId !== undefined) body.craft = data.craftId ? parseInt(data.craftId) : null;
  if (data.portraitUrl !== undefined) body.portrait_url = data.portraitUrl ?? '';
  if (data.portraitAlt !== undefined) body.portrait_alt = data.portraitAlt ?? '';

  const raw = await apiPatch<WagtailMakerResponse>(`/api/write/makers/${id}/`, body, token);
  return mapMaker(raw);
}

/**
 * Delete a maker permanently.
 * 
 * Admin-only, requires auth token. This is destructive and cannot be undone.
 * The maker and all their metadata are removed from the database. Products
 * linked to this maker may have their makerId field orphaned (depending on
 * backend cascade rules).
 * 
 * @param id - Maker ID to delete
 * @returns Promise<boolean> - true if deleted, false if delete failed
 * 
 * @example
 * ```tsx
 * if (!confirm(`Delete ${maker.name}?`)) return;
 * const success = await deleteMaker(maker.id);
 * if (success) toast('Maker deleted');
 * ```
 */
export async function deleteMaker(id: string): Promise<boolean> {
  const token = getAdminToken();
  try {
    await apiDelete(`/api/write/makers/${id}/`, token);
    return true;
  } catch {
    return false;
  }
}

/**
 * Toggle a maker's consent status between "Signed" and "Not Signed".
 * 
 * Convenience wrapper around updateMaker for the consent toggle button on the
 * admin makers page. When consent is set to "Signed", the maker is auto-published;
 * when set to anything else, they're unpublished.
 * 
 * @param id - Maker ID
 * @param status - New consent status ("Signed" | "Not Signed")
 * @returns Promise<Maker | null> - Updated maker
 * 
 * @example
 * ```tsx
 * const newStatus = maker.consentStatus === 'Signed' ? 'Not Signed' : 'Signed';
 * await setConsentStatus(maker.id, newStatus);
 * ```
 */
export async function setConsentStatus(id: string, status: ConsentStatus): Promise<Maker | null> {
  return updateMaker(id, { consentStatus: status });
}

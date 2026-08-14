import { apiGet, apiPut, getAdminToken } from '@/lib/api-client';
import type { SiteContent } from '@/types';

const EMPTY_SITE_CONTENT: SiteContent = {
  // Images
  aboutSolomonIslandsImage: '',
  aboutSolomonIslandsImageAlt: '',
  aboutTeamImage: '',
  aboutTeamImageAlt: '',
  whyWeDoThisImage: '',
  whyWeDoThisImageAlt: '',
  // Homepage
  homepageHeading: '',
  homepageIntro: '',
  homepageCtaText: '',
  homepageMakersHeading: '',
  homepageMakersIntro: '',
  // About
  aboutPageIntro: '',
  aboutSolomonIslandsText: '',
  aboutTeamText: '',
  aboutWhyText: '',
  // Wholesale
  wholesaleIntro: '',
  wholesaleHowItWorks: '',
  wholesaleMinimumOrder: '',
  // Care Guide
  careGuideIntro: '',
  careGuidePandanus: '',
  careGuideWood: '',
  careGuideShell: '',
  // Contact
  contactIntro: '',
  contactEmail: '',
  contactResponseTime: '',
};

function mapSiteContent(raw: Record<string, unknown>): SiteContent {
  const result = { ...EMPTY_SITE_CONTENT };
  for (const key of Object.keys(result) as (keyof SiteContent)[]) {
    if (typeof raw[key] === 'string') {
      result[key] = raw[key] as string;
    }
  }
  return result;
}

export async function getSiteContent(): Promise<SiteContent> {
  const raw = await apiGet<Record<string, unknown>>('/api/site-content/');
  // If backend returns an unexpected shape, treat as failure
  if (!raw || Array.isArray(raw)) {
    throw new Error('Failed to load site content: invalid response');
  }
  return mapSiteContent(raw);
}

/**
 * Safe variant for public pages — returns empty defaults on failure
 * so the page can still render with fallback copy.
 */
export async function getSiteContentSafe(): Promise<SiteContent> {
  try {
    return await getSiteContent();
  } catch {
    return EMPTY_SITE_CONTENT;
  }
}

export async function updateSiteContent(data: Partial<SiteContent>): Promise<SiteContent> {
  const token = getAdminToken();
  const raw = await apiPut<Record<string, unknown>>('/api/site-content/', data, token);
  return mapSiteContent(raw);
}

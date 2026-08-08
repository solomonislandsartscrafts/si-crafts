import { apiGet, apiPut, getAdminToken } from '@/lib/api-client';
import type { SiteContent } from '@/types';

interface SiteContentResponse {
  aboutSolomonIslandsImage: string;
  aboutSolomonIslandsImageAlt: string;
  aboutTeamImage: string;
  aboutTeamImageAlt: string;
  whyWeDoThisImage: string;
  whyWeDoThisImageAlt: string;
}

function mapSiteContent(raw: SiteContentResponse): SiteContent {
  return {
    aboutSolomonIslandsImage: raw.aboutSolomonIslandsImage || '',
    aboutSolomonIslandsImageAlt: raw.aboutSolomonIslandsImageAlt || '',
    aboutTeamImage: raw.aboutTeamImage || '',
    aboutTeamImageAlt: raw.aboutTeamImageAlt || '',
    whyWeDoThisImage: raw.whyWeDoThisImage || '',
    whyWeDoThisImageAlt: raw.whyWeDoThisImageAlt || '',
  };
}

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const raw = await apiGet<SiteContentResponse>('/api/site-content/');
    // If backend is unreachable, apiGet returns [] — handle gracefully
    if (!raw || Array.isArray(raw)) {
      return {
        aboutSolomonIslandsImage: '',
        aboutSolomonIslandsImageAlt: '',
        aboutTeamImage: '',
        aboutTeamImageAlt: '',
        whyWeDoThisImage: '',
        whyWeDoThisImageAlt: '',
      };
    }
    return mapSiteContent(raw);
  } catch {
    return {
      aboutSolomonIslandsImage: '',
      aboutSolomonIslandsImageAlt: '',
      aboutTeamImage: '',
      aboutTeamImageAlt: '',
      whyWeDoThisImage: '',
      whyWeDoThisImageAlt: '',
    };
  }
}

export async function updateSiteContent(data: Partial<SiteContent>): Promise<SiteContent> {
  const token = getAdminToken();
  const raw = await apiPut<SiteContentResponse>('/api/site-content/', data, token);
  return mapSiteContent(raw);
}

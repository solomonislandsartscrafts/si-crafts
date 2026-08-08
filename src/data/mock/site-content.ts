import type { SiteContent } from '@/types';

export let mockSiteContent: SiteContent = {
  aboutSolomonIslandsImage: '',
  aboutSolomonIslandsImageAlt: '',
  aboutTeamImage: '',
  aboutTeamImageAlt: '',
  whyWeDoThisImage: '',
  whyWeDoThisImageAlt: '',
};

/** Update mock site content in-memory (for admin form saves). */
export function setMockSiteContent(data: Partial<SiteContent>): void {
  mockSiteContent = { ...mockSiteContent, ...data };
}

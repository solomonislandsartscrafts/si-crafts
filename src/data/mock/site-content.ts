import type { SiteContent } from '@/types';

export let mockSiteContent: SiteContent = {
  aboutSolomonIslandsImage: '',
  aboutSolomonIslandsImageAlt: '',
  aboutTeamImage: '',
  aboutTeamImageAlt: '',
  whyWeDoThisImage: '',
  whyWeDoThisImageAlt: '',
  homepageHeading: '',
  homepageIntro: '',
  homepageCtaText: '',
  homepageMakersHeading: '',
  homepageMakersIntro: '',
  aboutPageIntro: '',
  aboutSolomonIslandsText: '',
  aboutTeamText: '',
  aboutWhyText: '',
  wholesaleIntro: '',
  wholesaleHowItWorks: '',
  wholesaleMinimumOrder: '',
  careGuideIntro: '',
  careGuidePandanus: '',
  careGuideWood: '',
  careGuideShell: '',
  contactIntro: '',
  contactEmail: '',
  contactResponseTime: '',
};

/** Update mock site content in-memory (for admin form saves). */
export function setMockSiteContent(data: Partial<SiteContent>): void {
  mockSiteContent = { ...mockSiteContent, ...data };
}

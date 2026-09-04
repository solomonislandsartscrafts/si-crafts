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
  aboutPageIntro: '',
  aboutSolomonIslandsHeading: '',
  aboutSolomonIslandsText: '',
  aboutSolomonIslandsLinkText: '',
  aboutSolomonIslandsLinkUrl: '',
  aboutTeamHeading: '',
  aboutTeamText: '',
  aboutTeamLinkText: '',
  aboutTeamLinkUrl: '',
  aboutWhyHeading: '',
  aboutWhyText: '',
  aboutWhyLinkText: '',
  aboutWhyLinkUrl: '',
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

export interface SiteContent {
  // About page images
  aboutSolomonIslandsImage: string;
  aboutSolomonIslandsImageAlt: string;
  aboutTeamImage: string;
  aboutTeamImageAlt: string;
  whyWeDoThisImage: string;
  whyWeDoThisImageAlt: string;

  // Homepage
  homepageHeading: string;
  homepageIntro: string;
  homepageCtaText: string;
  homepageMakersHeading: string;
  homepageMakersIntro: string;

  // About page text
  aboutPageIntro: string;
  aboutSolomonIslandsHeading: string;
  aboutSolomonIslandsText: string;
  aboutSolomonIslandsLinkText: string;
  aboutSolomonIslandsLinkUrl: string;
  aboutTeamHeading: string;
  aboutTeamText: string;
  aboutTeamLinkText: string;
  aboutTeamLinkUrl: string;
  aboutWhyHeading: string;
  aboutWhyText: string;
  aboutWhyLinkText: string;
  aboutWhyLinkUrl: string;

  // NOTE: the catalogue, news and stockists intros are NOT here. They used to
  // be, but they were never added to the Django model or serializer, so the
  // admin form silently discarded every edit. They now live in the site-text
  // manifest (catalogue.intro, news.intro, stockists.intro), which does persist.

  // Wholesale
  wholesaleIntro: string;
  wholesaleHowItWorks: string;
  wholesaleMinimumOrder: string;

  // Care Guide
  careGuideIntro: string;
  careGuidePandanus: string;
  careGuideWood: string;
  careGuideShell: string;

  // Contact
  contactIntro: string;
  contactEmail: string;
  contactResponseTime: string;
}

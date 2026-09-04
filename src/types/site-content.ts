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

  /**
   * The hero H1 — NOT the makers section heading, despite the name. The makers
   * section takes its heading from the `homepage.makersHeading` site-text key.
   * `homepageHeading` above is the hero eyebrow. Both names read backwards from
   * where they render; the admin form labels them correctly, and fixing the
   * names would need a Django migration.
   */
  homepageMakersHeading: string;

  // NOTE: homepageMakersIntro is intentionally absent. The Django model still
  // has the `homepage_makers_intro` column (dropping it would need a
  // destructive migration), but the field had no admin input AND no render on
  // the homepage — it was reachable from nothing. `mapSiteContent` only copies
  // keys it finds on its own defaults object, so the backend can keep sending
  // it and the frontend simply ignores it.

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

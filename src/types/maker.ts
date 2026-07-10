import type { CulturalReviewStatus } from './common';

export type ConsentStatus = 'Signed' | 'Not Signed';

export interface Maker {
  id: string;
  slug: string;
  name: string;
  village: string;
  province: string;
  island: string;
  portraitUrl: string | null;
  story: string | null;
  storyCulturalReviewFlag: CulturalReviewStatus;
  craftId: string;
  consentStatus: ConsentStatus;
  publishedFlag: boolean;
  createdAt: string;
  updatedAt: string;
}

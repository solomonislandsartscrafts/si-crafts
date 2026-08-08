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
  portraitAlt: string;
  story: string | null;
  storyCulturalReviewFlag: CulturalReviewStatus;
  craftId: string;
  consentStatus: ConsentStatus;
  publishedFlag: boolean;
  age: number | null;
  yearsActive: number | null;
  pieceCount: number | null;
  createdAt: string;
  updatedAt: string;
}

import type { CulturalReviewStatus } from './common';
import type { MaterialCategory } from './product';

export interface Craft {
  id: string;
  slug: string;
  name: string;
  description: string;
  processImageUrls: string[];
  culturalContext: string | null;
  culturalContextReviewFlag: CulturalReviewStatus;
  materialCategory: MaterialCategory;
}

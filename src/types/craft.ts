import type { CulturalReviewStatus } from './common';
import type { MaterialCategory } from './product';

export interface Craft {
  id: string;
  slug: string;
  name: string;
  description: string;
  processImageUrls: string[];
  processImageAlt: string;
  culturalContext: string | null;
  culturalContextReviewFlag: CulturalReviewStatus;
  materialCategory: MaterialCategory;
  /** Slugs of related news articles, in order; `[]` when none. Resolved via getArticleBySlug. */
  relatedArticleSlugs: string[];
}

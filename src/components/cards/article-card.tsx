import { formatArticleDate } from '@/lib/format-date';
import type { Article } from '@/types';
import {
  PosterCard,
  posterMutedClasses,
  posterTitleClasses,
  posterBodyClasses,
} from './poster-card';

interface ArticleCardProps {
  article: Article;
}

/**
 * Article card — the shared poster frame with the date, headline, and excerpt
 * below it.
 *
 * Composes `PosterCard` like every other public content card, so news cannot
 * drift into its own card shape. `cover` fit: a cover photograph is framed
 * expecting a crop, unlike a product shot. The first tag becomes the pill.
 *
 * Listings use `posterGridClasses` — the same grid as products, makers, and
 * crafts.
 */
export function ArticleCard({ article }: ArticleCardProps) {
  const date = article.publishedAt || article.createdAt;

  return (
    <PosterCard
      href={`/news/${article.slug}`}
      src={article.coverImageUrl ?? null}
      alt={article.title}
      fit="cover"
      pill={article.tags?.[0]}
    >
      <p className={posterMutedClasses}>{formatArticleDate(date)}</p>
      <h3 className={`mt-1 ${posterTitleClasses} line-clamp-2`}>{article.title}</h3>
      {article.excerpt && <p className={`mt-1 ${posterBodyClasses}`}>{article.excerpt}</p>}
    </PosterCard>
  );
}

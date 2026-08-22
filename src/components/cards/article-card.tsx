import { formatArticleDate } from '@/lib/format-date';
import type { Article } from '@/types';
import {
  ARTICLE_ASPECT,
  PosterCard,
  posterMetaClasses,
  posterHeadlineClasses,
} from './poster-card';

interface ArticleCardProps {
  article: Article;
}

/**
 * News card — landscape cover photo, then the date, headline and standfirst.
 *
 * Still the shared `PosterCard`, so the chrome (white surface, `shadow-card`,
 * `rounded-lg`, shadow on hover, whole card one link) cannot drift from the rest
 * of the site. Only two things differ from a product or maker tile, and both are
 * what make it read as news: the 3:2 frame, and a headline at the full card
 * heading size with the date above it.
 *
 * `cover` fit — a cover photograph is a scene, framed expecting a crop, unlike a
 * product shot. The first tag becomes the pill.
 *
 * Listings use `articleGridClasses`, which is one column on a phone rather than
 * the 2-up the portrait cards use.
 */
export function ArticleCard({ article }: ArticleCardProps) {
  const date = article.publishedAt || article.createdAt;

  return (
    <PosterCard
      href={`/news/${article.slug}`}
      src={article.coverImageUrl ?? null}
      alt={article.title}
      fit="cover"
      aspect={ARTICLE_ASPECT}
      pill={article.tags?.[0]}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    >
      {/* The date leads, as it does on any news list: a story's age is the first
          thing a reader wants. `posterMetaClasses` rather than the muted grey —
          at 4.7:1 the muted tone is borderline for a line that carries meaning. */}
      <p className={posterMetaClasses}>{formatArticleDate(date)}</p>
      <h3 className={`mt-1 ${posterHeadlineClasses} line-clamp-2`}>{article.title}</h3>
      {/* Three lines, not the two a product caption gets. A standfirst is doing
          real work here — it is what decides whether the story gets opened. */}
      {article.excerpt && (
        <p className="mt-2 text-base leading-body text-warm-gray-600 line-clamp-3">
          {article.excerpt}
        </p>
      )}
    </PosterCard>
  );
}

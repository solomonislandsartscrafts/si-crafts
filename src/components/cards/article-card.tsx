import { Newspaper } from 'lucide-react';
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
 * Branded stand-in for a news card with no cover photo. A deep-blue band (the
 * same fill the pill and CTA use) carrying a newspaper glyph and, if present,
 * the article's first tag — so an imageless story reads as an intentional
 * editorial card rather than the generic grey "image missing" well. Shared by
 * both `ArticleCard` and `FeaturedArticleCard` via `PosterFrame`'s `fallback`.
 */
export function ArticleImageFallback({ tag }: { tag?: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2xs bg-deep-blue text-white/90">
      <Newspaper className="w-6 h-6" aria-hidden="true" />
      {tag && (
        <span className="text-xs font-medium uppercase tracking-wide text-white/80">
          {tag}
        </span>
      )}
    </div>
  );
}

/**
 * News card — cover photo, then the date, headline and standfirst.
 *
 * Still the shared `PosterCard`, so the chrome (white surface, `shadow-card`,
 * shadow on hover, whole card one link) cannot drift from the rest of the site.
 * What makes it read as news is both the FRAME — a 16:9 landscape thumbnail, the
 * shape every news list uses — and the CAPTION: a date kicker, a headline at the
 * full card-heading size, and a three-line standfirst.
 *
 * `cover` fit — a cover photograph is a scene, framed expecting a crop, unlike a
 * product shot. The first tag becomes the pill. When there is no cover, a
 * branded deep-blue `ArticleImageFallback` shows instead of the grey well.
 *
 * Listings use `articleGridClasses` (one column on a phone, since a news card's
 * caption is much taller than a product's), or `centeredArticleGridClasses` when
 * there are fewer than three stories to show.
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
      fallback={<ArticleImageFallback tag={article.tags?.[0]} />}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    >
      {/* The date leads, as it does on any news list: a story's age is the first
          thing a reader wants. `posterMetaClasses` rather than the muted grey —
          at 4.7:1 the muted tone is borderline for a line that carries meaning. */}
      <p className={posterMetaClasses}>{formatArticleDate(date)}</p>
      <h3 className={`mt-3xs ${posterHeadlineClasses} line-clamp-2`}>{article.title}</h3>
      {/* Three lines, not the two a product caption gets. A standfirst is doing
          real work here — it is what decides whether the story gets opened. */}
      {article.excerpt && (
        <p className="mt-2xs text-base leading-body text-warm-gray-600 line-clamp-3">
          {article.excerpt}
        </p>
      )}
    </PosterCard>
  );
}

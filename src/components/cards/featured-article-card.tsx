import Link from 'next/link';
import { Clock } from 'lucide-react';
import { formatArticleDate } from '@/lib/format-date';
import type { Article } from '@/types';
import { PosterFrame, ARTICLE_ASPECT, posterMetaClasses } from './poster-card';
import { ArticleImageFallback } from './article-card';

interface FeaturedArticleCardProps {
  article: Article;
}

/**
 * Featured (lead) news card — the editorial answer to a short news list.
 *
 * A news index that only ever holds a handful of stories looks empty in a
 * multi-column grid: the row visibly wants cards that do not exist. Leading with
 * one large horizontal card fills the width honestly and makes the newest story
 * read as news, then the remaining items sit in the normal grid below.
 *
 * Composes the shared `PosterFrame` (same white surface, `shadow-card`,
 * `rounded-lg`, hover shadow, `ARTICLE_ASPECT` 16:9 cover) so the chrome cannot
 * drift from `ArticleCard`. The only difference is the layout: image and text
 * sit side by side from `md:` up, and stack on a phone. The whole card is one
 * link.
 */
export function FeaturedArticleCard({ article }: FeaturedArticleCardProps) {
  const date = article.publishedAt || article.createdAt;

  return (
    <Link
      href={`/news/${article.slug}`}
      className="group grid grid-cols-1 items-center gap-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean md:grid-cols-2 md:gap-lg"
    >
      <PosterFrame
        src={article.coverImageUrl ?? null}
        alt={article.coverImageAlt || article.title}
        fit="cover"
        aspect={ARTICLE_ASPECT}
        pill={article.tags?.[0]}
        fallback={<ArticleImageFallback tag={article.tags?.[0]} />}
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
      />

      <div>
        {/* Date leads, as on any news list, then the same reading-time metadata
            the article page shows — this is the lead story, so it earns the
            fuller byline. */}
        <div className={`flex flex-wrap items-center gap-xs ${posterMetaClasses}`}>
          <span>{formatArticleDate(date)}</span>
          {article.readingTimeMinutes > 0 && (
            <>
              <span className="text-warm-gray-400" aria-hidden="true">
                ·
              </span>
              <span className="flex items-center gap-3xs text-warm-gray-400">
                <Clock className="w-4 h-4" />
                {article.readingTimeMinutes} min read
              </span>
            </>
          )}
        </div>

        {/* h2 rather than the grid card's h3: this is the single most prominent
            story on the page, sized one step down from the section heading. */}
        <h2 className="mt-2xs font-heading text-2xl md:text-3xl font-medium leading-heading text-deep-blue line-clamp-3 transition-colors duration-200 group-hover:text-ocean">
          {article.title}
        </h2>

        {article.excerpt && (
          <p className="mt-sm text-base leading-body text-warm-gray-600 line-clamp-3">
            {article.excerpt}
          </p>
        )}

        {/* Not a real button — the whole card is the link — but a visible
            affordance so the lead card reads as clickable. */}
        <span className="mt-md inline-flex items-center gap-2xs font-medium text-ocean group-hover:text-ocean-dark">
          Read the story
          <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-3xs">
            &rarr;
          </span>
        </span>
      </div>
    </Link>
  );
}

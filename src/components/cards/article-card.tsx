import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';
import { formatArticleDate } from '@/lib/format-date';
import type { Article } from '@/types';

/**
 * Article card — used on /news and on the homepage "Latest news" section, which
 * previously each had their own copy with different date formats and heading
 * sizes.
 *
 * Card chrome matches ProductCard/MakerCard: white surface, shadow-card,
 * rounded-lg, shadow deepening on hover.
 */
interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const date = article.publishedAt || article.createdAt;
  const tag = article.tags?.[0];

  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex flex-col h-full overflow-hidden rounded-lg bg-card-bg shadow-card hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-ocean"
    >
      <article className="flex flex-col h-full">
        <div className="aspect-[3/2] relative overflow-hidden bg-sand-light">
          <SafeImage
            src={article.coverImageUrl}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
          />
        </div>

        <div className="flex flex-col flex-1 p-4">
          <p className="text-xs text-warm-gray-400 mb-1.5">
            {formatArticleDate(date)}
            {tag && (
              <>
                {' '}
                in <span className="text-ocean">{tag}</span>
              </>
            )}
          </p>
          <h3 className="font-heading text-lg font-semibold text-deep-blue group-hover:text-ocean transition-colors leading-snug mb-2">
            {article.title}
          </h3>
          <p className="text-base text-warm-gray-600 leading-relaxed line-clamp-3">
            {article.excerpt}
          </p>
          <span className="text-base font-medium text-ocean group-hover:text-ocean-dark transition-colors mt-3">
            Read more →
          </span>
        </div>
      </article>
    </Link>
  );
}

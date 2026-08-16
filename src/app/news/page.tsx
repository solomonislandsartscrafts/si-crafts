import Link from 'next/link';
import { generatePageMetadata } from '@/lib/metadata';
import { getPublishedArticles } from '@/services/articles';
import { PageHeader } from '@/components/layout/page-header';
import { SafeImage } from '@/components/ui/safe-image';
import type { Article } from '@/types';

export const metadata = generatePageMetadata({
  title: 'News',
  description: 'Stories, updates, and behind-the-scenes from Solomon Islands Arts & Crafts.',
  path: '/news',
});

/** Format relative time */
function timeAgo(dateStr: string): string {
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return '1 month ago';
  if (months < 12) return `${months} months ago`;
  const years = Math.floor(months / 12);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

function ArticleCard({ article }: { article: Article }) {
  const date = article.publishedAt || article.createdAt;
  const tag = article.tags?.[0];

  return (
    <Link href={`/news/${article.slug}`} className="group block">
      <article>
        {article.coverImageUrl && (
          <div className="aspect-[3/2] relative overflow-hidden rounded-md mb-3">
            <SafeImage
              src={article.coverImageUrl}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            />
          </div>
        )}
        <h3 className="font-heading text-base sm:text-lg font-semibold text-deep-blue group-hover:text-ocean transition-colors leading-snug mb-1">
          {article.title}
        </h3>
        <p className="text-xs text-warm-gray-400 mb-2">
          {timeAgo(date)}
          {tag && (
            <>
              {' '}in <span className="text-ocean">{tag}</span>
            </>
          )}
        </p>
        <p className="text-sm text-warm-gray-600 leading-relaxed line-clamp-4">
          {article.excerpt}
        </p>
      </article>
    </Link>
  );
}

export default async function NewsPage() {
  const articles = await getPublishedArticles();

  if (articles.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 page-y">
        <div className="text-center py-12">
          <h1 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-4">News</h1>
          <p className="text-warm-gray-600">No articles published yet. Check back soon for stories and updates from Solomon Islands Arts & Crafts.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="News"
        intro="Stories and updates from Solomon Islands Arts & Crafts — makers, crafts, and the people we work with."
      />

      {/* Articles grid — left-aligned */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </div>
  );
}

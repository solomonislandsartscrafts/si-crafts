import Link from 'next/link';
import Image from 'next/image';
import { generatePageMetadata } from '@/lib/metadata';
import { getPublishedArticles } from '@/services/articles';
import { NewsSidebar } from '@/components/news/news-sidebar';
import type { Article } from '@/types';

export const metadata = generatePageMetadata({
  title: 'News',
  description: 'Stories, updates, and behind-the-scenes from Solomon Islands Arts and Crafts.',
  path: '/news',
});

/** Extract unique tags from all articles */
function getAllTags(articles: Article[]): string[] {
  const tagSet = new Set<string>();
  articles.forEach((a) => a.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).slice(0, 8);
}

/** Format relative time */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
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

/** Distribute articles across three columns */
function distributeArticles(articles: Article[]): { col1: Article[]; col2: Article[]; col3: Article[] } {
  const col1: Article[] = [];
  const col2: Article[] = [];
  const col3: Article[] = [];
  articles.forEach((article, i) => {
    if (i % 3 === 0) col1.push(article);
    else if (i % 3 === 1) col2.push(article);
    else col3.push(article);
  });
  return { col1, col2, col3 };
}

function ArticleCard({ article }: { article: Article }) {
  const date = article.publishedAt || article.createdAt;
  const tag = article.tags[0];

  return (
    <Link href={`/news/${article.slug}`} className="group block">
      <article>
        {article.coverImageUrl && (
          <div className="aspect-[4/3] relative overflow-hidden rounded-md bg-sand-light mb-3">
            <Image
              src={article.coverImageUrl}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            />
          </div>
        )}
        <h3 className="font-heading text-base sm:text-lg font-bold text-deep-blue group-hover:text-ocean transition-colors leading-snug mb-1">
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
  const allTags = getAllTags(articles);
  const { col1, col2, col3 } = distributeArticles(articles);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-section-lg">
      {/* Grid: sidebar (left, desktop only) | 3 article columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[220px_1fr_1fr_1fr] gap-8 lg:gap-10">
        {/* Sidebar — tags only on index */}
        <NewsSidebar tags={allTags} otherArticles={[]} />

        {/* Article column 1 */}
        <div className="space-y-10">
          {col1.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {/* Article column 2 */}
        <div className="space-y-10">
          {col2.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {/* Article column 3 */}
        <div className="space-y-10">
          {col3.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>

      {/* Load More */}
      <div className="mt-14 text-center border-t border-sand pt-8">
        <button
          className="tap-target inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-warm-gray-800 border border-sand-dark rounded-full hover:bg-sand-light transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
        >
          + Load More
        </button>
      </div>
    </div>
  );
}

import Link from 'next/link';
import type { Article } from '@/types';

interface NewsSidebarProps {
  /** Tags to display as recommended topics */
  tags: string[];
  /** Other articles to suggest (excluding current) */
  otherArticles: Article[];
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

export function NewsSidebar({ tags, otherArticles }: NewsSidebarProps) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 space-y-8">
        {/* Recommended tags */}
        {tags.length > 0 && (
          <div>
            <h2 className="font-heading text-sm font-bold text-deep-blue uppercase tracking-wide mb-3">
              Topics
            </h2>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium text-warm-gray-800 bg-sand-light px-3 py-1.5 rounded-full border border-sand"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Other articles to read — title-only links */}
        {otherArticles.length > 0 && (
          <div className="border-t border-sand pt-6">
            <h2 className="font-heading text-sm font-bold text-deep-blue uppercase tracking-wide mb-4">
              More to read
            </h2>
            <div className="space-y-4">
              {otherArticles.slice(0, 5).map((article) => {
                const date = article.publishedAt || article.createdAt;
                const tag = article.tags[0];

                return (
                  <Link
                    key={article.id}
                    href={`/news/${article.slug}`}
                    className="group block"
                  >
                    <h3 className="font-heading text-sm font-semibold text-deep-blue group-hover:text-ocean transition-colors leading-snug mb-0.5">
                      {article.title}
                    </h3>
                    <p className="text-xs text-warm-gray-400">
                      {timeAgo(date)}
                      {tag && (
                        <>
                          {' '}in <span className="text-ocean">{tag}</span>
                        </>
                      )}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

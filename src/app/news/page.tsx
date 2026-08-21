import { Newspaper } from 'lucide-react';
import { generatePageMetadata } from '@/lib/metadata';
import { getPublishedArticles } from '@/services/articles';
import { PageHeader } from '@/components/layout/page-header';
import { ArticleCard } from '@/components/cards/article-card';
import { EmptyState } from '@/components/ui/empty-state';
import { ButtonLink } from '@/components/ui/button';

export const metadata = generatePageMetadata({
  title: 'News',
  description: 'Stories, updates, and behind-the-scenes from Solomon Islands Arts Crafts.',
  path: '/news',
});

export default async function NewsPage() {
  const articles = await getPublishedArticles();

  return (
    <div>
      {/* One title treatment regardless of whether there are articles. The
          empty branch previously hand-rolled a smaller, centred h1. */}
      <PageHeader
        title="News"
        intro="Stories and updates from Solomon Islands Arts Crafts — makers, crafts, and the people we work with."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
        {articles.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title="No articles published yet."
            description="Check back soon for stories and updates from Solomon Islands Arts Crafts."
            action={
              <ButtonLink href="/makers" variant="secondary" size="sm">
                Meet the makers
              </ButtonLink>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

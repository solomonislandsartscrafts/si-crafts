import { Newspaper } from 'lucide-react';
import { generatePageMetadata } from '@/lib/metadata';
import { getPublishedArticles } from '@/services/articles';
import { getSiteTextSafe } from '@/services/site-text';
import { PageHeader } from '@/components/layout/page-header';
import { ArticleCard } from '@/components/cards/article-card';
import { articleGridClasses } from '@/components/cards/poster-card';
import { EmptyState } from '@/components/ui/empty-state';
import { ButtonLink } from '@/components/ui/button';

export const metadata = generatePageMetadata({
  title: 'News',
  description: 'Stories, updates, and behind-the-scenes from Solomon Islands Arts & Crafts.',
  path: '/news',
});

export default async function NewsPage() {
  const [articles, text] = await Promise.all([getPublishedArticles(), getSiteTextSafe()]);

  return (
    <div>
      {/* One title treatment regardless of whether there are articles. The
          empty branch previously hand-rolled a smaller, centred h1. */}
      <PageHeader title={text['news.title']} intro={text['news.intro']} />

      <div className="site-container pb-10 lg:pb-20">
        {articles.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title={text['news.emptyTitle']}
            description={text['news.emptyDescription']}
            action={
              <ButtonLink href="/makers" variant="secondary" size="sm">
                Meet the makers
              </ButtonLink>
            }
          />
        ) : (
          <div className={articleGridClasses}>
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

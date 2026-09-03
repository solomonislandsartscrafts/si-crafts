import { Newspaper } from 'lucide-react';
import { generatePageMetadata } from '@/lib/metadata';
import { getPublishedArticles } from '@/services/articles';
import { getSiteTextSafe } from '@/services/site-text';
import { PageHeader } from '@/components/layout/page-header';
import { PageCta } from '@/components/layout/page-cta';
import { ArticleCard } from '@/components/cards/article-card';
import { FeaturedArticleCard } from '@/components/cards/featured-article-card';
import { articleGridClasses, centeredArticleGridClasses } from '@/components/cards/poster-card';
import { EmptyState } from '@/components/ui/empty-state';
import { ButtonLink } from '@/components/ui/button';

export const metadata = generatePageMetadata({
  title: 'News',
  description: 'Stories, updates, and behind-the-scenes from Solomon Islands Arts & Crafts.',
  path: '/news',
});

export default async function NewsPage() {
  const [articles, text] = await Promise.all([getPublishedArticles(), getSiteTextSafe()]);

  // The layout is count-aware. The featured lead card only earns its place when
  // there are enough stories to fill the grid row beneath it — otherwise the
  // leftover cards sit alone and the two card styles read as mismatched rather
  // than as a deliberate hero + grid. The grid caps at 3 columns, so the
  // threshold is 1 (featured) + 3 = 4 articles.
  //
  // Below the threshold every article is an equal card in a centred grid, so a
  // one- or two-story list stays balanced instead of hugging the left edge.
  const FEATURED_THRESHOLD = 4;
  const useFeatured = articles.length >= FEATURED_THRESHOLD;

  // Prefer an editor-flagged `featured` article; otherwise the first (most
  // recent) one. `getPublishedArticles` already returns them newest-first.
  const featured = useFeatured ? (articles.find((a) => a.featured) ?? articles[0]) : null;
  const rest = featured ? articles.filter((a) => a.id !== featured.id) : articles;

  return (
    <div>
      <PageHeader
        banner="green"
        eyebrow="Stories & updates"
        title={text['news.title']}
        intro={text['news.intro']}
      />

      <div className="site-container pb-section">
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
          <>
            {featured && <FeaturedArticleCard article={featured} />}

            {/* With a featured lead, the rest fill a full-width 3-up grid a
                block-step below it. Without one (a short list), every article is
                an equal card in the centred, capped grid so 1–2 cards stay
                balanced rather than hugging the left edge. */}
            {rest.length > 0 && (
              <div
                role="list"
                aria-label="News articles"
                className={`${featured ? `${articleGridClasses} mt-block` : centeredArticleGridClasses}`}
              >
                {rest.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Closing CTA fills the vertical space below a short list and gives the
          page a natural exit, bookending it with the deep-blue footer. */}
      <PageCta
        heading={text['news.cta.title']}
        description={text['news.cta.description']}
      >
        <ButtonLink href="/makers" variant="primary">
          Meet the makers
        </ButtonLink>
        <ButtonLink href="/catalogue" variant="secondary">
          Browse the catalogue
        </ButtonLink>
      </PageCta>
    </div>
  );
}

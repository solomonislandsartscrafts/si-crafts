import Link from 'next/link';
import { Clock } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getPublishedArticles } from '@/services/articles';
import { renderArticleHtml } from '@/lib/article-html';
import { generatePageMetadata, toPlainDescription } from '@/lib/metadata';
import { resolveImageUrl } from '@/lib/api-client';
import type { Metadata } from 'next';
import { ShareButtons } from '@/components/shared/share-buttons';
import { NewsSidebar } from '@/components/news/news-sidebar';
import { ReadingProgress } from '@/components/news/reading-progress';
import { DetailPageLayout } from '@/components/layout/detail-page-layout';
import { pageTitleClasses } from '@/components/layout/page-header';
import { SafeImage } from '@/components/ui/safe-image';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { formatArticleDate } from '@/lib/format-date';

export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Per-article metadata. Without this the whole /news section shared the root
 * layout's title and description, so every story looked like a duplicate of the
 * homepage to a crawler and none of them could rank for their own subject.
 */
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  // notFound() is the page's job, not metadata's. Returning a plain title keeps
  // the 404 from inheriting a misleading one.
  if (!article) return { title: 'Article not found' };

  return generatePageMetadata({
    title: article.title,
    description: toPlainDescription(article.excerpt),
    path: `/news/${article.slug}`,
    imageUrl: resolveImageUrl(article.coverImageUrl) || undefined,
    type: 'article',
    publishedTime: article.publishedAt || article.createdAt || undefined,
    modifiedTime: article.updatedAt || undefined,
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const [article, allArticles] = await Promise.all([
    getArticleBySlug(slug),
    getPublishedArticles(),
  ]);

  if (!article) {
    notFound();
  }

  // Other articles for the sidebar (exclude current)
  const otherArticles = allArticles.filter((a) => a.id !== article.id);

  // All tags for topic chips
  const allTags = Array.from(
    new Set(allArticles.flatMap((a) => a.tags ?? []))
  ).slice(0, 8);

  return (
    <div className="site-container page-y">
      {/* Reading-progress bar, tracking the article body below. */}
      <ReadingProgress targetId="article-body" />

      {/* Grid: sidebar (left, desktop only) | article content */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-block">
        {/* Sidebar — shows other articles to read */}
        <NewsSidebar tags={allTags} otherArticles={otherArticles} />

        {/* Article content */}
        <article id="article-body" className="max-w-3xl">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { name: 'Home', url: '/' },
              { name: 'News', url: '/news' },
              { name: article.title },
            ]}
            className="mb-stack"
          />

          {/* Article header */}
          <header className="mb-block">
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2xs mb-sm">
              {(article.tags ?? []).map((tag) => (
                <span key={tag} className="text-xs font-medium text-ocean bg-ocean/10 px-2xs py-3xs rounded">
                  {tag}
                </span>
              ))}
            </div>

            {/* Title. Uses the shared page-title treatment rather than a
                bespoke, larger scale — this was the biggest h1 on the site. */}
            <h1 className={`${pageTitleClasses} mb-md`}>{article.title}</h1>

            <div className="flex items-center justify-between mt-md">
              {/* All three read as content, so they sit at warm-gray-600
                  (secondary body text). Only the dot separators stay muted at
                  warm-gray-400 — they are decoration, not information. */}
              <div className="flex items-center gap-sm text-sm text-warm-gray-600">
                <span className="font-medium">{article.authorName}</span>
                <span className="text-warm-gray-400">·</span>
                <time dateTime={article.publishedAt || article.createdAt}>
                  {formatArticleDate(article.publishedAt || article.createdAt)}
                </time>
                <span className="text-warm-gray-400">·</span>
                <span className="flex items-center gap-3xs">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  {article.readingTimeMinutes} min read
                </span>
              </div>
              {/* Desktop: share sits inline with the metadata. On a phone that
                  row is already full, so share moves to its own row below the
                  metadata (see the sm:hidden block) rather than being dropped
                  until the article footer. */}
              <div className="hidden sm:block">
                <ShareButtons title={article.title} />
              </div>
            </div>

            {/* Mobile share row — its own line under the metadata, so a phone
                reader can share from the top of the article instead of only at
                the very bottom. Hidden from sm up, where share sits inline
                with the metadata above. */}
            <div className="mt-sm sm:hidden">
              <ShareButtons title={article.title} />
            </div>
          </header>

          {/* Cover image */}
          {article.coverImageUrl && (
            <div className="aspect-[2/1] relative overflow-hidden rounded-lg mb-block">
              <SafeImage
                src={article.coverImageUrl}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 720px"
                priority
              />
            </div>
          )}

          {/* Article body */}
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: renderArticleHtml(article.content) }}
          />

          {/* Footer */}
          <div className="border-t border-sand mt-block pt-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-deep-blue">{article.authorName}</p>
                <p className="text-sm text-warm-gray-400">{article.authorRole}</p>
              </div>
              <ShareButtons title={article.title} />
            </div>
            <div className="mt-md text-center">
              <Link
                href="/news"
                className="tap-target inline-flex items-center gap-2xs text-base font-medium text-ocean hover:text-ocean-dark transition-colors focus:outline-none focus:ring-2 focus:ring-ocean rounded-sm"
              >
                ← More articles
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

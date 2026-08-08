import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
import { notFound } from 'next/navigation';
import sanitizeHtml from 'sanitize-html';
import { getArticleBySlug, getPublishedArticles } from '@/services/articles';
import { generatePageMetadata } from '@/lib/metadata';
import { ShareButtons } from '@/components/shared/share-buttons';
import { NewsSidebar } from '@/components/news/news-sidebar';
import { SafeImage } from '@/components/ui/safe-image';

export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 page-y">
      {/* Grid: sidebar (left, desktop only) | article content */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8 lg:gap-12">
        {/* Sidebar — shows other articles to read */}
        <NewsSidebar tags={allTags} otherArticles={otherArticles} />

        {/* Article content */}
        <article className="max-w-3xl">
          {/* Back link */}
          <Link
            href="/news"
            className="inline-flex items-center gap-1 text-sm text-ocean hover:text-ocean-dark mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All articles
          </Link>

          {/* Article header */}
          <header className="mb-10">
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {(article.tags ?? []).map((tag) => (
                <span key={tag} className="text-xs font-medium text-ocean bg-ocean/10 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-medium text-deep-blue leading-tight mb-6">
              {article.title}
            </h1>

            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-4 text-sm text-warm-gray-600">
                <span className="font-medium">{article.authorName}</span>
                <span className="text-warm-gray-400">·</span>
                <time dateTime={article.publishedAt || article.createdAt}>
                  {new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-AU', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </time>
                <span className="text-warm-gray-400">·</span>
                <span className="flex items-center gap-1 text-warm-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  {article.readingTimeMinutes} min read
                </span>
              </div>
              <div className="hidden sm:block">
                <ShareButtons title={article.title} />
              </div>
            </div>
          </header>

          {/* Cover image */}
          {article.coverImageUrl && (
            <div className="aspect-[2/1] relative overflow-hidden rounded-lg mb-12">
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
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(article.content, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'figure', 'figcaption', 'h1', 'h2', 'h3']),
                allowedAttributes: {
                  ...sanitizeHtml.defaults.allowedAttributes,
                  img: ['src', 'alt', 'width', 'height'],
                  figure: [],
                  figcaption: [],
                },
                allowedStyles: {
                  img: { width: [/^(\d+(%|px|rem|em)|auto)$/], 'border-radius': [/^[\d.]+(px|rem|em|%)$/], margin: [/^[\d.]+(px|rem|em|%)\s?[\d.]*(px|rem|em|%)?$/] },
                  figcaption: { 'text-align': [/^(left|center|right)$/], 'font-size': [/^[\d.]+(px|rem|em)$/], color: [/^#[0-9a-fA-F]{3,6}$/], 'margin-top': [/^[\d.]+(px|rem|em)$/] },
                },
                allowedSchemes: ['http', 'https', 'mailto'],
              }),
            }}
          />

          {/* Footer */}
          <div className="border-t border-sand mt-12 lg:mt-16 pt-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-deep-blue">{article.authorName}</p>
                <p className="text-sm text-warm-gray-400">{article.authorRole}</p>
              </div>
              <ShareButtons title={article.title} />
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/news"
                className="text-sm font-medium text-ocean hover:text-ocean-dark transition-colors"
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

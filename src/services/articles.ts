import { mockArticles } from '@/data/mock';
import type { Article } from '@/types';

const delay = () => new Promise((r) => setTimeout(r, 0));

// --- Public ---

export async function getPublishedArticles(): Promise<Article[]> {
  await delay();
  return mockArticles
    .filter((a) => a.published)
    .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
}

export async function getFeaturedArticle(): Promise<Article | null> {
  await delay();
  return mockArticles.find((a) => a.published && a.featured) ?? null;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  await delay();
  const article = mockArticles.find((a) => a.slug === slug);
  if (!article || !article.published) return null;
  return article;
}

// --- Admin ---

export async function getAllArticles(): Promise<Article[]> {
  await delay();
  return [...mockArticles].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getArticleById(id: string): Promise<Article | null> {
  await delay();
  return mockArticles.find((a) => a.id === id) ?? null;
}

export async function createArticle(data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<Article> {
  await delay();
  const article: Article = {
    ...data,
    id: `article-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockArticles.push(article);
  return article;
}

export async function updateArticle(id: string, data: Partial<Article>): Promise<Article | null> {
  await delay();
  const index = mockArticles.findIndex((a) => a.id === id);
  if (index === -1) return null;
  mockArticles[index] = { ...mockArticles[index], ...data, updatedAt: new Date().toISOString() };
  return mockArticles[index];
}

export async function deleteArticle(id: string): Promise<boolean> {
  await delay();
  const index = mockArticles.findIndex((a) => a.id === id);
  if (index === -1) return false;
  mockArticles.splice(index, 1);
  return true;
}

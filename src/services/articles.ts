import { apiGet, apiPost, apiPatch, apiDelete, getAdminToken } from '@/lib/api-client';
import type { Article } from '@/types';

interface WagtailArticleResponse {
  id: number;
  meta?: { slug: string; first_published_at?: string; last_published_at?: string };
  slug?: string;
  title: string;
  excerpt: string;
  body: string;
  cover_image_url?: string;
  cover_image_alt?: string;
  author_name: string;
  author_role: string;
  tags?: string[];
  published_flag: boolean;
  featured: boolean;
  reading_time_minutes: number;
  published_at: string | null;
  first_published_at?: string;
  last_published_at?: string;
}

interface WagtailListResponse {
  items: WagtailArticleResponse[];
}

function mapArticle(raw: WagtailArticleResponse): Article {
  return {
    id: String(raw.id),
    slug: raw.meta?.slug ?? raw.slug ?? '',
    title: raw.title ?? '',
    excerpt: raw.excerpt ?? '',
    content: raw.body ?? '',
    coverImageUrl: raw.cover_image_url || null,
    coverImageAlt: raw.cover_image_alt || `Cover image for ${raw.title ?? ''}`,
    authorName: raw.author_name ?? '',
    authorRole: raw.author_role ?? '',
    tags: raw.tags ?? [],
    published: raw.published_flag ?? false,
    featured: raw.featured ?? false,
    readingTimeMinutes: raw.reading_time_minutes ?? 3,
    // The Wagtail read API nests these under `meta`; the write API returns them top-level.
    createdAt: raw.first_published_at ?? raw.meta?.first_published_at ?? '',
    updatedAt: raw.last_published_at ?? raw.meta?.last_published_at ?? '',
    publishedAt: raw.published_at ?? null,
  };
}

// --- Public ---

export async function getPublishedArticles(): Promise<Article[]> {
  const data = await apiGet<WagtailListResponse>('/api/v2/articles/?published_flag=true&fields=*');
  return data.items.map(mapArticle).sort(
    (a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()
  );
}

export async function getFeaturedArticle(): Promise<Article | null> {
  const data = await apiGet<WagtailListResponse>('/api/v2/articles/?published_flag=true&featured=true&fields=*');
  if (data.items.length === 0) return null;
  return mapArticle(data.items[0]);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const data = await apiGet<WagtailListResponse>(`/api/v2/articles/?slug=${slug}&published_flag=true&fields=*`);
  if (data.items.length === 0) return null;
  return mapArticle(data.items[0]);
}

// --- Admin ---

export async function getAllArticles(): Promise<Article[]> {
  const data = await apiGet<WagtailListResponse>('/api/v2/articles/?fields=*&limit=100');
  return data.items.map(mapArticle).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getArticleById(id: string): Promise<Article | null> {
  try {
    const raw = await apiGet<WagtailArticleResponse>(`/api/v2/articles/${id}/?fields=*`);
    return mapArticle(raw);
  } catch {
    return null;
  }
}

export async function createArticle(data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<Article> {
  const token = getAdminToken();
  const raw = await apiPost<WagtailArticleResponse>('/api/write/articles/', {
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    body: data.content,
    cover_image_url: data.coverImageUrl,
    cover_image_alt: data.coverImageAlt,
    author_name: data.authorName,
    author_role: data.authorRole,
    tags: data.tags,
    published_flag: data.published,
    featured: data.featured,
    reading_time_minutes: data.readingTimeMinutes,
    published_at: data.publishedAt,
  }, token);
  return mapArticle(raw);
}

export async function updateArticle(id: string, data: Partial<Article>): Promise<Article | null> {
  const token = getAdminToken();
  const body: Record<string, unknown> = {};
  if (data.title !== undefined) body.title = data.title;
  if (data.slug !== undefined) body.slug = data.slug;
  if (data.excerpt !== undefined) body.excerpt = data.excerpt;
  if (data.content !== undefined) body.body = data.content;
  if (data.coverImageUrl !== undefined) body.cover_image_url = data.coverImageUrl;
  if (data.coverImageAlt !== undefined) body.cover_image_alt = data.coverImageAlt;
  if (data.authorName !== undefined) body.author_name = data.authorName;
  if (data.authorRole !== undefined) body.author_role = data.authorRole;
  if (data.tags !== undefined) body.tags = data.tags;
  if (data.published !== undefined) body.published_flag = data.published;
  if (data.featured !== undefined) body.featured = data.featured;
  if (data.readingTimeMinutes !== undefined) body.reading_time_minutes = data.readingTimeMinutes;
  if (data.publishedAt !== undefined) body.published_at = data.publishedAt;

  const raw = await apiPatch<WagtailArticleResponse>(`/api/write/articles/${id}/`, body, token);
  return mapArticle(raw);
}

export async function deleteArticle(id: string): Promise<boolean> {
  const token = getAdminToken();
  try {
    await apiDelete(`/api/write/articles/${id}/`, token);
    return true;
  } catch {
    return false;
  }
}

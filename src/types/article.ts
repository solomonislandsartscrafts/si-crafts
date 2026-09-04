export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string; // Short summary for cards (max ~200 chars)
  standfirst: string; // Editorial dek shown between headline and byline on the article page. Optional; '' when unset.
  content: string; // HTML content (rich text)
  coverImageUrl: string | null;
  coverImageAlt: string;
  authorName: string;
  authorRole: string; // e.g. "Editor", "Founder"
  tags: string[];
  published: boolean;
  featured: boolean; // Show as hero on news index
  readingTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

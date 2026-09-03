'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { Article } from '@/types';
import { getPublishedArticles, getAllArticles } from '@/services/articles';
import { ImageUpload } from './image-upload';
import { RichTextEditor } from './rich-text-editor';
import { singleAltError, htmlHasImageMissingAlt } from '@/lib/image-alt';
import { scrollToFirstError } from '@/lib/scroll-to-error';
import { useToast } from '@/components/ui/toast';
import { useModalA11y } from '@/lib/use-modal-a11y';
import { Button } from '@/components/ui/button';
import { FormField, inputClasses } from '@/components/ui/form-field';

interface ArticleEditorModalProps {
  article: Article | null;
  onClose: () => void;
  onSave: (data: Partial<Article>) => Promise<void>;
}

export function ArticleEditorModal({ article, onClose, onSave }: ArticleEditorModalProps) {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [existingArticles, setExistingArticles] = useState<Article[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const { error: toastError } = useToast();
  const modalRef = useModalA11y(true, onClose);

  useEffect(() => {
    getAllArticles().then(setExistingArticles).catch(() => {});
  }, []);

  const [form, setForm] = useState({
    title: article?.title ?? '',
    slug: article?.slug ?? '',
    excerpt: article?.excerpt ?? '',
    content: article?.content ?? '',
    coverImageUrl: article?.coverImageUrl ?? '',
    coverImageAlt: article?.coverImageAlt ?? '',
    authorName: article?.authorName ?? '',
    authorRole: article?.authorRole ?? 'Editor',
    tags: article?.tags?.join(', ') ?? '',
    published: article?.published ?? false,
    featured: article?.featured ?? false,
    readingTimeMinutes: article?.readingTimeMinutes ?? 3,
  });

  // Auto-generate slug from title (create mode only)
  useEffect(() => {
    if (!article) {
      setForm((prev) => ({
        ...prev,
        slug: prev.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
      }));
    }
  }, [form.title, article]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setSaveError('Title and content are required.');
      toastError('Please fix the highlighted fields before saving.');
      scrollToFirstError(formRef.current);
      return;
    }
    const coverAltError = singleAltError(form.coverImageUrl, form.coverImageAlt, 'cover image');
    if (coverAltError) {
      setSaveError(coverAltError);
      toastError(coverAltError);
      scrollToFirstError(formRef.current);
      return;
    }
    if (htmlHasImageMissingAlt(form.content)) {
      const msg = 'An image in the article content has no alt text. Remove it or re-insert it with a description.';
      setSaveError(msg);
      toastError(msg);
      scrollToFirstError(formRef.current);
      return;
    }
    // Validate slug uniqueness (exclude current article during edits)
    const slugDuplicate = existingArticles.find(
      (a) => a.slug === form.slug && a.id !== article?.id
    );
    if (slugDuplicate) {
      const msg = `Slug "${form.slug}" is already used by another article. Please change it.`;
      setSaveError(msg);
      toastError(msg);
      scrollToFirstError(formRef.current);
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await onSave({
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt,
        content: form.content,
        coverImageUrl: form.coverImageUrl || null,
        coverImageAlt: form.coverImageAlt || '',
        authorName: form.authorName || 'Editor',
        authorRole: form.authorRole || 'Editor',
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        published: form.published,
        featured: form.featured,
        readingTimeMinutes: form.readingTimeMinutes,
        publishedAt: form.published ? new Date().toISOString() : null,
      });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  function handleDismiss() {
    if (!saving) onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-sm bg-deep-blue/50 overflow-y-auto" onClick={handleDismiss}>
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-md w-full max-w-4xl my-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="article-editor-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-md py-sm border-b border-sand">
          <h2 id="article-editor-title" className="font-heading text-xl font-medium text-deep-blue">
            {article ? 'Edit Article' : 'New Article'}
          </h2>
          <button
            onClick={handleDismiss}
            disabled={saving}
            className="tap-target p-2xs text-warm-gray-400 hover:text-warm-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-ocean disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="px-md py-md space-y-md">
          {saveError && (
            <div className="bg-error/10 border border-error/20 text-error text-base rounded-md p-xs" role="alert">
              {saveError}
            </div>
          )}

          {/* Title */}
          <FormField label="Title *" htmlFor="article-title">
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Your article title"
              className={`${inputClasses} text-lg font-heading`}
            />
          </FormField>

          {/* Excerpt */}
          <FormField label="Excerpt" htmlFor="article-excerpt">
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              rows={2}
              placeholder="Brief summary shown on cards (1-2 sentences)"
              className={`${inputClasses} resize-y`}
            />
          </FormField>

          {/* Cover image */}
          <ImageUpload
            value={form.coverImageUrl}
            onChange={(url) => setForm({ ...form, coverImageUrl: url })}
            altText={form.coverImageAlt}
            onAltTextChange={(alt) => setForm({ ...form, coverImageAlt: alt })}
            label="Cover Image"
            aspectHint="16:9 landscape"
            maxWidth={1400}
            quality={0.85}
          />

          {/* Content — rich text */}
          <RichTextEditor
            value={form.content}
            onChange={(html) => setForm({ ...form, content: html })}
            label="Content *"
            placeholder="Write your article here..."
            minRows={12}
          />

          {/* Meta row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-sm">
            <FormField label="Author" htmlFor="article-author">
              <input
                type="text"
                value={form.authorName}
                onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                className={inputClasses}
              />
            </FormField>
            <FormField label="Author Role" htmlFor="article-author-role">
              <input
                type="text"
                value={form.authorRole}
                onChange={(e) => setForm({ ...form, authorRole: e.target.value })}
                placeholder="e.g. Editor, Volunteer"
                className={inputClasses}
              />
            </FormField>
            <FormField label="Tags (comma-separated)" htmlFor="article-tags">
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="Behind the scenes, Makers"
                className={inputClasses}
              />
            </FormField>
            <FormField label="Reading time (min)" htmlFor="article-reading">
              <input
                type="number"
                min="1"
                value={form.readingTimeMinutes}
                onChange={(e) => setForm({ ...form, readingTimeMinutes: parseInt(e.target.value) || 3 })}
                className={inputClasses}
              />
            </FormField>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-md">
            <label className="flex items-center gap-2xs cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="w-4 h-4 rounded border-sand-dark text-ocean focus:ring-ocean"
              />
              <span className="text-base text-warm-gray-800">Published</span>
            </label>
            <label className="flex items-center gap-2xs cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="w-4 h-4 rounded border-sand-dark text-ocean focus:ring-ocean"
              />
              <span className="text-base text-warm-gray-800">Featured (hero on news page)</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-xs pt-sm border-t border-sand">
            <Button variant="secondary" onClick={handleDismiss} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} loadingText="Saving...">
              {article ? 'Update Article' : 'Publish Article'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

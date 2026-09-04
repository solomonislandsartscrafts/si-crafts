'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Star, Newspaper } from 'lucide-react';
import type { Article } from '@/types';
import { AdminLayout } from '@/components/admin';
import { ArticleEditorModal } from '@/components/admin/article-editor-modal';
import { useToast } from '@/components/ui/toast';
import { pageTitleClasses } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton, SkeletonRegion } from '@/components/ui/skeleton';

/** Row-shaped placeholder while the article table loads. */
function TableSkeleton() {
  return (
    <SkeletonRegion
      label="Loading articles"
      className="bg-white rounded-lg shadow-card p-sm space-y-sm"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-sm">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-28 hidden sm:block" />
          <Skeleton className="h-4 w-24 hidden md:block" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </SkeletonRegion>
  );
}

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => { loadArticles(); }, []);

  async function loadArticles() {
    const { getAllArticles } = await import('@/services/articles');
    setArticles(await getAllArticles());
    setLoading(false);
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      const { deleteArticle } = await import('@/services/articles');
      await deleteArticle(id);
      toastSuccess(`"${title}" deleted.`);
      loadArticles();
    } catch {
      toastError(`Failed to delete "${title}". Please try again.`);
    }
  }

  async function handleTogglePublish(id: string, currentState: boolean) {
    try {
      const { updateArticle } = await import('@/services/articles');
      await updateArticle(id, {
        published: !currentState,
        publishedAt: !currentState ? new Date().toISOString() : null,
      });
      toastSuccess(!currentState ? 'Article published.' : 'Article unpublished.');
      loadArticles();
    } catch {
      toastError('Failed to update publish state. Please try again.');
    }
  }

  function handleEdit(article: Article) {
    setEditingArticle(article);
    setShowEditor(true);
  }

  function handleAdd() {
    setEditingArticle(null);
    setShowEditor(true);
  }

  async function handleSave(data: Partial<Article>) {
    if (editingArticle) {
      const { updateArticle } = await import('@/services/articles');
      await updateArticle(editingArticle.id, data);
      toastSuccess(`"${data.title || editingArticle.title}" updated.`);
    } else {
      const { createArticle } = await import('@/services/articles');
      await createArticle(data as Omit<Article, 'id' | 'createdAt' | 'updatedAt'>);
      toastSuccess(`"${data.title}" created.`);
    }
    setShowEditor(false);
    setEditingArticle(null);
    loadArticles();
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-md">
        <h1 className={pageTitleClasses}>News & Articles</h1>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="w-4 h-4" /> New Article
        </Button>
      </div>

      {loading ? <TableSkeleton /> : articles.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="No articles yet."
          action={
            <Button size="sm" onClick={handleAdd}>
              <Plus className="w-4 h-4" /> New Article
            </Button>
          }
        />
      ) : (
        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand-light border-b border-sand">
              <tr>
                <th scope="col" className="text-left px-sm py-xs font-medium text-warm-gray-600">Title</th>
                <th scope="col" className="text-left px-sm py-xs font-medium text-warm-gray-600 hidden sm:table-cell">Author</th>
                <th scope="col" className="text-left px-sm py-xs font-medium text-warm-gray-600 hidden md:table-cell">Date</th>
                <th scope="col" className="text-left px-sm py-xs font-medium text-warm-gray-600">Status</th>
                <th scope="col" className="text-right px-sm py-xs font-medium text-warm-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-sand-light/50">
                  <td className="px-sm py-xs">
                    <div className="flex items-center gap-2xs">
                      {article.featured && <Star className="w-3.5 h-3.5 text-warning fill-warning" />}
                      <span className="font-medium text-warm-gray-800 line-clamp-1">{article.title}</span>
                    </div>
                  </td>
                  <td className="px-sm py-xs text-warm-gray-600 hidden sm:table-cell">{article.authorName}</td>
                  <td className="px-sm py-xs text-warm-gray-400 text-xs hidden md:table-cell">
                    {new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-AU', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </td>
                  <td className="px-sm py-xs">
                    <button
                      onClick={() => handleTogglePublish(article.id, article.published)}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean rounded-sm"
                      aria-label={`${article.published ? 'Unpublish' : 'Publish'} ${article.title}`}
                    >
                      <StatusBadge
                        status={article.published ? 'success' : 'neutral'}
                        className="gap-3xs"
                      >
                        {article.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {article.published ? 'Published' : 'Draft'}
                      </StatusBadge>
                    </button>
                  </td>
                  <td className="px-sm py-xs text-right">
                    <div className="flex items-center justify-end gap-2xs">
                      <button
                        onClick={() => handleEdit(article)}
                        className="tap-target p-2xs text-warm-gray-400 hover:text-ocean transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
                        aria-label={`Edit ${article.title}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(article.id, article.title)}
                        className="tap-target p-2xs text-warm-gray-400 hover:text-error transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
                        aria-label={`Delete ${article.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showEditor && (
        <ArticleEditorModal
          article={editingArticle}
          onClose={() => { setShowEditor(false); setEditingArticle(null); }}
          onSave={handleSave}
        />
      )}
    </AdminLayout>
  );
}

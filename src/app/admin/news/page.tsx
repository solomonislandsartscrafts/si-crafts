'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Star } from 'lucide-react';
import type { Article } from '@/types';
import { AdminLayout } from '@/components/admin';
import { ArticleEditorModal } from '@/components/admin/article-editor-modal';
import { useToast } from '@/components/ui/toast';

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-medium text-deep-blue">News & Articles</h1>
        <button
          onClick={handleAdd}
          className="tap-target inline-flex items-center gap-2 px-4 py-2 btn-primary text-sm"
        >
          <Plus className="w-4 h-4" /> New Article
        </button>
      </div>

      {loading ? <p className="text-warm-gray-400">Loading...</p> : (
        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand-light border-b border-sand">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600 hidden sm:table-cell">Author</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600 hidden md:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-warm-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-sand-light/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {article.featured && <Star className="w-3.5 h-3.5 text-warning fill-warning" />}
                      <span className="font-medium text-warm-gray-800 line-clamp-1">{article.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-warm-gray-600 hidden sm:table-cell">{article.authorName}</td>
                  <td className="px-4 py-3 text-warm-gray-400 text-xs hidden md:table-cell">
                    {new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-AU', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleTogglePublish(article.id, article.published)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                        article.published ? 'bg-success/10 text-success' : 'bg-warm-gray-200 text-warm-gray-600'
                      }`}
                    >
                      {article.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {article.published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(article)}
                        className="tap-target p-2 text-warm-gray-400 hover:text-ocean transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
                        aria-label={`Edit ${article.title}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(article.id, article.title)}
                        className="tap-target p-2 text-warm-gray-400 hover:text-error transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
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

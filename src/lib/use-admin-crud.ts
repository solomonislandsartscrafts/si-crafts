import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/components/ui/toast';

/**
 * Shared CRUD hook for admin list pages.
 * 
 * Eliminates the repeated useState/useEffect/load/delete/edit/save pattern that
 * appears across all 19 admin pages (makers, crafts, team, faqs, supporters, etc.).
 * 
 * @template T - The entity type (Maker, Craft, TeamMember, etc.)
 * @template TFormData - The form data shape used for create/update
 * 
 * @param config - Configuration object
 * @param config.loadFn - Async function that fetches all entities from the service layer
 * @param config.createFn - Async function that creates a new entity (receives form data)
 * @param config.updateFn - Async function that updates an entity (receives id + form data)
 * @param config.deleteFn - Async function that deletes an entity (receives id)
 * @param config.entityName - Human-readable entity name for success/error messages (e.g. "maker", "craft")
 * 
 * @returns Object containing:
 *   - items: Array of entities
 *   - loading: Boolean indicating initial load state
 *   - editingItem: Currently selected item for editing (null when adding new)
 *   - showForm: Boolean controlling form modal visibility
 *   - handlers: { handleAdd, handleEdit, handleSave, handleDelete, handleCloseForm }
 * 
 * @example
 * ```tsx
 * const { items: makers, loading, editingItem, showForm, handlers } = useAdminCrud({
 *   loadFn: getAllMakers,
 *   createFn: createMaker,
 *   updateFn: updateMaker,
 *   deleteFn: deleteMaker,
 *   entityName: 'maker',
 * });
 * ```
 */
export function useAdminCrud<T extends { id: string; name?: string }, TFormData = Partial<T>>({
  loadFn,
  createFn,
  updateFn,
  deleteFn,
  entityName,
}: {
  loadFn: () => Promise<T[]>;
  createFn: (data: TFormData) => Promise<T | null>;
  updateFn: (id: string, data: TFormData) => Promise<T | null>;
  deleteFn: (id: string) => Promise<void | boolean>;
  entityName: string;
}) {
  // State management
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const { success: toastSuccess, error: toastError } = useToast();

  // Monotonic id for the most recently started load. A save or delete triggers
  // a reload while an earlier load may still be in flight; without this, a slow
  // earlier response could resolve last and overwrite the newer data. Only the
  // latest request is allowed to call setItems.
  const loadRequestId = useRef(0);

  /**
   * Load all entities from the backend.
   * Wrapped in useCallback to prevent infinite re-renders in useEffect.
   */
  const loadItems = useCallback(async () => {
    const requestId = ++loadRequestId.current;
    try {
      const data = await loadFn();
      // Ignore this response if a newer load has started since — its result is
      // the source of truth.
      if (requestId === loadRequestId.current) {
        setItems(data);
      }
    } catch (err) {
      if (requestId === loadRequestId.current) {
        toastError(`Failed to load ${entityName}s. Please refresh the page.`);
      }
    } finally {
      if (requestId === loadRequestId.current) {
        setLoading(false);
      }
    }
  }, [loadFn, entityName, toastError]);

  // Load entities on mount
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  /**
   * Open the form modal in "add new" mode.
   */
  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setShowForm(true);
  }, []);

  /**
   * Open the form modal in "edit existing" mode.
   */
  const handleEdit = useCallback((item: T) => {
    setEditingItem(item);
    setShowForm(true);
  }, []);

  /**
   * Close the form modal and clear editing state.
   */
  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setEditingItem(null);
  }, []);

  /**
   * Save entity (create or update based on whether editingItem exists).
   * On success, closes the form and reloads the list.
   * On error, re-throws so the form modal can surface the validation message.
   */
  const handleSave = useCallback(
    async (data: TFormData) => {
      try {
        if (editingItem) {
          // A null result means the update failed (e.g. not found / rejected).
          // Treat it as an error rather than reporting success and closing.
          const result = await updateFn(editingItem.id, data);
          if (result === null) {
            throw new Error(`Failed to update ${entityName}.`);
          }
          const displayName = (data as { name?: string }).name || editingItem.name || entityName;
          toastSuccess(`"${displayName}" updated.`);
        } else {
          const result = await createFn(data);
          if (result === null) {
            throw new Error(`Failed to create ${entityName}.`);
          }
          const displayName = (data as { name?: string }).name || entityName;
          toastSuccess(`"${displayName}" created.`);
        }
        handleCloseForm();
        loadItems();
      } catch (err) {
        // Re-throw so the form modal's try/catch can display the error
        throw err;
      }
    },
    [editingItem, createFn, updateFn, loadItems, entityName, toastSuccess, handleCloseForm]
  );

  /**
   * Delete an entity after user confirmation.
   * Reloads the list on success.
   */
  const handleDelete = useCallback(
    async (id: string, name?: string) => {
      const displayName = name || entityName;
      
      if (!confirm(`Are you sure you want to delete "${displayName}"? This cannot be undone.`)) {
        return;
      }

      try {
        // deleteFn may return `false` to signal a failed delete without
        // throwing. Treat that as a failure too, so we don't report success or
        // reload as if it worked.
        const result = await deleteFn(id);
        if (result === false) {
          throw new Error(`Failed to delete ${entityName}.`);
        }
        toastSuccess(`"${displayName}" deleted.`);
        loadItems();
      } catch (err) {
        toastError(`Failed to delete "${displayName}". Please try again.`);
      }
    },
    [deleteFn, entityName, loadItems, toastSuccess, toastError]
  );

  return {
    items,
    loading,
    editingItem,
    showForm,
    /**
     * Manually reload the list. Useful for custom actions outside the standard
     * CRUD flow (e.g. toggleConsent on makers, bulk operations).
     */
    reload: loadItems,
    handlers: {
      handleAdd,
      handleEdit,
      handleSave,
      handleDelete,
      handleCloseForm,
    },
  };
}

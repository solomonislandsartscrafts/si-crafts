'use client';

import { Plus, Edit, Trash2, Users } from 'lucide-react';
import type { TeamMember } from '@/types';
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } from '@/services/team';
import { AdminLayout } from '@/components/admin';
import { TeamFormModal, type TeamFormData } from '@/components/admin/team-form-modal';
import { useAdminCrud } from '@/lib/use-admin-crud';
import { pageTitleClasses } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton, SkeletonRegion } from '@/components/ui/skeleton';

/**
 * Row-shaped placeholder skeleton displayed while the team table loads.
 */
function TableSkeleton() {
  return (
    <SkeletonRegion
      label="Loading team members"
      className="bg-white rounded-lg shadow-card p-sm space-y-sm"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-sm">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-28 hidden sm:block" />
          <Skeleton className="h-4 w-32 hidden md:block" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </SkeletonRegion>
  );
}

/**
 * Admin page for managing team members (the "About us" section).
 * Uses the shared useAdminCrud hook to eliminate boilerplate CRUD logic.
 */
export default function AdminTeamPage() {
  // Use shared CRUD hook instead of manual state management
  const {
    items: members,
    loading,
    editingItem: editingMember,
    showForm,
    handlers: { handleAdd, handleEdit, handleSave, handleDelete, handleCloseForm },
  } = useAdminCrud<TeamMember, TeamFormData>({
    loadFn: getTeamMembers,
    createFn: (data) =>
      createTeamMember({
        name: data.name,
        location: data.location || null,
        bio: data.bio || null,
        photoUrl: data.photoUrl || null,
        photoAlt: data.photoAlt,
        photoPosition: data.photoPosition || null,
        sortOrder: data.sortOrder,
      }),
    updateFn: (id, data) =>
      updateTeamMember(id, {
        name: data.name,
        location: data.location || null,
        bio: data.bio || null,
        photoUrl: data.photoUrl || null,
        photoAlt: data.photoAlt,
        photoPosition: data.photoPosition || null,
        sortOrder: data.sortOrder,
      }),
    deleteFn: deleteTeamMember,
    entityName: 'team member',
  });

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-md">
        <h1 className={pageTitleClasses}>Team</h1>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="w-4 h-4" /> Add Member
        </Button>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No team members yet."
          action={
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4" /> Add your first team member
            </Button>
          }
        />
      ) : (
        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand-light border-b border-sand">
              <tr>
                <th className="text-left px-sm py-xs font-medium text-warm-gray-600">Order</th>
                <th className="text-left px-sm py-xs font-medium text-warm-gray-600">Name</th>
                <th className="text-left px-sm py-xs font-medium text-warm-gray-600 hidden sm:table-cell">Location</th>
                <th className="text-left px-sm py-xs font-medium text-warm-gray-600 hidden md:table-cell">Bio</th>
                <th className="text-right px-sm py-xs font-medium text-warm-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-sand-light/50">
                  <td className="px-sm py-xs text-warm-gray-400 text-xs">{member.sortOrder}</td>
                  <td className="px-sm py-xs font-medium text-warm-gray-800">{member.name}</td>
                  <td className="px-sm py-xs text-warm-gray-600 hidden sm:table-cell">
                    {member.location || <span className="text-warm-gray-400 italic">—</span>}
                  </td>
                  <td className="px-sm py-xs text-warm-gray-600 hidden md:table-cell max-w-xs truncate">
                    {member.bio || <span className="text-warm-gray-400 italic">—</span>}
                  </td>
                  <td className="px-sm py-xs text-right">
                    <div className="flex items-center justify-end gap-2xs">
                      <button
                        onClick={() => handleEdit(member)}
                        className="tap-target p-2xs text-warm-gray-400 hover:text-ocean transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
                        aria-label={`Edit ${member.name}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id, member.name)}
                        className="tap-target p-2xs text-warm-gray-400 hover:text-error transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
                        aria-label={`Delete ${member.name}`}
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

      {showForm && (
        <TeamFormModal
          member={editingMember}
          onClose={handleCloseForm}
          onSave={handleSave}
        />
      )}
    </AdminLayout>
  );
}

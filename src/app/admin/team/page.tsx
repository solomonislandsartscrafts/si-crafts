'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import type { TeamMember } from '@/types';
import { AdminLayout } from '@/components/admin';
import { TeamFormModal, type TeamFormData } from '@/components/admin/team-form-modal';
import { useToast } from '@/components/ui/toast';
import { pageTitleClasses } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton, SkeletonRegion } from '@/components/ui/skeleton';

/** Row-shaped placeholder while the team table loads. */
function TableSkeleton() {
  return (
    <SkeletonRegion
      label="Loading team members"
      className="bg-white rounded-lg shadow-card p-4 space-y-4"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
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

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => { loadMembers(); }, []);

  async function loadMembers() {
    try {
      const { getTeamMembers } = await import('@/services/team');
      const data = await getTeamMembers();
      setMembers(data);
    } catch {
      toastError('Failed to load team members. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;
    try {
      const { deleteTeamMember } = await import('@/services/team');
      await deleteTeamMember(id);
      toastSuccess(`"${name}" deleted.`);
      loadMembers();
    } catch {
      toastError(`Failed to delete "${name}". Please try again.`);
    }
  }

  function handleEdit(member: TeamMember) {
    setEditingMember(member);
    setShowForm(true);
  }

  function handleAdd() {
    setEditingMember(null);
    setShowForm(true);
  }

  async function handleSave(data: TeamFormData) {
    try {
      if (editingMember) {
        const { updateTeamMember } = await import('@/services/team');
        await updateTeamMember(editingMember.id, {
          name: data.name,
          location: data.location || null,
          bio: data.bio || null,
          photoUrl: data.photoUrl || null,
          photoAlt: data.photoAlt,
          photoPosition: data.photoPosition || null,
          sortOrder: data.sortOrder,
        });
        toastSuccess(`"${data.name}" updated.`);
      } else {
        const { createTeamMember } = await import('@/services/team');
        await createTeamMember({
          name: data.name,
          location: data.location || null,
          bio: data.bio || null,
          photoUrl: data.photoUrl || null,
          photoAlt: data.photoAlt,
          photoPosition: data.photoPosition || null,
          sortOrder: data.sortOrder,
        });
        toastSuccess(`"${data.name}" added to team.`);
      }
      setShowForm(false);
      setEditingMember(null);
      loadMembers();
    } catch (err) {
      throw err;
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
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
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600">Order</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600 hidden sm:table-cell">Location</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600 hidden md:table-cell">Bio</th>
                <th className="text-right px-4 py-3 font-medium text-warm-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-sand-light/50">
                  <td className="px-4 py-3 text-warm-gray-400 text-xs">{member.sortOrder}</td>
                  <td className="px-4 py-3 font-medium text-warm-gray-800">{member.name}</td>
                  <td className="px-4 py-3 text-warm-gray-600 hidden sm:table-cell">
                    {member.location || <span className="text-warm-gray-400 italic">—</span>}
                  </td>
                  <td className="px-4 py-3 text-warm-gray-600 hidden md:table-cell max-w-xs truncate">
                    {member.bio || <span className="text-warm-gray-400 italic">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(member)}
                        className="tap-target p-2 text-warm-gray-400 hover:text-ocean transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
                        aria-label={`Edit ${member.name}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id, member.name)}
                        className="tap-target p-2 text-warm-gray-400 hover:text-error transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
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
          onClose={() => { setShowForm(false); setEditingMember(null); }}
          onSave={handleSave}
        />
      )}
    </AdminLayout>
  );
}

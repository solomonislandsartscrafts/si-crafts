'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { TeamMember } from '@/types';
import { AdminLayout } from '@/components/admin';
import { TeamFormModal, type TeamFormData } from '@/components/admin/team-form-modal';
import { useToast } from '@/components/ui/toast';

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
        <h1 className="font-heading text-2xl font-medium text-deep-blue">Team</h1>
        <button
          onClick={handleAdd}
          className="tap-target inline-flex items-center gap-2 px-4 py-2 btn-primary text-sm"
        >
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {loading ? (
        <p className="text-warm-gray-400">Loading...</p>
      ) : members.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-warm-gray-400 mb-4">No team members yet.</p>
          <button
            onClick={handleAdd}
            className="tap-target inline-flex items-center gap-2 px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta-light"
          >
            <Plus className="w-4 h-4" /> Add your first team member
          </button>
        </div>
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

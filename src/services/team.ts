import { apiGet, apiPost, apiPatch, apiDelete, getAdminToken } from '@/lib/api-client';
import type { TeamMember } from '@/types';

interface ApiTeamMember {
  id: number;
  name: string;
  location: string;
  bio: string;
  photo_url: string;
  photo_alt: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

function mapTeamMember(raw: ApiTeamMember): TeamMember {
  return {
    id: String(raw.id),
    name: raw.name,
    location: raw.location || null,
    bio: raw.bio || null,
    photoUrl: raw.photo_url || null,
    photoAlt: raw.photo_alt || '',
    sortOrder: raw.sort_order,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

// --- Public ---

export async function getTeamMembers(): Promise<TeamMember[]> {
  const data = await apiGet<ApiTeamMember[]>('/api/team/');
  return data.map(mapTeamMember);
}

export async function getTeamMemberById(id: string): Promise<TeamMember | null> {
  try {
    const raw = await apiGet<ApiTeamMember>(`/api/team/${id}/`);
    return mapTeamMember(raw);
  } catch {
    return null;
  }
}

// --- Admin CRUD ---

export async function createTeamMember(
  data: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>
): Promise<TeamMember> {
  const token = getAdminToken();
  const raw = await apiPost<ApiTeamMember>('/api/team/', {
    name: data.name,
    location: data.location ?? '',
    bio: data.bio ?? '',
    photo_url: data.photoUrl ?? '',
    photo_alt: data.photoAlt ?? '',
    sort_order: data.sortOrder,
  }, token);
  return mapTeamMember(raw);
}

export async function updateTeamMember(
  id: string,
  data: Partial<Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<TeamMember> {
  const token = getAdminToken();
  const body: Record<string, unknown> = {};
  if (data.name !== undefined) body.name = data.name;
  if (data.location !== undefined) body.location = data.location ?? '';
  if (data.bio !== undefined) body.bio = data.bio ?? '';
  if (data.photoUrl !== undefined) body.photo_url = data.photoUrl ?? '';
  if (data.photoAlt !== undefined) body.photo_alt = data.photoAlt ?? '';
  if (data.sortOrder !== undefined) body.sort_order = data.sortOrder;

  const raw = await apiPatch<ApiTeamMember>(`/api/team/${id}/`, body, token);
  return mapTeamMember(raw);
}

export async function deleteTeamMember(id: string): Promise<boolean> {
  const token = getAdminToken();
  try {
    await apiDelete(`/api/team/${id}/`, token);
    return true;
  } catch {
    return false;
  }
}

import { apiGet, apiPost, apiPatch, apiDelete, getAdminToken } from '@/lib/api-client';
import type { TeamMember } from '@/types';

interface ApiTeamMember {
  id: number;
  name: string;
  location: string;
  bio: string;
  photo_url: string;
  photo_alt: string;
  photo_position: string;
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
    photoPosition: raw.photo_position || null,
    sortOrder: raw.sort_order,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

/**
 * Render-only fallback for the public "Our Team" section.
 *
 * The backend (seeded via a data migration) is the source of truth. These
 * defaults are shown ONLY when the backend cannot be reached, so the About page
 * still renders something instead of an empty state. They are never persisted
 * and never overwrite backend data — editing the team is done in the admin,
 * which writes straight to the backend.
 */
const DEFAULT_TEAM: TeamMember[] = [
  {
    id: '1',
    name: 'Alison Wishart',
    location: 'Sydney, Australia',
    bio: 'Alison lives in Sydney, Australia and was born near Munda in Western Province. In 2025, she went to Honiara with the Australian Volunteers Program and worked with makers and artisans at the Solomon Islands National Art Gallery for six months. She is responsible for importing, documentation, liaising with makers and stockists, and day-to-day operations. Alison is the founder and director of SIAC.',
    photoUrl: null,
    photoAlt: 'Alison Wishart',
    photoPosition: null,
    sortOrder: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Isaac Tekulu',
    location: 'Dunedin, New Zealand',
    bio: 'Isaac was born in Solomon Islands and now lives in Dunedin with his young family. He designed and maintains the website, is the graphic designer and web developer for SIAC. He handles the brand identity, website, and digital presence — ensuring the crafts and maker\'s stories are presented with the respect they deserve.',
    photoUrl: null,
    photoAlt: 'Isaac Tekulu',
    photoPosition: null,
    sortOrder: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Jade Scott',
    location: 'Sydney, Australia',
    bio: 'Jade is a freelance graphic designer based in Sydney and designed the brand identity and logo.',
    photoUrl: null,
    photoAlt: 'Jade Scott',
    photoPosition: null,
    sortOrder: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// --- Public reads ---

/**
 * All team members, ordered by sortOrder.
 *
 * The backend is the source of truth. If it is unreachable, this falls back to
 * DEFAULT_TEAM purely so the public page can still render — that fallback is
 * never written anywhere. There is deliberately NO localStorage cache: it was
 * the cause of admin edits appearing to save on one machine and reverting
 * everywhere else, because writes that failed silently landed in one browser
 * only.
 */
export async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const data = await apiGet<ApiTeamMember[] | { results: ApiTeamMember[] }>('/api/team/');
    const list = Array.isArray(data) ? data : (data?.results ?? []);
    return list.map(mapTeamMember).sort((a, b) => a.sortOrder - b.sortOrder);
  } catch {
    // Backend unreachable — render the defaults so the page isn't empty.
    return DEFAULT_TEAM;
  }
}

export async function getTeamMemberById(id: string): Promise<TeamMember | null> {
  try {
    const raw = await apiGet<ApiTeamMember>(`/api/team/${id}/`);
    return mapTeamMember(raw);
  } catch {
    return DEFAULT_TEAM.find((m) => m.id === id) ?? null;
  }
}

// --- Admin CRUD ---
//
// These write straight to the backend and throw on failure. They must NOT fall
// back to localStorage: a silent local save is exactly the bug this service had
// — the admin saw "saved", but the change never reached the database, so it was
// invisible on every other machine and reverted on the next load. Throwing lets
// useAdminCrud surface a real error to the admin instead.

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
    photo_position: data.photoPosition ?? '',
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
  if (data.photoPosition !== undefined) body.photo_position = data.photoPosition ?? '';
  if (data.sortOrder !== undefined) body.sort_order = data.sortOrder;

  const raw = await apiPatch<ApiTeamMember>(`/api/team/${id}/`, body, token);
  return mapTeamMember(raw);
}

export async function deleteTeamMember(id: string): Promise<boolean> {
  const token = getAdminToken();
  await apiDelete(`/api/team/${id}/`, token);
  return true;
}

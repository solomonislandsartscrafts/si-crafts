import { apiGet, apiPost, apiPatch, apiDelete, getAdminToken, ApiError } from '@/lib/api-client';
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

// --- Default seed data ---

const DEFAULT_TEAM: TeamMember[] = [
  {
    id: '1',
    name: 'Alison Ririnui',
    location: 'Melbourne, Australia',
    bio: 'Alison is the founder and director of SIAC. Born in Solomon Islands, she moved to Australia and has spent over a decade building connections between Solomon Islands makers and Australian galleries and museums.',
    photoUrl: null,
    photoAlt: 'Alison Ririnui',
    sortOrder: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Isaac Tekulu',
    location: 'Melbourne, Australia',
    bio: 'Isaac is the graphic designer and web developer for SIAC. He handles the brand identity, website, and digital presence — ensuring the crafts and maker stories are presented with the respect they deserve.',
    photoUrl: null,
    photoAlt: 'Isaac Tekulu',
    sortOrder: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Julie Atu',
    location: 'Munda, Western Province',
    bio: 'Julie is our Solomon Islands coordinator. She works directly with makers across the Western Province, organising collections, managing quality, and ensuring fair trade practices on the ground.',
    photoUrl: null,
    photoAlt: 'Julie Atu',
    sortOrder: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'David Kera',
    location: 'Honiara, Solomon Islands',
    bio: 'David handles logistics and shipping coordination between Solomon Islands and Australia. His knowledge of local supply chains keeps our operations running smoothly.',
    photoUrl: null,
    photoAlt: 'David Kera',
    sortOrder: 4,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// --- Local storage helpers (client-side persistence until backend is connected) ---

/** Returns true for errors that should trigger local storage fallback.
 * During mock-data phase, all backend errors fall back locally since
 * the team data is managed via localStorage until the backend auth is aligned.
 */
function shouldFallbackLocally(err: unknown): boolean {
  if (err instanceof ApiError) {
    // Any backend error: auth mismatch, 404, 500 — use local data
    return true;
  }
  return true; // Non-ApiError (e.g. TypeError from fetch) = network issue
}

const STORAGE_KEY = 'siac_team_members';

function getLocalTeam(): TeamMember[] | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    // Validate each entry has required TeamMember fields
    const valid = parsed.every(
      (item: unknown) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Record<string, unknown>).id === 'string' &&
        typeof (item as Record<string, unknown>).name === 'string' &&
        typeof (item as Record<string, unknown>).sortOrder === 'number'
    );
    if (!valid) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed as TeamMember[];
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function saveLocalTeam(members: TeamMember[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
}

function nextId(members: TeamMember[]): string {
  const maxId = members.reduce((max, m) => Math.max(max, parseInt(m.id, 10) || 0), 0);
  return String(maxId + 1);
}

// --- Public ---

export async function getTeamMembers(): Promise<TeamMember[]> {
  // Try real API first
  try {
    const data = await apiGet<ApiTeamMember[] | { results: ApiTeamMember[] }>('/api/team/');
    const list = Array.isArray(data) ? data : (data?.results ?? []);
    if (list.length > 0) return list.map(mapTeamMember);
  } catch (err) {
    if (!shouldFallbackLocally(err)) throw err;
    // API unavailable — use local data
  }

  // Use locally persisted data (admin edits) or default seed
  const local = getLocalTeam();
  if (local) return local.sort((a, b) => a.sortOrder - b.sortOrder);

  return DEFAULT_TEAM;
}

export async function getTeamMemberById(id: string): Promise<TeamMember | null> {
  try {
    const raw = await apiGet<ApiTeamMember>(`/api/team/${id}/`);
    return mapTeamMember(raw);
  } catch (err) {
    if (!shouldFallbackLocally(err)) throw err;
    // Fall back to local
    const members = getLocalTeam() ?? DEFAULT_TEAM;
    return members.find((m) => m.id === id) ?? null;
  }
}

// --- Admin CRUD ---

export async function createTeamMember(
  data: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>
): Promise<TeamMember> {
  // Try API first
  try {
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
  } catch (err) {
    if (!shouldFallbackLocally(err)) throw err;
    // Backend unavailable — persist locally
    const members = getLocalTeam() ?? [...DEFAULT_TEAM];
    const now = new Date().toISOString();
    const newMember: TeamMember = {
      id: nextId(members),
      name: data.name,
      location: data.location,
      bio: data.bio,
      photoUrl: data.photoUrl,
      photoAlt: data.photoAlt,
      sortOrder: data.sortOrder,
      createdAt: now,
      updatedAt: now,
    };
    members.push(newMember);
    saveLocalTeam(members);
    return newMember;
  }
}

export async function updateTeamMember(
  id: string,
  data: Partial<Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<TeamMember> {
  // Try API first
  try {
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
  } catch (err) {
    if (!shouldFallbackLocally(err)) throw err;
    // Backend unavailable — persist locally
    const members = getLocalTeam() ?? [...DEFAULT_TEAM];
    const index = members.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Team member not found');

    const updated: TeamMember = {
      ...members[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    members[index] = updated;
    saveLocalTeam(members);
    return updated;
  }
}

export async function deleteTeamMember(id: string): Promise<boolean> {
  // Try API first
  try {
    const token = getAdminToken();
    await apiDelete(`/api/team/${id}/`, token);
    return true;
  } catch (err) {
    if (!shouldFallbackLocally(err)) throw err;
    // Backend unavailable — persist locally
    const members = getLocalTeam() ?? [...DEFAULT_TEAM];
    const filtered = members.filter((m) => m.id !== id);
    if (filtered.length === members.length) return false;
    saveLocalTeam(filtered);
    return true;
  }
}

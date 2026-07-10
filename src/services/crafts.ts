import { mockCrafts } from '@/data/mock';
import type { Craft } from '@/types';

const delay = () => new Promise((r) => setTimeout(r, 0));

export async function getAllCrafts(): Promise<Craft[]> {
  await delay();
  return [...mockCrafts];
}

export async function getCraftBySlug(slug: string): Promise<Craft | null> {
  await delay();
  return mockCrafts.find((c) => c.slug === slug) ?? null;
}

export async function getCraftById(id: string): Promise<Craft | null> {
  await delay();
  return mockCrafts.find((c) => c.id === id) ?? null;
}

export async function createCraft(data: Omit<Craft, 'id'>): Promise<Craft> {
  await delay();
  const craft: Craft = { ...data, id: `craft-${Date.now()}` };
  mockCrafts.push(craft);
  return craft;
}

export async function updateCraft(id: string, data: Partial<Craft>): Promise<Craft | null> {
  await delay();
  const index = mockCrafts.findIndex((c) => c.id === id);
  if (index === -1) return null;
  const updated = { ...mockCrafts[index], ...data };
  mockCrafts[index] = updated;
  return updated;
}

export async function deleteCraft(id: string): Promise<boolean> {
  await delay();
  const index = mockCrafts.findIndex((c) => c.id === id);
  if (index === -1) return false;
  mockCrafts.splice(index, 1);
  return true;
}

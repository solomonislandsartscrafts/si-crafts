import { mockMakers } from '@/data/mock';
import type { Maker, ConsentStatus } from '@/types';

// Simulate async API call
const delay = () => new Promise((r) => setTimeout(r, 0));

// --- Public (consent-gated) ---

export async function getPublicMakers(): Promise<Maker[]> {
  await delay();
  return mockMakers
    .filter((m) => m.consentStatus === 'Signed' && m.publishedFlag === true)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getPublicMakerBySlug(slug: string): Promise<Maker | null> {
  await delay();
  const maker = mockMakers.find((m) => m.slug === slug);
  if (!maker || maker.consentStatus !== 'Signed' || !maker.publishedFlag) return null;
  return maker;
}

export async function getMakersByCraft(craftId: string): Promise<Maker[]> {
  await delay();
  return mockMakers.filter(
    (m) => m.craftId === craftId && m.consentStatus === 'Signed' && m.publishedFlag
  );
}

// --- Admin (all makers regardless of consent) ---

export async function getAllMakers(): Promise<Maker[]> {
  await delay();
  return [...mockMakers];
}

export async function getMakerById(id: string): Promise<Maker | null> {
  await delay();
  return mockMakers.find((m) => m.id === id) ?? null;
}

export async function createMaker(data: Omit<Maker, 'id' | 'createdAt' | 'updatedAt' | 'publishedFlag'>): Promise<Maker> {
  await delay();
  const maker: Maker = {
    ...data,
    id: `maker-${Date.now()}`,
    publishedFlag: data.consentStatus === 'Signed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockMakers.push(maker);
  return maker;
}

export async function updateMaker(id: string, data: Partial<Maker>): Promise<Maker | null> {
  await delay();
  const index = mockMakers.findIndex((m) => m.id === id);
  if (index === -1) return null;
  const updated = { ...mockMakers[index], ...data, updatedAt: new Date().toISOString() };
  if (data.consentStatus !== undefined) {
    updated.publishedFlag = data.consentStatus === 'Signed';
  }
  mockMakers[index] = updated;
  return updated;
}

export async function deleteMaker(id: string): Promise<boolean> {
  await delay();
  const index = mockMakers.findIndex((m) => m.id === id);
  if (index === -1) return false;
  mockMakers.splice(index, 1);
  return true;
}

export async function setConsentStatus(id: string, status: ConsentStatus): Promise<Maker | null> {
  return updateMaker(id, { consentStatus: status });
}

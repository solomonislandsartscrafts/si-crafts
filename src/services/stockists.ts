import { mockStockists } from '@/data/mock';
import type { Stockist } from '@/types';

const delay = () => new Promise((r) => setTimeout(r, 0));

export async function getStockistById(id: string): Promise<Stockist | null> {
  await delay();
  return mockStockists.find((s) => s.id === id) ?? null;
}

export async function getStockistByEmail(email: string): Promise<Stockist | null> {
  await delay();
  return mockStockists.find((s) => s.email === email) ?? null;
}

export async function getAllStockists(): Promise<Stockist[]> {
  await delay();
  return [...mockStockists];
}

export interface StockistApplicationInput {
  businessName: string;
  abn: string;
  contactName: string;
  email: string;
  phone: string;
  description: string;
}

export async function createApplication(data: StockistApplicationInput): Promise<Stockist> {
  await delay();
  const stockist: Stockist = {
    ...data,
    id: `stockist-${Date.now()}`,
    status: 'pending',
    passwordHash: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockStockists.push(stockist);
  return stockist;
}

export async function approveStockist(id: string): Promise<Stockist | null> {
  await delay();
  const index = mockStockists.findIndex((s) => s.id === id);
  if (index === -1) return null;
  mockStockists[index] = { ...mockStockists[index], status: 'approved', updatedAt: new Date().toISOString() };
  return mockStockists[index];
}

export async function rejectStockist(id: string): Promise<Stockist | null> {
  await delay();
  const index = mockStockists.findIndex((s) => s.id === id);
  if (index === -1) return null;
  mockStockists[index] = { ...mockStockists[index], status: 'rejected', updatedAt: new Date().toISOString() };
  return mockStockists[index];
}

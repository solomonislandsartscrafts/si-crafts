import type { RetailStockist } from '@/types';
import { mockRetailStockists } from '@/data/mock/retail-stockists';

export async function getRetailStockists(): Promise<RetailStockist[]> {
  return mockRetailStockists;
}

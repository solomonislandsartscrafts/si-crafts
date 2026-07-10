import { mockMakers } from '@/data/mock';
import { mockProducts } from '@/data/mock';
import type { Product, MaterialCategory, ProductType } from '@/types';

const delay = () => new Promise((r) => setTimeout(r, 0));

export interface ProductFilters {
  materialCategory?: MaterialCategory;
  productType?: ProductType;
  makerId?: string;
  search?: string;
}

// Helper: check if a maker is published
function isMakerPublished(makerId: string): boolean {
  const maker = mockMakers.find((m) => m.id === makerId);
  return maker?.consentStatus === 'Signed' && maker?.publishedFlag === true;
}

// Product code validation: {P|W|S}-{A-Z+}-{positive integer}
export function validateProductCode(code: string): boolean {
  return /^[PWS]-[A-Z]+-\d+$/.test(code);
}

function applyFilters(products: Product[], filters?: ProductFilters): Product[] {
  let result = products;
  if (filters?.materialCategory) {
    result = result.filter((p) => p.materialCategory === filters.materialCategory);
  }
  if (filters?.productType) {
    result = result.filter((p) => p.productType === filters.productType);
  }
  if (filters?.makerId) {
    result = result.filter((p) => p.makerId === filters.makerId);
  }
  if (filters?.search) {
    const term = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
    );
  }
  return result;
}

// --- Public (excludes products linked to unpublished makers) ---

export async function getPublicProducts(filters?: ProductFilters): Promise<Product[]> {
  await delay();
  const publicProducts = mockProducts.filter((p) => isMakerPublished(p.makerId));
  return applyFilters(publicProducts, filters);
}

export async function getPublicProductByCode(productCode: string): Promise<Product | null> {
  await delay();
  const product = mockProducts.find((p) => p.productCode === productCode);
  if (!product) return null;
  if (!isMakerPublished(product.makerId)) return null;
  return product;
}

export async function getProductsByMaker(makerId: string): Promise<Product[]> {
  await delay();
  return mockProducts.filter((p) => p.makerId === makerId && isMakerPublished(p.makerId));
}

export async function searchProducts(query: string): Promise<Product[]> {
  await delay();
  if (!query.trim()) return [];
  const term = query.toLowerCase();
  return mockProducts.filter(
    (p) =>
      isMakerPublished(p.makerId) &&
      (p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term))
  );
}

// --- Stockist (includes pricing, only published) ---

export async function getWholesaleProducts(filters?: ProductFilters): Promise<Product[]> {
  await delay();
  const published = mockProducts.filter((p) => isMakerPublished(p.makerId));
  return applyFilters(published, filters);
}

// --- Admin (all products) ---

export async function getAllProducts(): Promise<Product[]> {
  await delay();
  return [...mockProducts];
}

export async function getProductById(id: string): Promise<Product | null> {
  await delay();
  return mockProducts.find((p) => p.id === id) ?? null;
}

export async function getProductByCode(code: string): Promise<Product | null> {
  await delay();
  return mockProducts.find((p) => p.productCode === code) ?? null;
}

export async function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'publishedFlag'>): Promise<Product> {
  await delay();
  const product: Product = {
    ...data,
    id: `prod-${Date.now()}`,
    publishedFlag: isMakerPublished(data.makerId),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockProducts.push(product);
  return product;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
  await delay();
  const index = mockProducts.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const updated = { ...mockProducts[index], ...data, updatedAt: new Date().toISOString() };
  mockProducts[index] = updated;
  return updated;
}

export async function deleteProduct(id: string): Promise<boolean> {
  await delay();
  const index = mockProducts.findIndex((p) => p.id === id);
  if (index === -1) return false;
  mockProducts.splice(index, 1);
  return true;
}

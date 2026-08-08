import { apiGet, apiPost, apiDelete, getAdminToken } from '@/lib/api-client';

export interface MaterialCategoryOption {
  value: string;
  label: string;
  codeInitial: string;
}

export interface ProductTypeOption {
  value: string;
  label: string;
}

interface MaterialCategoryResponse {
  id: number;
  value: string;
  label: string;
  code_initial: string;
}

interface ProductTypeResponse {
  id: number;
  value: string;
  label: string;
}

export async function getMaterialCategories(): Promise<MaterialCategoryOption[]> {
  const data = await apiGet<{ results: MaterialCategoryResponse[] } | MaterialCategoryResponse[]>('/api/categories/materials/');
  const items = Array.isArray(data) ? data : data.results ?? [];
  return items.map((c) => ({ value: c.value, label: c.label, codeInitial: c.code_initial }));
}

export async function getProductTypes(): Promise<ProductTypeOption[]> {
  const data = await apiGet<{ results: ProductTypeResponse[] } | ProductTypeResponse[]>('/api/categories/product-types/');
  const items = Array.isArray(data) ? data : data.results ?? [];
  return items.map((t) => ({ value: t.value, label: t.label }));
}

export async function createMaterialCategory(category: MaterialCategoryOption): Promise<void> {
  const token = getAdminToken();
  await apiPost('/api/categories/materials/', {
    value: category.value,
    label: category.label,
    code_initial: category.codeInitial,
  }, token);
}

export async function deleteMaterialCategory(value: string): Promise<void> {
  const token = getAdminToken();
  const data = await apiGet<{ results: MaterialCategoryResponse[] } | MaterialCategoryResponse[]>('/api/categories/materials/');
  const cats = Array.isArray(data) ? data : data.results ?? [];
  const cat = cats.find((c) => c.value === value);
  if (cat) {
    await apiDelete(`/api/categories/materials/${cat.id}/`, token);
  }
}

export async function createProductType(type: ProductTypeOption): Promise<void> {
  const token = getAdminToken();
  await apiPost('/api/categories/product-types/', {
    value: type.value,
    label: type.label,
  }, token);
}

export async function deleteProductType(value: string): Promise<void> {
  const token = getAdminToken();
  const data = await apiGet<{ results: ProductTypeResponse[] } | ProductTypeResponse[]>('/api/categories/product-types/');
  const types = Array.isArray(data) ? data : data.results ?? [];
  const pt = types.find((t) => t.value === value);
  if (pt) {
    await apiDelete(`/api/categories/product-types/${pt.id}/`, token);
  }
}

export interface MaterialCategoryOption {
  value: string;
  label: string;
  /** Initial letter used in product codes (e.g. P for pandanus) */
  codeInitial: string;
}

export interface ProductTypeOption {
  value: string;
  label: string;
}

export let mockMaterialCategories: MaterialCategoryOption[] = [
  { value: 'pandanus', label: 'Pandanus', codeInitial: 'P' },
  { value: 'wood', label: 'Wood', codeInitial: 'W' },
  { value: 'shells', label: 'Shells', codeInitial: 'S' },
  { value: 'bush-twine', label: 'Bush-twine', codeInitial: 'B' },
];

export let mockProductTypes: ProductTypeOption[] = [
  { value: 'bags', label: 'Bags' },
  { value: 'purses', label: 'Purses' },
  { value: 'jewellery', label: 'Jewellery' },
  { value: 'trays', label: 'Trays' },
  { value: 'fans', label: 'Fans' },
  { value: 'bowls', label: 'Bowls' },
  { value: 'ornaments', label: 'Ornaments' },
  { value: 'carvings', label: 'Carvings' },
  { value: 'baskets', label: 'Baskets' },
  { value: 'brooches', label: 'Brooches' },
  { value: 'kits', label: 'Kits' },
];

export function addMaterialCategory(category: MaterialCategoryOption): void {
  mockMaterialCategories = [...mockMaterialCategories, category];
}

export function removeMaterialCategory(value: string): void {
  mockMaterialCategories = mockMaterialCategories.filter((c) => c.value !== value);
}

export function addProductType(type: ProductTypeOption): void {
  mockProductTypes = [...mockProductTypes, type];
}

export function removeProductType(value: string): void {
  mockProductTypes = mockProductTypes.filter((t) => t.value !== value);
}

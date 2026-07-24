export type MaterialCategory = 'pandanus' | 'wood' | 'shells' | 'bush-twine';
export type ProductType = 'bags' | 'jewellery' | 'trays' | 'fans' | 'bowls' | 'ornaments' | 'baskets' | 'brooches' | 'carvings' | 'kits' | 'purses';

export interface Product {
  id: string;
  productCode: string;
  slug: string;
  name: string;
  description: string;
  materialCategory: MaterialCategory;
  productType: ProductType;
  makerId: string;
  craftId: string;
  imageUrls: string[];
  dimensions: string | null;
  careNotes: string | null;
  wholesalePrice: number;
  publishedFlag: boolean;
  createdAt: string;
  updatedAt: string;
}

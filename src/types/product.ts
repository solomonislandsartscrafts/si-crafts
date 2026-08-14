export type MaterialCategory = string;
export type ProductType = string;

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
  imageAlts: string[];
  dimensions: string | null;
  careNotes: string | null;
  wholesalePrice: number;
  publishedFlag: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

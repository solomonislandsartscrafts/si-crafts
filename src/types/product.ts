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
  publishedFlag: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * A product with its wholesale price. Only ever built from authenticated
 * responses (admin write API, stockist price endpoint) — the public product
 * type above deliberately has no price, so it cannot leak into public pages.
 */
export type PricedProduct = Product & { wholesalePrice: number };

import { generatePageMetadata } from '@/lib/metadata';
import { getPublicProducts } from '@/services/products';
import { getPublicMakers } from '@/services/makers';
import { getMaterialCategories } from '@/services/categories';
import { PageHeader } from '@/components/layout';
import { CatalogueClient } from './catalogue-client';

export const metadata = generatePageMetadata({
  title: 'Catalogue',
  description:
    'Browse our full collection of Solomon Islands handicrafts — pandanus weaving, wood carving, and shell-money jewellery.',
  path: '/catalogue',
});

export default async function CataloguePage() {
  const [products, makers, materialCategories] = await Promise.all([
    getPublicProducts(),
    getPublicMakers(),
    getMaterialCategories(),
  ]);

  return (
    <div>
      <PageHeader
        title="Catalogue"
        intro="Browse our full collection of Solomon Islands handicrafts. All items are made from renewable, natural resources that are locally-sourced and sustainable."
      />
      <CatalogueClient
        products={products}
        makers={makers}
        materialCategories={materialCategories}
      />
    </div>
  );
}

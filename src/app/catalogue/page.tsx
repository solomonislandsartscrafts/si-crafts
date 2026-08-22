import { generatePageMetadata } from '@/lib/metadata';
import { getPublicProducts } from '@/services/products';
import { getPublicMakers } from '@/services/makers';
import { getMaterialCategories } from '@/services/categories';
import { getSiteTextSafe } from '@/services/site-text';
import { PageHeader } from '@/components/layout';
import { CatalogueClient } from './catalogue-client';

export const metadata = generatePageMetadata({
  title: 'Catalogue',
  description:
    'Browse our full collection of Solomon Islands handicrafts — pandanus weaving, wood carving, and shell-money jewellery.',
  path: '/catalogue',
});

export default async function CataloguePage() {
  const [products, makers, materialCategories, text] = await Promise.all([
    getPublicProducts(),
    getPublicMakers(),
    getMaterialCategories(),
    getSiteTextSafe(),
  ]);

  return (
    <div>
      <PageHeader title={text['catalogue.title']} intro={text['catalogue.intro']} />
      <CatalogueClient
        products={products}
        makers={makers}
        materialCategories={materialCategories}
        pricingPrompt={text['catalogue.pricingPrompt']}
        emptyTitle={text['catalogue.emptyTitle']}
        emptyDescription={text['catalogue.emptyDescription']}
      />
    </div>
  );
}

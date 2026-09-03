import { generatePageMetadata } from '@/lib/metadata';
import { getPublicProducts } from '@/services/products';
import { getPublicMakers } from '@/services/makers';
import { getMaterialCategories } from '@/services/categories';
import { getSiteTextSafe } from '@/services/site-text';
import { PageHeader } from '@/components/layout';
import { CatalogueClient } from './catalogue-client';
import { StockistBannerPrompt } from '@/components/catalogue/stockist-banner-prompt';

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
      <PageHeader
        banner="gold"
        eyebrow="Full collection"
        title={text['catalogue.title']}
        intro={text['catalogue.intro']}
      >
        {/* Stockist invite lives in the banner so it never pushes the product
            grid down. Hidden for logged-in stockists (client-checked).
            `onLight` because the catalogue banner is the light `gold` fill. */}
        <StockistBannerPrompt prompt={text['catalogue.pricingPrompt']} onLight />
      </PageHeader>
      <CatalogueClient
        products={products}
        makers={makers}
        materialCategories={materialCategories}
        emptyTitle={text['catalogue.emptyTitle']}
        emptyDescription={text['catalogue.emptyDescription']}
      />
    </div>
  );
}

/**
 * Dashboard service — aggregates counts, attention items and recent activity
 * for the admin dashboard. Pages read only from here, never from other
 * services or mock data directly.
 */

import type {
  ActivityItem,
  AttentionItem,
  DashboardSummary,
  Maker,
  Product,
  Craft,
  Article,
  OrderRequest,
  Stockist,
  AnyEnquiry,
} from '@/types';

import { formatPrice } from '@/lib/price';
import { getAllMakers } from './makers';
import { getAllProducts } from './products';
import { getAllCrafts } from './crafts';
import { getAllOrders } from './orders';
import { listEnquiries } from './enquiries';
import { getAllStockists } from './stockists';
import { getMaterialCategories } from './categories';
import { getAllArticles } from './articles';
import { getSiteContent } from './site-content';
import { hasMissingAlt } from '@/lib/image-alt';

/** Blank text counts as missing. */
function isBlank(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  // Fetch independently so one failing source doesn't blank the dashboard.
  const [makers, products, crafts, orders, enquiries, categories, articles, stockists, siteContent] =
    await Promise.all([
      getAllMakers().catch((): Maker[] => []),
      getAllProducts().catch((): Product[] => []),
      getAllCrafts().catch((): Craft[] => []),
      getAllOrders().catch((): OrderRequest[] => []),
      listEnquiries().catch((): AnyEnquiry[] => []),
      getMaterialCategories().catch(() => []),
      getAllArticles().catch((): Article[] => []),
      getAllStockists().catch((): Stockist[] => []),
      getSiteContent().catch(() => null),
    ]);

  const openEnquiries = enquiries.filter((e) => !e.data?.handled);
  const pendingStockists = stockists.filter((s) => s.status === 'pending');
  const ordersToAction = orders.filter((o) => o.status === 'Submitted');

  const siteImages = siteContent
    ? [
        siteContent.aboutSolomonIslandsImage,
        siteContent.aboutTeamImage,
        siteContent.whyWeDoThisImage,
      ].filter((url) => !isBlank(url)).length
    : 0;

  return {
    counts: {
      makers: makers.length,
      makersPublished: makers.filter((m) => m.publishedFlag).length,
      products: products.length,
      productsPublished: products.filter((p) => p.publishedFlag).length,
      crafts: crafts.length,
      categories: categories.length,
      articles: articles.length,
      articlesPublished: articles.filter((a) => a.published).length,
      stockists: stockists.length,
      stockistsApproved: stockists.filter((s) => s.status === 'approved').length,
      stockistsPending: pendingStockists.length,
      orders: orders.length,
      ordersToAction: ordersToAction.length,
      openEnquiries: openEnquiries.length,
    },
    setup: {
      categories: categories.length,
      crafts: crafts.length,
      makers: makers.length,
      products: products.length,
      articles: articles.length,
      siteImages,
    },
    attention: buildAttention({ makers, products, crafts, articles, stockists, orders, openEnquiries }),
    activity: buildActivity({ makers, products, articles, orders, enquiries }),
  };
}

// --- Needs attention ---------------------------------------------------------

function buildAttention(input: {
  makers: Maker[];
  products: Product[];
  crafts: Craft[];
  articles: Article[];
  stockists: Stockist[];
  orders: OrderRequest[];
  openEnquiries: AnyEnquiry[];
}): AttentionItem[] {
  const { makers, products, crafts, articles, stockists, orders, openEnquiries } = input;

  // Consent rule: a maker without signed consent must never be public.
  const publishedWithoutConsent = makers.filter(
    (m) => m.publishedFlag && m.consentStatus !== 'Signed'
  );
  const readyToPublish = makers.filter((m) => m.consentStatus === 'Signed' && !m.publishedFlag);
  const makersMissingAlt = makers.filter((m) => m.portraitUrl && isBlank(m.portraitAlt));
  const makersMissingStory = makers.filter((m) => isBlank(m.story));
  const storiesUnreviewed = makers.filter((m) => m.storyCulturalReviewFlag === 'unreviewed');
  const craftsUnreviewed = crafts.filter((c) => c.culturalContextReviewFlag === 'unreviewed');
  const productsMissingAlt = products.filter((p) => hasMissingAlt(p.imageUrls, p.imageAlts));
  const productsNoImages = products.filter((p) => p.imageUrls.length === 0);
  const productsDraft = products.filter((p) => !p.publishedFlag);
  const articlesDraft = articles.filter((a) => !a.published);
  const pendingStockists = stockists.filter((s) => s.status === 'pending');
  const ordersToAction = orders.filter((o) => o.status === 'Submitted');

  const candidates: AttentionItem[] = [
    {
      id: 'consent-breach',
      severity: 'error',
      count: publishedWithoutConsent.length,
      label: `${plural(publishedWithoutConsent.length, 'maker is', 'makers are')} public without signed consent`,
      detail: 'Unpublish them or record signed consent. Consent gating is not optional.',
      href: '/admin/makers',
    },
    {
      id: 'products-no-images',
      severity: 'error',
      count: productsNoImages.length,
      label: `${plural(productsNoImages.length, 'product has', 'products have')} no photos`,
      detail: 'Stockists cannot judge a piece without images.',
      href: '/admin/products',
    },
    {
      id: 'enquiries',
      severity: 'warning',
      count: openEnquiries.length,
      label: `${plural(openEnquiries.length, 'enquiry', 'enquiries')} waiting for a reply`,
      detail: 'Answer, then mark as handled to clear the inbox.',
      href: '/admin/inbox',
    },
    {
      id: 'stockists-pending',
      severity: 'warning',
      count: pendingStockists.length,
      label: `${plural(pendingStockists.length, 'stockist application', 'stockist applications')} to review`,
      detail: 'Approve to give them pricing access, or reject.',
      href: '/admin/stockists',
    },
    {
      id: 'orders-submitted',
      severity: 'warning',
      count: ordersToAction.length,
      label: `${plural(ordersToAction.length, 'order request', 'order requests')} not yet confirmed`,
      detail: 'Confirm the request and send bank transfer details.',
      href: '/admin/orders',
    },
    {
      id: 'products-alt',
      severity: 'warning',
      count: productsMissingAlt.length,
      label: `${plural(productsMissingAlt.length, 'product is', 'products are')} missing image alt text`,
      detail: 'Alt text is required for screen readers and helps search engines.',
      href: '/admin/products',
    },
    {
      id: 'makers-alt',
      severity: 'warning',
      count: makersMissingAlt.length,
      label: `${plural(makersMissingAlt.length, 'maker portrait is', 'maker portraits are')} missing alt text`,
      detail: 'Describe who is in the photo and what they are doing.',
      href: '/admin/makers',
    },
    {
      id: 'cultural-review',
      severity: 'warning',
      count: storiesUnreviewed.length + craftsUnreviewed.length,
      label: `${plural(storiesUnreviewed.length + craftsUnreviewed.length, 'entry needs', 'entries need')} cultural review`,
      detail: 'Maker stories and cultural context must be checked before going live.',
      href: '/admin/makers',
    },
    {
      id: 'makers-no-story',
      severity: 'info',
      count: makersMissingStory.length,
      label: `${plural(makersMissingStory.length, 'maker has', 'makers have')} no story yet`,
      detail: 'Stories in the maker\u2019s own voice are what build provenance trust.',
      href: '/admin/makers',
    },
    {
      id: 'makers-ready',
      severity: 'info',
      count: readyToPublish.length,
      label: `${plural(readyToPublish.length, 'maker is', 'makers are')} ready to publish`,
      detail: 'Consent is signed but they are still hidden from the public site.',
      href: '/admin/makers',
    },
    {
      id: 'products-draft',
      severity: 'info',
      count: productsDraft.length,
      label: `${plural(productsDraft.length, 'product is', 'products are')} unpublished`,
      detail: 'Drafts stay hidden until you tick Published.',
      href: '/admin/products',
    },
    {
      id: 'articles-draft',
      severity: 'info',
      count: articlesDraft.length,
      label: `${plural(articlesDraft.length, 'news article is', 'news articles are')} in draft`,
      detail: 'Publish when the story is ready.',
      href: '/admin/news',
    },
  ];

  const order = { error: 0, warning: 1, info: 2 };
  return candidates
    .filter((item) => item.count > 0)
    .sort((a, b) => order[a.severity] - order[b.severity] || b.count - a.count);
}

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

// --- Recent activity ---------------------------------------------------------

const ACTIVITY_LIMIT = 8;

function buildActivity(input: {
  makers: Maker[];
  products: Product[];
  articles: Article[];
  orders: OrderRequest[];
  enquiries: AnyEnquiry[];
}): ActivityItem[] {
  const { makers, products, articles, orders, enquiries } = input;

  const items: ActivityItem[] = [
    ...makers.map((m) => ({
      id: `maker-${m.id}`,
      kind: 'maker' as const,
      label: m.name,
      detail: `${m.village}, ${m.province}`,
      at: m.updatedAt || m.createdAt,
      href: '/admin/makers',
    })),
    ...products.map((p) => ({
      id: `product-${p.id}`,
      kind: 'product' as const,
      label: p.name,
      detail: p.productCode,
      at: p.updatedAt || p.createdAt,
      href: '/admin/products',
    })),
    ...articles.map((a) => ({
      id: `article-${a.id}`,
      kind: 'article' as const,
      label: a.title,
      detail: a.published ? 'Published' : 'Draft',
      at: a.updatedAt || a.createdAt,
      href: '/admin/news',
    })),
    ...orders.map((o) => ({
      id: `order-${o.id}`,
      kind: 'order' as const,
      label: o.referenceNumber,
      detail: `${o.status} \u00b7 ${formatPrice(o.totalAud)}`,
      at: o.submittedAt,
      href: '/admin/orders',
    })),
    ...enquiries.map((e) => ({
      id: `enquiry-${e.type}-${e.data.id}`,
      kind: 'enquiry' as const,
      label: enquiryLabel(e),
      detail: e.data.handled ? 'Handled' : 'Awaiting reply',
      at: e.data.submittedAt,
      href: '/admin/inbox',
    })),
  ];

  return items
    .filter((item) => Boolean(item.at))
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, ACTIVITY_LIMIT);
}

function enquiryLabel(entry: AnyEnquiry): string {
  switch (entry.type) {
    case 'maker-enquiry':
      return `Maker enquiry from ${entry.data.name}`;
    case 'stockist-request':
      return 'Stockist request';
    case 'media':
      return `Media enquiry from ${entry.data.name}`;
    default:
      return `Contact enquiry from ${entry.data.name}`;
  }
}

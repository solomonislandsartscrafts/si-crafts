import { apiGet, apiGetPublic, apiPost, apiPatch, apiDelete, getAdminToken } from '@/lib/api-client';
import type { Faq } from '@/types';

interface ApiFaq {
  id: number;
  question: string;
  answer: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

function mapFaq(raw: ApiFaq): Faq {
  return {
    id: String(raw.id),
    question: raw.question,
    answer: raw.answer || '',
    sortOrder: raw.sort_order,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

/** DRF returns a bare array when pagination is off, an envelope when it isn't. */
function toList(data: ApiFaq[] | { results: ApiFaq[] }): Faq[] {
  const list = Array.isArray(data) ? data : (data?.results ?? []);
  return list.map(mapFaq);
}

/**
 * Fallback copy used only when the backend cannot be reached.
 *
 * The database is seeded with these same entries (see the faqs app's
 * 0002_seed_faqs migration), so this is never the source of truth — it just
 * stops a cold backend rendering an empty FAQ page. Edits happen in the admin.
 */
const DEFAULT_FAQS: Faq[] = [
  {
    question: 'How does wholesale ordering work?',
    answer: 'Browse our catalogue, build an order, and submit it as an expression of interest. We confirm availability, send an invoice, and ship once payment is received by bank transfer. There are no minimum order quantities, but we encourage orders of at least 6 pieces for shipping efficiency.',
  },
  {
    question: 'How long does delivery take?',
    answer: 'We ship from Sydney within 3–5 business days of receiving payment. Delivery within Australia is typically 2–5 business days depending on your location. Within Australia, we use tracked shipping on all orders. In 2026 when we started this small business, we made one shopping trip to purchase orders directly from the makers in Solomon Islands. We intend to do this each year while also exploring a reliable and cost-effective freight and customs service between Honiara and Australia.',
  },
  {
    question: 'What is your returns policy?',
    answer: 'Because each piece is handmade, no two are identical. We accept returns for damage in transit within 7 days of delivery — contact us with photos of the damage and we will arrange a replacement or refund. We cannot accept returns for change of mind on handmade goods.',
  },
  {
    question: 'Can I return unsold goods?',
    answer: 'No — orders are purchased outright at wholesale prices.',
  },
  {
    question: 'Do you sell to the public?',
    answer: 'No — Solomon Islands Arts & Crafts is wholesale-only. We do not sell individual pieces to the public. If you are a retail customer, please visit one of our stocking retailers (check the “Where to buy” section on any product’s provenance page) to purchase a piece in person or by using that shop’s online ordering service.',
  },
  {
    question: 'Can I order custom or bulk items?',
    answer: 'Yes — we can arrange customised pieces (e.g. a gallery or person’s name woven into a bag border) and bulk orders for exhibitions or events. Lead times are longer as makers produce to order. Log in to your stockist account and submit a request under “Requests”, or contact us to discuss.',
  },
  {
    question: 'How do I get a replacement tag if mine fell off?',
    answer: 'Log in to your stockist account and go to “Requests” → “Replacement Tags”. Enter the product code and quantity needed. We’ll post new tags to you at no charge.',
  },
  {
    question: 'Why do you sell only through museum and gallery shops?',
    answer: 'We are a small volunteer team. Selling wholesale means we can sell more pieces with fewer transactions, keep admin low, and focus our time on relationships with makers and stockists. Museum and gallery shops also provide an environment where authenticity, art and storytelling are valued — which respects the work and the makers behind it.',
  },
  {
    question: 'Are the items really made in Solomon Islands?',
    answer: 'Yes — every piece is handmade by a named maker in their community. Each product tag carries a code that links to a provenance page showing who made it, where, and how. We buy directly from makers; there is no third-party factory or intermediary supply chain.',
  },
  {
    question: 'How much of the price goes back to the maker?',
    answer: 'Makers set their own prices and are paid upfront when we purchase the work — before it reaches Australia. SIAC’s margin covers international freight, documentation, liaising with the makers and distribution. No one at SIAC draws a salary from craft sales. See the Our Promise page for more detail.',
  },
  {
    question: 'How do I become a stockist?',
    answer: 'Submit an application through our Wholesale page with your business details and ABN. We review applications within a few business days and will be in touch once approved.',
  },
  {
    question: 'What about GST?',
    answer: 'Our wholesale prices are quoted exclusive of GST. Whether you need to register for and charge GST depends on your actual or projected annual GST turnover — generally AUD$75,000 for businesses or AUD$150,000 for non-profit organisations. Please consult your accountant for advice specific to your business.',
  },
  {
    question: 'I’m a maker in Solomon Islands — how can I sell my arts and crafts through SIAC?',
    answer: 'Fantastic! We’d love to hear from you. Read the information on the “For Makers” page and use the contact form to tell us about the things you make. We will try and reply within a few days.',
  },
].map((faq, i) => ({
  id: String(i + 1),
  ...faq,
  sortOrder: i + 1,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}));

// --- Public ---

/**
 * FAQs for the public site. Cached (ISR) and throws when the backend is
 * unreachable, so a cold start can't get an empty page cached at the edge.
 */
export async function getFaqs(): Promise<Faq[]> {
  return toList(await apiGetPublic<ApiFaq[] | { results: ApiFaq[] }>('/api/faqs/'));
}

/** Safe variant for public pages — falls back to DEFAULT_FAQS if the fetch fails. */
export async function getFaqsSafe(): Promise<Faq[]> {
  try {
    return await getFaqs();
  } catch {
    return DEFAULT_FAQS;
  }
}

// --- Admin ---

/** Un-cached read for the admin screen, so edits show up immediately. */
export async function getFaqsForAdmin(): Promise<Faq[]> {
  return toList(await apiGet<ApiFaq[] | { results: ApiFaq[] }>('/api/faqs/'));
}

export async function createFaq(
  data: Pick<Faq, 'question' | 'answer' | 'sortOrder'>
): Promise<Faq> {
  const raw = await apiPost<ApiFaq>(
    '/api/faqs/',
    {
      question: data.question,
      answer: data.answer,
      sort_order: data.sortOrder,
    },
    getAdminToken()
  );
  return mapFaq(raw);
}

export async function updateFaq(
  id: string,
  data: Partial<Pick<Faq, 'question' | 'answer' | 'sortOrder'>>
): Promise<Faq> {
  const body: Record<string, unknown> = {};
  if (data.question !== undefined) body.question = data.question;
  if (data.answer !== undefined) body.answer = data.answer;
  if (data.sortOrder !== undefined) body.sort_order = data.sortOrder;

  const raw = await apiPatch<ApiFaq>(`/api/faqs/${id}/`, body, getAdminToken());
  return mapFaq(raw);
}

export async function deleteFaq(id: string): Promise<void> {
  await apiDelete(`/api/faqs/${id}/`, getAdminToken());
}

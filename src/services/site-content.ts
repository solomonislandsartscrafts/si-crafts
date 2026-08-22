import { apiGet, apiGetPublic, apiPut, getAdminToken } from '@/lib/api-client';
import type { SiteContent } from '@/types';

const EMPTY_SITE_CONTENT: SiteContent = {
  // Images
  aboutSolomonIslandsImage: '',
  aboutSolomonIslandsImageAlt: '',
  aboutTeamImage: '',
  aboutTeamImageAlt: '',
  whyWeDoThisImage: '',
  whyWeDoThisImageAlt: '',
  // Homepage
  homepageHeading: 'Meet the Makers Behind Every Piece',
  homepageIntro: 'Every product is handmade. When you buy from us, you invest directly in Solomon Islands artisans, their communities, their traditions, and their futures.',
  homepageCtaText: 'Browse Catalogue',
  homepageMakersHeading: 'Handmade in Solomon Islands',
  homepageMakersIntro: 'Scan the QR code on any product tag to discover the story of the maker who created it.',
  // About
  aboutPageIntro: 'Solomon Islands Arts & Crafts connects makers in Solomon Islands with museum and gallery shops in Australia — telling authentic stories and building respectful trade relationships.',
  aboutSolomonIslandsHeading: 'About Solomon Islands',
  aboutSolomonIslandsText: [
    'Solomon Islands is a sovereign nation of over 990 islands spread across the southwestern Pacific Ocean. It is about three hours by plane from Brisbane. Home to around 700,000 people speaking more than 70 languages, the country holds one of the most diverse cultural heritages in the Pacific region.',
    'The islands are rich with tropical rainforest, coral reefs, and volcanic landscapes. Communities are spread across nine provinces from the large island of Guadalcanal in the south to the remote Temotu Province in the far east. Each province has distinct traditions, art forms, and materials shaped by geography and ancestry. The capital, Honiara, is on Guadalcanal and was a strategic military base during World War II.',
    'Craft traditions — pandanus weaving, wood carving, and shell-money making — are living practices passed through families and communities, not museum artefacts. They carry stories of place, kinship, and identity.',
  ].join('\n\n'),
  aboutSolomonIslandsLinkText: 'Find out more about Solomon Islands',
  aboutSolomonIslandsLinkUrl: 'https://en.wikipedia.org/wiki/Solomon_Islands',
  aboutTeamHeading: 'Our Team',
  aboutTeamText: [
    'Solomon Islands Arts & Crafts is run entirely by volunteers who share a connection to Solomon Islands — through family, work, friendship, or simply a deep respect for the culture and its people.',
    'Our team handles importing, quality documentation, photography, liaising with makers, and wholesale distribution to Australian museum and gallery shops. We work directly with makers and their families to ensure every relationship is fair, respectful, and transparent.',
    'We are not a charity. We are a small business built on the principle that these extraordinary crafts deserve to reach a wider audience — and that the makers deserve fair payment and recognition for their work. Solomon Islands Arts & Crafts was founded in 2026 as a volunteer-run social enterprise.',
  ].join('\n\n'),
  aboutTeamLinkText: 'Find out more about our team →',
  aboutTeamLinkUrl: '/about/team',
  aboutWhyHeading: 'Why We’re Doing This',
  aboutWhyText: [
    'Solomon Islands’ makers produce work of extraordinary skill and beauty — pandanus bags that take weeks to weave, shell-money necklaces ground disc by disc, carvings shaped from hardwood and inlaid with pearl shell over days of careful work.',
    'But access to markets outside Solomon Islands is limited. Transport is expensive, connections are few, and the stories behind the work rarely travel with the pieces.',
    'We exist to bridge that gap. Every product we bring to Australia carries the maker’s name, village, and story. Every product tag links to a provenance page that tells you exactly who made your piece and how. We believe knowing the maker transforms an object into a connection to a person and a place.',
    'Providing a wider market for Solomon Islands arts and crafts also helps to maintain cultural traditions and the transfer of skills through generations.',
    'Our goal is simple: more income for makers, more stories shared, more respect for Solomon Islands craft traditions in the wider world.',
  ].join('\n\n'),
  aboutWhyLinkText: 'Are you a maker in Solomon Islands? Learn how to work with us →',
  aboutWhyLinkUrl: '/for-makers',
  // Wholesale
  wholesaleIntro: 'We supply authentic Solomon Islands handicrafts to museum and gallery shops across Australia at wholesale prices.',
  wholesaleHowItWorks: '1. Apply for a stockist account\n2. Browse the full catalogue with pricing\n3. Place an order request\n4. We confirm availability and send an invoice\n5. Pay by bank transfer\n6. We ship to your store',
  wholesaleMinimumOrder: 'No minimum order. Orders over A$1,000 may attract GST.',
  // Care Guide
  careGuideIntro: 'Each piece is made from natural materials that will last for years with proper care. Here are our recommendations for each material type.',
  careGuidePandanus: 'Keep dry and out of direct sunlight\nStore flat or stuffed with acid-free tissue\nDust gently with a soft dry cloth\nAvoid folding or crushing woven pieces',
  careGuideWood: 'Oil occasionally with food-safe wood oil\nKeep away from direct heat and sunlight\nDust with a soft dry cloth\nMinor cracks are natural and add character',
  careGuideShell: 'Wipe gently with a soft damp cloth\nStore separately to avoid scratching\nAvoid contact with perfume or chemicals\nKeep away from prolonged moisture',
  // Contact
  contactIntro: 'Get in touch with the Solomon Islands Arts & Crafts team.',
  // Deliberately the address the Contact page has been showing all along. The
  // previous default here was hello@solomonislandsartsandcrafts.com.au, which
  // never rendered because the page hardcoded its own — so wiring the field up
  // would have silently changed a live contact address. Change it in the admin
  // once you've confirmed which inbox is monitored.
  contactEmail: 'hello@siac.com.au',
  contactResponseTime:
    'We’re a small volunteer team based in Sydney, Australia and Dunedin, New Zealand. We aim to respond to all enquiries within 2–3 business days.',
};

function mapSiteContent(raw: Record<string, unknown>): SiteContent {
  const result = { ...EMPTY_SITE_CONTENT };
  for (const key of Object.keys(result) as (keyof SiteContent)[]) {
    if (typeof raw[key] === 'string' && (raw[key] as string).trim() !== '') {
      result[key] = raw[key] as string;
    }
  }
  return result;
}

/** Un-cached read. Used by the admin editor, which must see its own last save. */
export async function getSiteContent(): Promise<SiteContent> {
  const raw = await apiGet<Record<string, unknown>>('/api/site-content/');
  // If backend returns an unexpected shape, treat as failure
  if (!raw || Array.isArray(raw)) {
    throw new Error('Failed to load site content: invalid response');
  }
  return mapSiteContent(raw);
}

/**
 * Safe variant for public pages — falls back to the defaults above on failure
 * so the page can still render.
 *
 * Cached (ISR) rather than no-store. An un-cached read forces every page that
 * shows site copy to be server-rendered on demand, which on a free-tier backend
 * means a visitor can end up waiting on a cold start just to read the Contact
 * page. The cost is that an admin edit takes up to PUBLIC_REVALIDATE_SECONDS to
 * appear, which is the same deal the rest of the public site already makes.
 */
export async function getSiteContentSafe(): Promise<SiteContent> {
  try {
    const raw = await apiGetPublic<Record<string, unknown>>('/api/site-content/');
    if (!raw || Array.isArray(raw)) {
      throw new Error('Failed to load site content: invalid response');
    }
    return mapSiteContent(raw);
  } catch {
    return EMPTY_SITE_CONTENT;
  }
}

export async function updateSiteContent(data: Partial<SiteContent>): Promise<SiteContent> {
  const token = getAdminToken();
  const raw = await apiPut<Record<string, unknown>>('/api/site-content/', data, token);
  return mapSiteContent(raw);
}

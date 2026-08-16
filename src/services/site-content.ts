import { apiGet, apiPut, getAdminToken } from '@/lib/api-client';
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
  aboutPageIntro: 'Solomon Islands Arts Crafts connects makers in Solomon Islands with museum and gallery shops in Australia — telling authentic stories and building respectful trade relationships.',
  aboutSolomonIslandsHeading: 'About Solomon Islands',
  aboutSolomonIslandsText: 'Solomon Islands is a sovereign nation of over 990 islands in the South Pacific, east of Papua New Guinea. Its people have practised weaving, carving, and shell-work for thousands of years — skills passed down through generations within families and communities.',
  aboutSolomonIslandsLinkText: '',
  aboutSolomonIslandsLinkUrl: '',
  aboutTeamHeading: 'About the Solomon Islands Arts Crafts (SIAC) Team',
  aboutTeamText: 'Solomon Islands Arts Crafts is run entirely by volunteers who share a connection to Solomon Islands — through family, work, friendship, or simply a deep respect for the culture and its people.',
  aboutTeamLinkText: 'Find out more about our team →',
  aboutTeamLinkUrl: '/about/team',
  aboutWhyHeading: "Why We're Doing This",
  aboutWhyText: 'Solomon Islands makers produce work of extraordinary skill and cultural significance, but access to international markets is limited. We believe these extraordinary crafts deserve to reach a wider audience — and that the makers deserve fair payment and recognition for their work.',
  aboutWhyLinkText: 'Are you a maker in Solomon Islands? Learn how to work with us →',
  aboutWhyLinkUrl: '/for-makers',
  // Catalogue
  catalogueIntro: 'Browse our full collection of Solomon Islands handicrafts. All items are made from renewable, natural resources that are locally-sourced and sustainable.',
  // News
  newsIntro: 'Stories and updates from Solomon Islands Arts Crafts — makers, crafts, and the people we work with.',
  // Stockists
  stockistsIntro: 'Find Solomon Islands Arts Crafts in these museum and gallery shops. Visit in person or contact them to ask about availability.',
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
  contactIntro: 'Get in touch with the Solomon Islands Arts Crafts team.',
  contactEmail: 'hello@solomonislandsartsandcrafts.com.au',
  contactResponseTime: 'We usually respond within 2 business days.',
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

export async function getSiteContent(): Promise<SiteContent> {
  const raw = await apiGet<Record<string, unknown>>('/api/site-content/');
  // If backend returns an unexpected shape, treat as failure
  if (!raw || Array.isArray(raw)) {
    throw new Error('Failed to load site content: invalid response');
  }
  return mapSiteContent(raw);
}

/**
 * Safe variant for public pages — returns empty defaults on failure
 * so the page can still render with fallback copy.
 */
export async function getSiteContentSafe(): Promise<SiteContent> {
  try {
    return await getSiteContent();
  } catch {
    return EMPTY_SITE_CONTENT;
  }
}

export async function updateSiteContent(data: Partial<SiteContent>): Promise<SiteContent> {
  const token = getAdminToken();
  const raw = await apiPut<Record<string, unknown>>('/api/site-content/', data, token);
  return mapSiteContent(raw);
}

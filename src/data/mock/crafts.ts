import type { Craft } from '@/types';

export const mockCrafts: Craft[] = [
  {
    id: 'craft-1',
    slug: 'pandanus-weaving',
    name: 'Pandanus Weaving',
    description:
      'Pandanus weaving is a centuries-old tradition across Solomon Islands. Women harvest pandanus leaves, dry and strip them into fine strands, then weave intricate patterns passed down through generations. Each piece takes days or weeks to complete, with patterns often carrying family or clan significance. The tightness of the weave, the choice of natural dyes, and the finishing all reflect the skill and identity of the maker.',
    processImageUrls: ['/images/P1.png'],
    culturalContext:
      'In many Solomon Islands communities, weaving knowledge is passed from mother to daughter. Specific patterns may belong to particular families or clans and carry stories of origin, place, and kinship.',
    culturalContextReviewFlag: 'unreviewed',
    materialCategory: 'pandanus',
  },
  {
    id: 'craft-2',
    slug: 'wood-carving',
    name: 'Wood Carving',
    description:
      "Wood carving in Solomon Islands draws on hardwoods like kerosene wood and ebony, shaped with hand tools into bowls, figures, and ceremonial objects. Carvers work with the natural grain, creating smooth finishes that highlight the wood's depth and colour. Designs range from functional household items to elaborate ceremonial pieces, each reflecting the carver's province and tradition.",
    processImageUrls: ['/images/P3.png'],
    culturalContext:
      'Carving traditions vary by island and province. In Western Province, nguzunguzu (ship prow figures) are carved as protective spirits for canoes. In Malaita, carvings may depict ancestral figures.',
    culturalContextReviewFlag: 'unreviewed',
    materialCategory: 'wood',
  },
  {
    id: 'craft-3',
    slug: 'shell-money-jewellery',
    name: 'Shell-Money Jewellery',
    description:
      'Shell money (tafuliae) is both currency and adornment in Solomon Islands, particularly in Malaita Province. Tiny shell discs are painstakingly ground, drilled, and strung into strands that can take months to produce. Modern jewellery incorporates these traditional techniques into necklaces, bracelets, and earrings that honour the craft while being wearable every day.',
    processImageUrls: ['/images/P5.png'],
    culturalContext:
      'Shell money holds deep cultural significance in Malaita and parts of Guadalcanal. It is used in bride price, compensation payments, and ceremonies. Its value is determined by colour, size uniformity, and length of strand.',
    culturalContextReviewFlag: 'unreviewed',
    materialCategory: 'shells',
  },
];

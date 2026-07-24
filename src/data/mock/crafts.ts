import type { Craft } from '@/types';

export const mockCrafts: Craft[] = [
  {
    id: 'craft-1',
    slug: 'pandanus-weaving',
    name: 'Pandanus Weaving',
    description:
      'Most bags and mats are made from the leaves of the pandanus tree. The leaves are soaked in water with the husks of coconuts for about a week to make them soft and pliable. Then they are hung up to dry in the sun for several weeks and cut into strips using a special tool. The handles of the bags are made from the bark of the Wa\'ai tree, not pandanus. Black pandanus is made by boiling the pandanus with the leaves of the Talisay or Indian almond tree for 2–3 hours before commencing the drying process. Weavers adapt traditional materials and techniques to create modern styles — from shoulder bags with Rennell and Bellona province patterns to clutch purses and cross-body bags with zips and synthetic dyes.',
    processImageUrls: ['/images/pandanus/Barbara demo weaving technique.jpg', '/images/pandanus/raw pandanus roll.jpg', '/images/pandanus/tool for making pandanus.jpg', '/images/pandanus/Pandanus tree.jpg', '/images/pandanus/pandanus trees.jpg'],
    culturalContext:
      'In many Solomon Islands communities, weaving knowledge is passed from mother to daughter. Specific patterns may belong to particular families or clans and carry stories of origin, place, and kinship. The fine diagonal weaving and pattern on shoulder bags originates from Rennell and Bellona Province (Renbel). Bags are often worn around the neck in Solomon Islands giving easy access to their contents.',
    culturalContextReviewFlag: 'unreviewed',
    materialCategory: 'pandanus',
  },
  {
    id: 'craft-2',
    slug: 'wood-carving',
    name: 'Wood Carving',
    description:
      'Hand-carved wooden bowls with pearl shell and/or wood inlay design are polished and sealed. These bowls can be used to serve food, store small items like jewellery and keys, and can be cleaned with a damp cloth. The oval-shaped bowls are carved from \'kerosene wood\' (Cordia subcordata) which is termite resistant. Some pieces are made from Pacific Rosewood (Thespesia populnea). Carvers also make small wooden stamps with Solomon Islands marine animals and flowers. Each piece is unique, shaped by the carver\'s skill and the natural grain of the wood.',
    processImageUrls: ['/images/wood/Rex doing shell inlay.jpg', '/images/wood/Rex with fish.jpg', '/images/wood/bowls round.jpg', '/images/uncategorised/Tomoko.jpg', '/images/uncategorised/Tomoko bow decorations.jpg'],
    culturalContext:
      'Carving traditions vary by island and province. In Western Province, nguzunguzu (ship prow figures) are carved as protective spirits for canoes. In Malaita, carvings may depict ancestral figures. Today, carvers from Western Province produce functional items like bowls and decorative pieces for the tourist and export market.',
    culturalContextReviewFlag: 'unreviewed',
    materialCategory: 'wood',
  },
  {
    id: 'craft-3',
    slug: 'shell-money-jewellery',
    name: 'Shell-Money Jewellery',
    description:
      'Shells have been used for ornamentation across the Pacific for many generations. In Solomon Islands, shells are fashioned by hand into very small discs, which are threaded on a string and used as a form of currency. Today, \'Tafuliae\' or shell money is also made into jewellery — necklaces, earrings, and bracelets. Different coloured shells have different values, and the red-orange shells are the most expensive because they need to be baked to achieve their colour. A single necklace can take weeks to produce as each tiny disc (about 3–5mm in diameter) must be ground, drilled, and threaded by hand.',
    processImageUrls: ['/images/shell/necklaces chief.jpg', '/images/shell/intricate necklace detail.jpg', '/images/shell/necklaces resized.jpg'],
    culturalContext:
      'Shell money holds deep cultural significance in Malaita and parts of Guadalcanal, particularly in the Langa Langa Lagoon area. It is used in bride price, compensation payments, and ceremonies. Its value is determined by colour, size uniformity, and length of strand. Aunty Karina has made kits for children so they can make their own shell-money jewellery, helping to pass the tradition to the next generation.',
    culturalContextReviewFlag: 'unreviewed',
    materialCategory: 'shells',
  },
  {
    id: 'craft-4',
    slug: 'bush-twine-weaving',
    name: 'Bush-Twine Weaving',
    description:
      '\'Bush-twine\' is made by combining the strands and fibres of two locally-grown vines (including the Asa vine) into a single cord that is very strong. It has traditionally been used to make shields, baskets and trays. The Kusa is a traditional woven string bag with a wide shoulder strap that is comfortable and strong with no joins. Made entirely from natural resources, it is an eco-friendly, strong bag that fits more than you think. Making bush-twine and then weaving or knotting it into functional items takes time and skill but the products will last for generations — this is reflected in their price.',
    processImageUrls: ['/images/bushtwine/Asa vine detail.jpg', '/images/bushtwine/Asa vine plant.jpg', '/images/bushtwine/tray small 26cm.jpg', '/images/bushtwine/tray small 40cm.jpg'],
    culturalContext:
      'Bush-twine crafts are found across multiple provinces in Solomon Islands, including Choiseul Province. The kusa (bag) is a traditional carrying bag similar to the bilum of Papua New Guinea or the dilly bag of northern Australia. It is sometimes carried across the forehead or around the neck.',
    culturalContextReviewFlag: 'unreviewed',
    materialCategory: 'bush-twine',
  },
];

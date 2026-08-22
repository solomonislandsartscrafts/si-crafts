/**
 * The manifest of every editable string of website copy.
 *
 * This file is the single source of truth for admin-editable text that isn't
 * already a modelled record (product, maker, craft, article, FAQ, team member,
 * stockist, supporter) or one of the SiteContent fields.
 *
 * Why a manifest instead of more database columns: the site has well over a
 * hundred editable strings. As columns, each one costs a migration, a
 * serializer line, a type line and a hand-written admin form field. Here it
 * costs one entry. The backend (apps/site_text) stores an opaque key/value
 * table; this file supplies the labels, grouping and default copy that turn
 * those rows into a usable admin screen.
 *
 * Three rules:
 *
 * 1. `defaultValue` is what the public site renders until an admin saves
 *    something else. It is not placeholder text — it is the real, live copy.
 *    Keep it accurate.
 * 2. Keys are permanent. Renaming one orphans whatever an admin has saved
 *    against it, silently reverting that text to the default.
 * 3. Only editorial content belongs here. Interface labels ("View all",
 *    "Add to Order"), accessibility strings, validation messages and error
 *    copy stay in code — an admin changing them would break the UI or the
 *    a11y contract, and they are not content.
 *
 * Copy that needs emphasis or a link uses a deliberately tiny subset of
 * Markdown, rendered by <CmsText>: `**bold**` and `[label](/path)`. Nothing
 * else is interpreted, and nothing is ever passed to dangerouslySetInnerHTML.
 */

export type SiteTextFieldType =
  /** Single line. Rendered as an <input>. */
  | 'text'
  /** Prose. Blank lines start a new paragraph. */
  | 'multiline'
  /** One list item per line. Blank lines are ignored. */
  | 'list';

export interface SiteTextField {
  /** Stable storage key. Never rename. */
  key: string;
  /** Label shown to the admin. */
  label: string;
  /** The copy the site renders until an admin overrides it. */
  defaultValue: string;
  /** Defaults to 'text'. */
  type?: SiteTextFieldType;
  /** Optional hint shown under the label. */
  help?: string;
}

export interface SiteTextSection {
  title: string;
  description?: string;
  fields: SiteTextField[];
}

export interface SiteTextGroup {
  /** Tab id. */
  id: string;
  /** Tab label. */
  label: string;
  sections: SiteTextSection[];
}

const MARKDOWN_HELP = 'Use **bold** for emphasis and [label](/page) for a link.';
const LIST_HELP = 'One item per line.';

export const SITE_TEXT_GROUPS: SiteTextGroup[] = [
  // ---------------------------------------------------------------- Homepage
  {
    id: 'homepage',
    label: 'Homepage',
    sections: [
      {
        title: 'Hero',
        description: 'The main heading, intro paragraph and primary button are in the Hero Section above.',
        fields: [
          {
            key: 'homepage.heroSecondaryCta',
            label: 'Secondary button text',
            defaultValue: 'Our Story',
          },
          {
            key: 'homepage.supportersLabel',
            label: 'Supporters band label',
            defaultValue: 'Supported by',
            help: 'Shown beside the supporter logos. The band hides itself when there are no supporters.',
          },
        ],
      },
      {
        title: 'Makers section',
        fields: [
          {
            key: 'homepage.makersHeading',
            label: 'Heading',
            defaultValue: 'Meet the makers',
          },
          {
            key: 'homepage.makersIntro',
            label: 'Intro line',
            defaultValue: 'The weavers, carvers, and jewellers behind every piece.',
          },
          {
            key: 'homepage.makersButton',
            label: 'Button text',
            defaultValue: 'Meet all makers',
          },
        ],
      },
      {
        title: 'Featured products section',
        fields: [
          {
            key: 'homepage.productsHeading',
            label: 'Heading',
            defaultValue: 'Featured Crafts',
          },
          {
            key: 'homepage.productsIntro',
            label: 'Intro line',
            defaultValue: 'Handmade pieces from across Solomon Islands.',
          },
          {
            key: 'homepage.productsButton',
            label: 'Button text (mobile only)',
            defaultValue: 'View all products',
          },
        ],
      },
      {
        title: 'Wholesale banner',
        fields: [
          {
            key: 'homepage.ctaHeading',
            label: 'Heading',
            defaultValue: 'Stock Solomon Islands Arts & Crafts in your shop',
          },
          {
            key: 'homepage.ctaDescription',
            label: 'Description',
            defaultValue:
              'We supply museum shops and galleries in Australia with authentic Solomon Islands handicrafts at wholesale prices.',
            type: 'multiline',
          },
          {
            key: 'homepage.ctaButton',
            label: 'Button text',
            defaultValue: 'Learn about wholesale',
          },
        ],
      },
      {
        title: 'News section',
        fields: [
          {
            key: 'homepage.newsHeading',
            label: 'Heading',
            defaultValue: 'Latest news',
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------------------- About
  {
    id: 'about',
    label: 'About',
    sections: [
      {
        title: 'Page title',
        description: 'Section headings and body text are in the sections above.',
        fields: [
          { key: 'about.title', label: 'Page title', defaultValue: 'About' },
        ],
      },
      {
        title: 'Photo credit',
        description: 'Shown under the image in the “Why we’re doing this” section. Update this whenever you change that image.',
        fields: [
          {
            key: 'about.photoCreditName',
            label: 'Photographer name',
            defaultValue: 'Harjono Djoyobisono',
            help: 'Leave blank to hide the credit entirely.',
          },
          {
            key: 'about.photoCreditUrl',
            label: 'Photographer link',
            defaultValue: 'https://www.djoyobisono.com.au/',
          },
        ],
      },
      {
        title: 'Closing banner',
        fields: [
          {
            key: 'about.ctaHeading',
            label: 'Heading',
            defaultValue: 'Meet the makers behind the work',
          },
          {
            key: 'about.ctaDescription',
            label: 'Description',
            defaultValue:
              'Every product we bring to Australia carries the maker’s name, village, and story.',
            type: 'multiline',
          },
          {
            key: 'about.ctaPrimaryButton',
            label: 'Primary button text',
            defaultValue: 'Meet the makers',
          },
          {
            key: 'about.ctaSecondaryButton',
            label: 'Secondary button text',
            defaultValue: 'Browse the catalogue',
          },
        ],
      },
      {
        title: 'Team page',
        description: 'The team members themselves are managed under Admin → Team.',
        fields: [
          { key: 'aboutTeam.title', label: 'Page title', defaultValue: 'Our Team' },
          {
            key: 'aboutTeam.intro',
            label: 'Page intro',
            defaultValue:
              'Solomon Islands Arts & Crafts is run entirely by volunteers who share a connection to Solomon Islands.',
            type: 'multiline',
          },
          {
            key: 'aboutTeam.emptyTitle',
            label: 'Empty state heading',
            defaultValue: 'Team information coming soon.',
          },
          {
            key: 'aboutTeam.emptyDescription',
            label: 'Empty state description',
            defaultValue: 'We’re documenting our volunteer team. Check back soon.',
            type: 'multiline',
          },
        ],
      },
      {
        title: 'Acknowledgement of Country',
        description:
          'Shown in full at the bottom of the About page and condensed in the footer of every page. Needs cultural review before any change goes live.',
        fields: [
          {
            key: 'acknowledgement.heading',
            label: 'Heading',
            defaultValue: 'Acknowledgement of Country',
          },
          {
            key: 'acknowledgement.text',
            label: 'Acknowledgement',
            defaultValue:
              'This website was developed on the lands of the Gadigal people of the Eora nation in the land we now call Australia, and the lands of the Kāi Tahu iwi of Ōtepoti Dunedin in Aotearoa (New Zealand).',
            type: 'multiline',
          },
          {
            key: 'acknowledgement.solomonText',
            label: 'Solomon Islands acknowledgement',
            defaultValue:
              'The crafts shown here belong to the peoples and communities of Solomon Islands. We acknowledge the makers, their families, and the knowledge carried in every piece.',
            type: 'multiline',
          },
          {
            key: 'acknowledgement.footerLinkLabel',
            label: 'Footer link text',
            defaultValue: 'Read our full acknowledgement',
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------------- Our Promise
  {
    id: 'our-promise',
    label: 'Our Promise',
    sections: [
      {
        title: 'Page header',
        fields: [
          { key: 'ourPromise.title', label: 'Page title', defaultValue: 'Our Promise' },
          {
            key: 'ourPromise.intro',
            label: 'Page intro',
            defaultValue:
              'Every relationship we build — with makers, stockists, and customers — is grounded in these commitments.',
            type: 'multiline',
          },
        ],
      },
      {
        title: 'The four commitments',
        description: 'Shown as a two-by-two grid of cards. Leave a heading blank to hide that card.',
        fields: [
          {
            key: 'ourPromise.card1Heading',
            label: 'Card 1 heading',
            defaultValue: 'Authenticity',
          },
          {
            key: 'ourPromise.card1Body',
            label: 'Card 1 text',
            defaultValue:
              'Every piece we sell is genuinely handmade by a known, named maker in Solomon Islands. We never sell mass-produced imitations. Every product tag links to the maker’s story so you can verify provenance with a scan.',
            type: 'multiline',
          },
          {
            key: 'ourPromise.card2Heading',
            label: 'Card 2 heading',
            defaultValue: 'Fair Payment',
          },
          {
            key: 'ourPromise.card2Body',
            label: 'Card 2 text',
            defaultValue:
              'Makers set their own prices. We pay upfront — not on consignment, not on commission. Our wholesale margin covers marketing, shipping, documentation, and distribution only. The team behind Solomon Islands Arts & Crafts donate their time and expertise.',
            type: 'multiline',
          },
          {
            key: 'ourPromise.card3Heading',
            label: 'Card 3 heading',
            defaultValue: 'Cultural Respect',
          },
          {
            key: 'ourPromise.card3Body',
            label: 'Card 3 text',
            defaultValue:
              'These crafts belong to Solomon Islands’ peoples and communities. We are a conduit, not an owner. We never publish a maker’s story or image without their signed consent, and we work with cultural partners to ensure descriptions are accurate and respectful.',
            type: 'multiline',
          },
          {
            key: 'ourPromise.card4Heading',
            label: 'Card 4 heading',
            defaultValue: 'Consent & Transparency',
          },
          {
            key: 'ourPromise.card4Body',
            label: 'Card 4 text',
            defaultValue:
              'Makers choose whether their name, photo, and story appear on this site. We only publish profiles with signed consent. If a maker asks to be removed, we remove them immediately — no questions, no delay.',
            type: 'multiline',
          },
        ],
      },
      {
        title: 'Where the money goes',
        fields: [
          {
            key: 'ourPromise.moneyHeading',
            label: 'Heading',
            defaultValue: 'Where the money goes',
          },
          {
            key: 'ourPromise.moneyIntro',
            label: 'Intro',
            defaultValue:
              'When a shop purchases a piece at wholesale, the breakdown works like this:',
            type: 'multiline',
          },
          {
            key: 'ourPromise.moneyList',
            label: 'Breakdown',
            defaultValue: [
              '**The maker receives the price they set** — paid upfront in Solomon Islands Dollars ($SBD) at the point of purchase in Solomon Islands, before the piece reaches Australia. Museum and gallery shops in Australia set their own prices to cover their costs.',
              '**SIAC’s margin covers operations** — international freight, import documentation, photography, provenance tagging, warehousing, and distribution to stockists.',
              '**No middlemen, no agents** — we buy directly from makers or maker cooperatives. There is no third-party supply chain taking a cut. The logistics and website team behind Solomon Islands Arts & Crafts donate their time and expertise. Only the makers are paid at the price they set.',
            ].join('\n'),
            type: 'list',
            help: `${LIST_HELP} ${MARKDOWN_HELP}`,
          },
          {
            key: 'ourPromise.moneyClosing',
            label: 'Closing paragraph',
            defaultValue:
              'We are a volunteer-run operation. No one at SIAC draws a salary from craft sales. Every dollar above operating costs goes toward sourcing more work from more makers.',
            type: 'multiline',
          },
        ],
      },
      {
        title: 'Answering the hard question',
        fields: [
          {
            key: 'ourPromise.questionHeading',
            label: 'Heading',
            defaultValue: '“Are you exploiting makers?”',
          },
          {
            key: 'ourPromise.questionIntro',
            label: 'Intro',
            defaultValue: 'We get asked this, and it’s a fair question. Here’s our answer:',
            type: 'multiline',
          },
          {
            key: 'ourPromise.questionList',
            label: 'Answers',
            defaultValue: [
              '**Makers set their own prices.** We do not negotiate down. If a maker says a bag costs $500 SBD, that’s what we pay.',
              '**Consent is non-negotiable.** No maker’s name, image, or story appears on this site without their written, signed consent. They can withdraw at any time.',
              '**We pay upfront.** Makers are paid when we collect the work — not when (or if) it sells in Australia.',
              '**Cultural IP stays with communities.** We do not claim ownership of designs, patterns, or techniques. We document provenance; we do not appropriate.',
              '**We are transparent.** This page exists so you can hold us to account. If something here isn’t right, tell us.',
            ].join('\n'),
            type: 'list',
            help: `${LIST_HELP} ${MARKDOWN_HELP}`,
          },
        ],
      },
      {
        title: 'Closing banner',
        fields: [
          {
            key: 'ourPromise.ctaHeading',
            label: 'Heading',
            defaultValue: 'Meet the makers',
          },
          {
            key: 'ourPromise.ctaDescription',
            label: 'Description',
            defaultValue:
              'Every piece we sell is genuinely handmade by a known, named maker in Solomon Islands.',
            type: 'multiline',
          },
          {
            key: 'ourPromise.ctaButton',
            label: 'Button text',
            defaultValue: 'View all makers',
          },
        ],
      },
    ],
  },

  // -------------------------------------------------------------- For Makers
  {
    id: 'for-makers',
    label: 'For Makers',
    sections: [
      {
        title: 'Page header',
        fields: [
          { key: 'forMakers.title', label: 'Page title', defaultValue: 'For Makers' },
          {
            key: 'forMakers.intro',
            label: 'Page intro',
            defaultValue:
              'If you make crafts in Solomon Islands and would like to sell your work through Solomon Islands Arts & Crafts (SIAC), this page explains how it works and how to get in touch.',
            type: 'multiline',
          },
        ],
      },
      {
        title: 'How we source crafts',
        fields: [
          {
            key: 'forMakers.sourcingHeading',
            label: 'Heading',
            defaultValue: 'How SIAC sources crafts',
          },
          {
            key: 'forMakers.sourcingBody',
            label: 'Text',
            defaultValue: [
              'We buy handmade crafts — pandanus weaving, wood carving, kusa and trays made from bush-twine, and shell-money jewellery — directly from makers in Solomon Islands. We sell them wholesale to museum and gallery shops in Australia.',
              'We know the sort of items that will appeal to customers in Australia. We look for items that are unique to Solomon Islands and part of its craft tradition, but will also sell in Australia.',
              'We visit communities, meet makers in person, and purchase work at the price the maker sets. We pay upfront — not on consignment. We want makers to receive a fair price but we also try to keep prices reasonable so that museum and gallery shops will buy them.',
            ].join('\n\n'),
            type: 'multiline',
            help: 'Leave a blank line between paragraphs.',
          },
        ],
      },
      {
        title: 'Why we can’t work with everyone',
        fields: [
          {
            key: 'forMakers.capacityHeading',
            label: 'Heading',
            defaultValue: 'Why not everyone at once',
          },
          {
            key: 'forMakers.capacityBody',
            label: 'Text',
            defaultValue: [
              'We are a small, volunteer-run operation. We can only work with a limited number of makers at a time because each relationship takes time — building trust, documenting provenance, arranging freight, and finding the right shops in Australia.',
              'If we cannot buy from you right now, it does not mean your work is not good enough. It means we have reached our current capacity. We keep every expression of interest on file and reach out when we can take on more makers. Please fill in the form below to express interest in joining Solomon Islands Arts & Crafts as a maker.',
            ].join('\n\n'),
            type: 'multiline',
            help: 'Leave a blank line between paragraphs.',
          },
        ],
      },
      {
        title: 'What we promise makers',
        fields: [
          {
            key: 'forMakers.promisesHeading',
            label: 'Heading',
            defaultValue: 'What we promise makers',
          },
          {
            key: 'forMakers.promisesList',
            label: 'Promises',
            defaultValue: [
              'You set your own price. We do not negotiate down.',
              'We pay you when we collect the work — upfront, not after it sells.',
              'Your name, photo, and story only appear on our website if you give written consent. You can withdraw consent at any time.',
              'Your designs and patterns remain yours. We document provenance; we do not own your work.',
            ].join('\n'),
            type: 'list',
            help: LIST_HELP,
          },
        ],
      },
      {
        title: 'Enquiry form',
        fields: [
          {
            key: 'forMakers.formHeading',
            label: 'Heading',
            defaultValue: 'Get in touch',
          },
          {
            key: 'forMakers.formIntro',
            label: 'Intro',
            defaultValue:
              'Fill in the form below and we will contact you if we are able to work together. All fields except “Message” are required.',
            type: 'multiline',
          },
          {
            key: 'forMakers.successHeading',
            label: 'Thank-you heading',
            defaultValue: 'Thank you',
          },
          {
            key: 'forMakers.successBody',
            label: 'Thank-you message',
            defaultValue:
              'We have received your expression of interest. If we are able to work together, we will reach out using the contact details you provided.',
            type: 'multiline',
          },
        ],
      },
    ],
  },

  // --------------------------------------------------------------- Wholesale
  {
    id: 'wholesale',
    label: 'Wholesale',
    sections: [
      {
        title: 'Page title',
        description: 'The intro paragraph is in Page Content above.',
        fields: [
          { key: 'wholesale.title', label: 'Page title', defaultValue: 'Wholesale' },
        ],
      },
      {
        title: 'How it works',
        description: 'Four numbered steps. Leave a step title blank to hide that step.',
        fields: [
          {
            key: 'wholesale.stepsHeading',
            label: 'Section heading',
            defaultValue: 'How it works',
          },
          { key: 'wholesale.step1Heading', label: 'Step 1 title', defaultValue: 'Apply' },
          {
            key: 'wholesale.step1Body',
            label: 'Step 1 text',
            defaultValue:
              'Submit a short application with your business details and ABN. We review within a few business days.',
            type: 'multiline',
          },
          {
            key: 'wholesale.step2Heading',
            label: 'Step 2 title',
            defaultValue: 'Browse & order',
          },
          {
            key: 'wholesale.step2Body',
            label: 'Step 2 text',
            defaultValue:
              'Once approved, log in to see wholesale pricing and build an order by material, type, or maker.',
            type: 'multiline',
          },
          {
            key: 'wholesale.step3Heading',
            label: 'Step 3 title',
            defaultValue: 'Pay by transfer',
          },
          {
            key: 'wholesale.step3Body',
            label: 'Step 3 text',
            defaultValue:
              'We confirm availability and send an invoice. You pay by bank transfer — no card payments at this stage.',
            type: 'multiline',
          },
          { key: 'wholesale.step4Heading', label: 'Step 4 title', defaultValue: 'Receive' },
          {
            key: 'wholesale.step4Body',
            label: 'Step 4 text',
            defaultValue:
              'We ship from Sydney. Each piece arrives with a QR-coded tag linking to its maker’s story. We will pay the shipping costs for your first order.',
            type: 'multiline',
          },
        ],
      },
      {
        title: 'Terms notice',
        description: 'The highlighted panel below the steps. Commercial terms — keep it accurate.',
        fields: [
          {
            key: 'wholesale.note',
            label: 'Notice',
            defaultValue:
              '**Please note:** Orders are expressions of interest, not confirmed purchases. Stock is limited and handmade — we’ll confirm what’s available after you submit. We send an invoice once confirmed and ship after payment (within 30 days). We absorb freight costs at this stage.',
            type: 'multiline',
            help: MARKDOWN_HELP,
          },
        ],
      },
      {
        title: 'Common questions',
        description: 'A short list here. The full list lives under Admin → FAQs.',
        fields: [
          {
            key: 'wholesale.faqHeading',
            label: 'Section heading',
            defaultValue: 'Common questions',
          },
          {
            key: 'wholesale.faq1Question',
            label: 'Question 1',
            defaultValue: 'Can I return unsold goods?',
          },
          {
            key: 'wholesale.faq1Answer',
            label: 'Answer 1',
            defaultValue: 'No — orders are purchased outright at wholesale prices.',
            type: 'multiline',
            help: MARKDOWN_HELP,
          },
          {
            key: 'wholesale.faq2Question',
            label: 'Question 2',
            defaultValue: 'Can I order custom or bulk items?',
          },
          {
            key: 'wholesale.faq2Answer',
            label: 'Answer 2',
            defaultValue:
              'Yes — log in to your stockist account and submit a request under “Requests”. Not a retail business? [Contact us](/contact) about individual bulk orders.',
            type: 'multiline',
            help: MARKDOWN_HELP,
          },
          {
            key: 'wholesale.faq3Question',
            label: 'Question 3',
            defaultValue: 'Is there a minimum order?',
          },
          {
            key: 'wholesale.faq3Answer',
            label: 'Answer 3',
            defaultValue:
              'No minimum, but we encourage orders of at least 6 pieces for shipping efficiency.',
            type: 'multiline',
            help: MARKDOWN_HELP,
          },
          {
            key: 'wholesale.moreFaqsLabel',
            label: 'Link to the full FAQ page',
            defaultValue: 'More FAQs (returns, GST, shipping) →',
          },
        ],
      },
      {
        title: 'Closing banner',
        fields: [
          {
            key: 'wholesale.ctaHeading',
            label: 'Heading',
            defaultValue: 'Ready to stock SI Crafts?',
          },
          {
            key: 'wholesale.ctaDescription',
            label: 'Description',
            defaultValue: 'Apply for a wholesale account, or log in if you already have one.',
            type: 'multiline',
          },
          {
            key: 'wholesale.ctaPrimaryButton',
            label: 'Primary button text',
            defaultValue: 'Apply to become a stockist',
          },
          {
            key: 'wholesale.ctaSecondaryButton',
            label: 'Secondary button text',
            defaultValue: 'Log in as stockist',
          },
        ],
      },
    ],
  },

  // ----------------------------------------------------------------- Contact
  {
    id: 'contact',
    label: 'Contact',
    sections: [
      {
        title: 'Page title',
        description: 'The intro, email address and response time are in Contact Page above.',
        fields: [
          { key: 'contact.title', label: 'Page title', defaultValue: 'Contact' },
          {
            key: 'contact.emailHeading',
            label: 'Email section heading',
            defaultValue: 'Email us',
          },
          {
            key: 'contact.abn',
            label: 'ABN line',
            defaultValue: 'ABN 82 103 383 042',
            help: 'Leave blank to hide it.',
          },
        ],
      },
      {
        title: 'Side panels',
        description: 'Leave a heading blank to hide that panel.',
        fields: [
          {
            key: 'contact.block1Heading',
            label: 'Panel 1 heading',
            defaultValue: 'Wholesale enquiries',
          },
          {
            key: 'contact.block1Body',
            label: 'Panel 1 text',
            defaultValue:
              'Interested in stocking Solomon Islands Arts & Crafts in your museum or gallery shop? [Visit our Wholesale page →](/wholesale)',
            type: 'multiline',
            help: MARKDOWN_HELP,
          },
          {
            key: 'contact.block2Heading',
            label: 'Panel 2 heading',
            defaultValue: 'Media & press',
          },
          {
            key: 'contact.block2Body',
            label: 'Panel 2 text',
            defaultValue:
              'For interview requests, features, or press enquiries, select “Media & press” in the form and we’ll prioritise your message.',
            type: 'multiline',
            help: MARKDOWN_HELP,
          },
          {
            key: 'contact.block3Heading',
            label: 'Panel 3 heading',
            defaultValue: 'Customised or bulk orders',
          },
          {
            key: 'contact.block3Body',
            label: 'Panel 3 text',
            defaultValue:
              'For personalised or bulk orders, select “Custom or bulk order” in the form and we’ll get in touch.',
            type: 'multiline',
            help: MARKDOWN_HELP,
          },
        ],
      },
      {
        title: 'After sending',
        fields: [
          {
            key: 'contact.successHeading',
            label: 'Confirmation heading',
            defaultValue: 'Message sent',
          },
          {
            key: 'contact.successBody',
            label: 'Confirmation message',
            defaultValue: 'Thanks for getting in touch. We’ll get back to you as soon as we can.',
            type: 'multiline',
          },
        ],
      },
    ],
  },

  // --------------------------------------------------------------- Stockists
  {
    id: 'stockists',
    label: 'Stockists',
    sections: [
      {
        title: 'Page header',
        description: 'The shops themselves are managed under Admin → Retail Stockists.',
        fields: [
          { key: 'stockists.title', label: 'Page title', defaultValue: 'Stockists' },
          {
            key: 'stockists.intro',
            label: 'Page intro',
            defaultValue:
              'Find Solomon Islands Arts & Crafts in these museum and gallery shops. Visit in person or contact them to ask about availability.',
            type: 'multiline',
          },
          {
            key: 'stockists.emptyTitle',
            label: 'Empty state heading',
            defaultValue: 'Stockists coming soon.',
          },
          {
            key: 'stockists.emptyDescription',
            label: 'Empty state description',
            defaultValue:
              'We’re confirming the shops that carry our pieces. Get in touch if you’d like to stock them.',
            type: 'multiline',
          },
        ],
      },
      {
        title: 'Closing banner',
        fields: [
          {
            key: 'stockists.ctaHeading',
            label: 'Heading',
            defaultValue:
              'Are you a museum or gallery shop interested in stocking SI Crafts?',
          },
          {
            key: 'stockists.ctaButton',
            label: 'Button text',
            defaultValue: 'Learn about wholesale',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- Listings
  {
    id: 'listings',
    label: 'Listing pages',
    sections: [
      {
        title: 'Catalogue',
        fields: [
          { key: 'catalogue.title', label: 'Page title', defaultValue: 'Catalogue' },
          {
            key: 'catalogue.intro',
            label: 'Page intro',
            defaultValue:
              'Browse our full collection of Solomon Islands handicrafts. All items are made from renewable, natural resources that are locally-sourced and sustainable.',
            type: 'multiline',
          },
          {
            key: 'catalogue.pricingPrompt',
            label: 'Wholesale pricing prompt',
            defaultValue: '[Log in as a stockist](/login) to view wholesale pricing.',
            type: 'multiline',
            help: MARKDOWN_HELP,
          },
          {
            key: 'catalogue.emptyTitle',
            label: 'No results heading',
            defaultValue: 'No pieces match your current filters.',
          },
          {
            key: 'catalogue.emptyDescription',
            label: 'No results description',
            defaultValue: 'Try a different material, maker, or search term.',
            type: 'multiline',
          },
        ],
      },
      {
        title: 'Makers',
        fields: [
          { key: 'makers.title', label: 'Page title', defaultValue: 'Meet the Makers' },
          {
            key: 'makers.intro',
            label: 'Page intro',
            defaultValue:
              'Every piece carries a story. These are the weavers, carvers, and jewellers behind the work — their villages, their craft, and their hands.',
            type: 'multiline',
          },
          {
            key: 'makers.filterHeading',
            label: 'Map sidebar heading',
            defaultValue: 'Filter by province',
          },
          {
            key: 'makers.filterHint',
            label: 'Map sidebar hint',
            defaultValue: 'Select a province on the map to filter the list.',
            type: 'multiline',
          },
          {
            key: 'makers.emptyTitle',
            label: 'Empty state heading',
            defaultValue: 'No makers in this province yet.',
          },
          {
            key: 'makers.emptyDescription',
            label: 'Empty state description',
            defaultValue:
              'We’re still documenting makers across Solomon Islands. Try another province.',
            type: 'multiline',
          },
        ],
      },
      {
        title: 'Crafts & Techniques',
        fields: [
          {
            key: 'crafts.title',
            label: 'Page title',
            defaultValue: 'Crafts & Techniques',
          },
          {
            key: 'crafts.intro',
            label: 'Page intro',
            defaultValue:
              'Living craft traditions from Solomon Islands — each with its own materials, tools, and stories.',
            type: 'multiline',
          },
          {
            key: 'crafts.emptyTitle',
            label: 'Empty state heading',
            defaultValue: 'Crafts coming soon.',
          },
          {
            key: 'crafts.emptyDescription',
            label: 'Empty state description',
            defaultValue:
              'We’re documenting each craft tradition with its makers. Check back soon.',
            type: 'multiline',
          },
          {
            key: 'crafts.ctaHeading',
            label: 'Closing banner heading',
            defaultValue: 'Every technique has a maker',
          },
          {
            key: 'crafts.ctaDescription',
            label: 'Closing banner description',
            defaultValue:
              'Read the stories of the weavers, carvers, and jewellers who keep these traditions alive.',
            type: 'multiline',
          },
        ],
      },
      {
        title: 'News',
        description: 'Articles are managed under Admin → News.',
        fields: [
          { key: 'news.title', label: 'Page title', defaultValue: 'News' },
          {
            key: 'news.intro',
            label: 'Page intro',
            defaultValue:
              'Stories and updates from Solomon Islands Arts & Crafts — makers, crafts, and the people we work with.',
            type: 'multiline',
          },
          {
            key: 'news.emptyTitle',
            label: 'Empty state heading',
            defaultValue: 'No articles published yet.',
          },
          {
            key: 'news.emptyDescription',
            label: 'Empty state description',
            defaultValue:
              'Check back soon for stories and updates from Solomon Islands Arts & Crafts.',
            type: 'multiline',
          },
        ],
      },
    ],
  },

  // -------------------------------------------------------------- Care Guide
  {
    id: 'care-guide',
    label: 'Care Guide',
    sections: [
      {
        title: 'Page title and section headings',
        description:
          'The intro and the pandanus, wood and shell care tips are in Care Guide above.',
        fields: [
          { key: 'careGuide.title', label: 'Page title', defaultValue: 'Care Guide' },
          {
            key: 'careGuide.pandanusHeading',
            label: 'Pandanus section heading',
            defaultValue: 'Pandanus (Bags, Purses, Fans, Trays)',
          },
          {
            key: 'careGuide.woodHeading',
            label: 'Wood section heading',
            defaultValue: 'Wood (Bowls, Trays, Carvings)',
          },
          {
            key: 'careGuide.shellHeading',
            label: 'Shell section heading',
            defaultValue: 'Shell (Jewellery, Shell-Money Pieces)',
          },
        ],
      },
      {
        title: 'Bush twine',
        fields: [
          {
            key: 'careGuide.bushTwineHeading',
            label: 'Section heading',
            defaultValue: 'Bush Twine (Kusa, Trays)',
          },
          {
            key: 'careGuide.bushTwineTips',
            label: 'Care tips',
            defaultValue: [
              'Keep dry or wipe away moisture as soon as possible.',
              'Dust trays with a damp cloth or keep covered when not in use.',
              'It is safe to put hot or cold items on the trays — they will not warp.',
            ].join('\n'),
            type: 'list',
            help: LIST_HELP,
          },
        ],
      },
      {
        title: 'Closing banner',
        fields: [
          {
            key: 'careGuide.ctaHeading',
            label: 'Heading',
            defaultValue: 'Browse the catalogue',
          },
          {
            key: 'careGuide.ctaDescription',
            label: 'Description',
            defaultValue:
              'See the pandanus, wood, shell, and bush-twine pieces these care tips apply to.',
            type: 'multiline',
          },
          {
            key: 'careGuide.ctaButton',
            label: 'Button text',
            defaultValue: 'View the catalogue',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- FAQ page
  {
    id: 'faqs',
    label: 'FAQ page',
    sections: [
      {
        title: 'Page header',
        description: 'The questions and answers themselves are managed under Admin → FAQs.',
        fields: [
          {
            key: 'faqs.title',
            label: 'Page title',
            defaultValue: 'FAQs & Shipping',
          },
          {
            key: 'faqs.intro',
            label: 'Page intro',
            defaultValue:
              'Ordering, delivery, returns, and the questions stockists ask us most often.',
            type: 'multiline',
          },
          {
            key: 'faqs.emptyTitle',
            label: 'Empty state heading',
            defaultValue: 'Questions coming soon.',
          },
          {
            key: 'faqs.footerNote',
            label: 'Closing note',
            defaultValue: 'Have a question we haven’t answered? [Get in touch](/contact) and we’ll help.',
            type: 'multiline',
            help: MARKDOWN_HELP,
          },
        ],
      },
      {
        title: 'Closing banner',
        fields: [
          {
            key: 'faqs.ctaHeading',
            label: 'Heading',
            defaultValue: 'Become a stockist',
          },
          {
            key: 'faqs.ctaDescription',
            label: 'Description',
            defaultValue:
              'Submit an application through our Wholesale page with your business details and ABN. We review applications within a few business days.',
            type: 'multiline',
          },
          {
            key: 'faqs.ctaPrimaryButton',
            label: 'Primary button text',
            defaultValue: 'Learn about wholesale',
          },
          {
            key: 'faqs.ctaSecondaryButton',
            label: 'Secondary button text',
            defaultValue: 'Contact us',
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------------ Detail pages
  {
    id: 'detail-pages',
    label: 'Craft & maker pages',
    sections: [
      {
        title: 'Craft page',
        description: 'Each craft’s own name, description and images are managed under Admin → Crafts.',
        fields: [
          {
            key: 'craftDetail.culturalHeading',
            label: 'Cultural context heading',
            defaultValue: 'Cultural Context',
          },
          {
            key: 'craftDetail.culturalPendingNotice',
            label: 'Awaiting-review notice',
            defaultValue:
              'Cultural context pending review by a Solomon Islands cultural partner.',
            type: 'multiline',
            help: 'Shown instead of the cultural context until a craft is marked reviewed.',
          },
          {
            key: 'craftDetail.makersHeading',
            label: 'Makers section heading',
            defaultValue: 'Makers',
          },
          {
            key: 'craftDetail.makersEmptyTitle',
            label: 'No makers heading',
            defaultValue: 'No makers listed for this craft yet.',
          },
          {
            key: 'craftDetail.makersEmptyDescription',
            label: 'No makers description',
            defaultValue:
              'We’re still documenting makers across Solomon Islands. Meet the makers we have published so far.',
            type: 'multiline',
          },
          {
            key: 'craftDetail.piecesHeading',
            label: 'Pieces section heading',
            defaultValue: 'Pieces',
          },
          {
            key: 'craftDetail.piecesEmptyTitle',
            label: 'No pieces heading',
            defaultValue: 'No pieces available in this category right now.',
          },
          {
            key: 'craftDetail.piecesEmptyDescription',
            label: 'No pieces description',
            defaultValue:
              'Stock is handmade and limited. Browse the full catalogue to see what else is available.',
            type: 'multiline',
          },
        ],
      },
      {
        title: 'Maker page',
        description:
          'Each maker’s name, village, story and portrait are managed under Admin → Makers. Only makers with signed consent and “published to web” appear at all.',
        fields: [
          {
            key: 'makerDetail.storyPendingNotice',
            label: 'Awaiting-review notice',
            defaultValue: 'Story pending cultural review.',
            type: 'multiline',
            help: 'Shown when a maker has no story recorded yet.',
          },
          {
            key: 'makerDetail.piecesEmptyDescription',
            label: 'No pieces description',
            defaultValue:
              'Stock is handmade and limited. Browse the full catalogue to see what else is available.',
            type: 'multiline',
          },
          {
            key: 'makerDetail.ctaPrompt',
            label: 'Wholesale prompt',
            defaultValue: 'Interested in stocking {name}’s pieces?',
            type: 'multiline',
            help: 'Placeholder: {name} is replaced with the maker’s name.',
          },
          {
            key: 'makerDetail.ctaButton',
            label: 'Wholesale button text',
            defaultValue: 'Wholesale Enquiry',
          },
        ],
      },
    ],
  },

  // -------------------------------------------------------------- Provenance
  {
    id: 'provenance',
    label: 'Provenance pages',
    sections: [
      {
        title: 'How it’s made',
        description:
          'Shown on the “How it’s made” tab of a piece, chosen by the piece’s material. Traditional knowledge — have changes reviewed by a Solomon Islands cultural partner before saving.',
        fields: [
          {
            key: 'provenance.processPandanus',
            label: 'Pandanus',
            defaultValue:
              'The leaves of the pandanus tree are soaked in water with coconut husks for about a week to make them soft and pliable, then hung up to dry in the sun for several weeks and cut into strips using a special tool. The handles are made from the bark of the Wa‘ai tree. Black pandanus is made by boiling with leaves of the Talisay (Indian almond) tree for 2–3 hours before drying. The fine diagonal weaving takes days or weeks to complete.',
            type: 'multiline',
          },
          {
            key: 'provenance.processWood',
            label: 'Wood',
            defaultValue:
              'Each piece is hand-carved from a single block of ‘kerosene wood’ (Cordia subcordata) or Pacific Rosewood (Thespesia populnea). The carver shapes the wood with hand tools, then inlays pearl shell and/or contrasting wood into the design. The finished piece is polished and sealed with lacquer.',
            type: 'multiline',
          },
          {
            key: 'provenance.processShells',
            label: 'Shell',
            defaultValue:
              'Shells are collected and fashioned by hand into very small discs about 3–5mm in diameter. A hole is drilled in the centre and the discs are threaded on nylon (traditionally bush twine) to form strands. Different coloured shells have different values — red-orange shells are the most expensive because they need to be baked to achieve their colour. A single necklace can take weeks to produce.',
            type: 'multiline',
          },
          {
            key: 'provenance.processBushTwine',
            label: 'Bush twine',
            defaultValue:
              '‘Bush-twine’ is made by combining the strands and fibres of two locally-grown vines (including the Asa vine) into a single cord that is very strong. It has traditionally been used to make shields, baskets and trays. The Kusa bag is knotted from bush twine with a wide shoulder strap that has no joins — made entirely from natural resources, it is eco-friendly and very durable.',
            type: 'multiline',
          },
          {
            key: 'provenance.processFallback',
            label: 'Any other material',
            defaultValue:
              'This piece is made using traditional techniques passed down through generations.',
            type: 'multiline',
            help: 'Used when a piece’s material has no description above.',
          },
        ],
      },
      {
        title: 'Authenticity tab',
        fields: [
          {
            key: 'provenance.authenticityBody',
            label: 'Text',
            defaultValue: [
              'Every piece comes with a product tag stating the maker’s name and province in Solomon Islands, linking to this provenance page — your guarantee it was handmade by the named maker.',
              'For more information see [Our Promise](/our-promise).',
            ].join('\n\n'),
            type: 'multiline',
            help: MARKDOWN_HELP,
          },
        ],
      },
      {
        title: 'Where to buy tab',
        fields: [
          {
            key: 'provenance.whereToBuyIntro',
            label: 'Intro',
            defaultValue:
              'We supply museum and gallery shops in Australia. Visit a stockist to buy a piece in person, or enquire about wholesale for your own shop.',
            type: 'multiline',
          },
          {
            key: 'provenance.whereToBuyShopPrompt',
            label: 'Shop prompt',
            defaultValue:
              'Run a museum or gallery shop? [Apply for a stockist account](/stockist/apply) to see wholesale pricing and place orders.',
            type: 'multiline',
            help: MARKDOWN_HELP,
          },
          {
            key: 'provenance.whereToBuyQuote',
            label: 'Highlighted quote',
            defaultValue:
              'When you buy this piece through a stockist, the maker receives the price they set — paid upfront, before the piece reaches Australia. No middlemen, no commission. [Learn about our values →](/our-promise)',
            type: 'multiline',
            help: MARKDOWN_HELP,
          },
        ],
      },
      {
        title: 'Piece page',
        fields: [
          {
            key: 'provenance.tradeOnlyNotice',
            label: 'Trade-only notice',
            defaultValue:
              'This piece is available to approved wholesale stockists. [Apply for an account](/stockist/apply) or [find a retail stockist](/stockists).',
            type: 'multiline',
            help: MARKDOWN_HELP,
          },
          {
            key: 'provenance.makerStoryFallback',
            label: 'Fallback when a maker has no story',
            defaultValue:
              'This piece was made by hand by {name} from {village}, {province}, using skills passed down through generations.',
            type: 'multiline',
            help: 'Placeholders: {name}, {village}, {province}. Leave blank to show nothing rather than write on a maker’s behalf.',
          },
          {
            key: 'provenance.relatedHeading',
            label: 'Related pieces heading',
            defaultValue: 'You might also like',
          },
          {
            key: 'provenance.notFoundTitle',
            label: 'Unknown code heading',
            defaultValue: 'Piece not found',
          },
          {
            key: 'provenance.lookupTitle',
            label: 'Code lookup page title',
            defaultValue: 'Find your piece',
          },
          {
            key: 'provenance.lookupIntro',
            label: 'Code lookup intro',
            defaultValue:
              'Enter the code from your product tag to meet the maker and discover the story behind your piece.',
            type: 'multiline',
          },
          {
            key: 'provenance.lookupHint',
            label: 'Code lookup hint',
            defaultValue: 'The code is printed on the tag attached to your product (e.g. P-J-1).',
            type: 'multiline',
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------------------ Footer
  {
    id: 'footer',
    label: 'Footer',
    sections: [
      {
        title: 'Quick links',
        description: 'The three cards at the top of the footer.',
        fields: [
          {
            key: 'footer.promiseDescription',
            label: 'Our Promise description',
            defaultValue: 'Fair pay, consent, cultural respect — how we work with makers.',
            type: 'multiline',
          },
          {
            key: 'footer.careDescription',
            label: 'Care Guide description',
            defaultValue: 'How to look after each piece so it lasts a lifetime.',
            type: 'multiline',
          },
          {
            key: 'footer.faqsDescription',
            label: 'FAQs & Shipping description',
            defaultValue: 'Ordering, delivery, returns, and common questions.',
            type: 'multiline',
          },
        ],
      },
      {
        title: 'Bottom bar',
        fields: [
          {
            key: 'footer.sovereigntyNote',
            label: 'Sovereignty note',
            defaultValue:
              'Crafts belong to Solomon Islands peoples and communities. SIAC is a conduit, not an owner.',
            type: 'multiline',
          },
        ],
      },
    ],
  },
];

/** Every field in the manifest, flattened. */
export const SITE_TEXT_FIELDS: SiteTextField[] = SITE_TEXT_GROUPS.flatMap((group) =>
  group.sections.flatMap((section) => section.fields)
);

/** Default copy for every key, used whenever the stored value is missing or blank. */
export const SITE_TEXT_DEFAULTS: Record<string, string> = Object.fromEntries(
  SITE_TEXT_FIELDS.map((field) => [field.key, field.defaultValue])
);

import Link from 'next/link';
import {
  ImageIcon,
  ShieldCheck,
  Landmark,
  Lock,
  Hash,
  EyeOff,
  Check,
  X,
  ArrowRight,
} from 'lucide-react';

/** Section list for the in-page navigation. Ids match the sections below. */
export const GUIDE_SECTIONS = [
  { id: 'setup', label: 'Setup checklist' },
  { id: 'essentials', label: 'Six rules' },
  { id: 'tasks', label: 'How to do things' },
  { id: 'images', label: 'Photos' },
  { id: 'words', label: 'Writing tips' },
  { id: 'publish', label: 'Before you publish' },
];

/** Reusable card wrapper so every section looks the same. */
function Section({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="bg-card-bg rounded-lg shadow-card p-md sm:p-md scroll-mt-6">
      <h2 className="font-heading text-xl md:text-2xl font-medium text-deep-blue">{title}</h2>
      {intro && <p className="text-base text-warm-gray-600 mt-2xs leading-body">{intro}</p>}
      <div className="mt-md">{children}</div>
    </section>
  );
}

const ESSENTIALS = [
  {
    icon: ImageIcon,
    title: 'Every image needs alt text',
    body: 'Alt text is a short description of the photo. Screen readers read it aloud, and it shows if the image fails to load. The form won\u2019t let you save without it. Just describe what\u2019s in the photo in one sentence.',
  },
  {
    icon: ShieldCheck,
    title: 'Consent first, then publish',
    body: 'A maker\u2019s profile can only go live once their consent is marked as \u201cSigned\u201d. Never tick \u201cPublished to web\u201d before that. If consent is withdrawn later, untick it immediately.',
  },
  {
    icon: Landmark,
    title: 'Don\u2019t guess cultural meaning',
    body: 'If something has cultural or ceremonial significance, it must be reviewed by a Solomon Islands cultural partner before going live. If you don\u2019t know the meaning, leave it blank. Never make it up.',
  },
  {
    icon: Lock,
    title: 'No prices on the public site',
    body: 'Wholesale prices are only visible to logged-in stockists. Never put a price in a description, article, alt text, or photo.',
  },
  {
    icon: Hash,
    title: 'Product codes: material-maker-number',
    body: 'Example: P-J-1 means a pandanus piece by Julie, item 1. Codes must be unique because they\u2019re printed on tags and form the provenance link (/piece/P-J-1).',
  },
  {
    icon: EyeOff,
    title: 'Hide, don\u2019t delete',
    body: 'Untick \u201cPublished\u201d to remove something from the public site. The record stays in the system. Only delete if the record was created by mistake and no QR tag has been printed.',
  },
];

const TASKS = [
  {
    title: 'Add a product',
    steps: [
      'Go to Products \u2192 click "Add product".',
      'Pick the maker and craft from the dropdowns.',
      'Pick the material category and product type.',
      'Enter the product code (e.g. P-J-1).',
      'Upload photos. Write alt text for each one.',
      'Fill in dimensions, care notes, and wholesale price (AUD).',
      'Click Save.',
      'When everything looks right, tick "Published".',
    ],
  },
  {
    title: 'Add a maker',
    steps: [
      'Go to Makers \u2192 click "Add maker".',
      'Enter their real name, village, and province.',
      'Upload a portrait photo. Write alt text.',
      'Write their story in their own words (first person).',
      'Set consent status. Only tick "Published to web" once consent is "Signed".',
    ],
  },
  {
    title: 'Edit something that\u2019s already live',
    steps: [
      'Find the record and open it.',
      'Make your changes and click Save.',
      'Changes go live immediately if the item is published.',
      'Open the public page on your phone to check it looks right.',
    ],
  },
  {
    title: 'Remove something from the public site',
    steps: [
      'Open the record.',
      'Untick "Published". Click Save.',
      'It disappears from the public site straight away.',
      'Only use Delete if the record was a mistake and no tag was printed.',
    ],
  },
  {
    title: 'Approve a stockist',
    steps: [
      'Go to Stockists \u2192 open the pending application.',
      'Check the business name and ABN look correct.',
      'Click Approve. They can now log in and see wholesale pricing.',
      'If a shop stops trading with us, use Suspend (not Delete).',
    ],
  },
  {
    title: 'Handle an order request',
    steps: [
      'Go to Orders \u2192 open the request.',
      'Orders are expressions of interest, not payments.',
      'Check availability with the maker, then set status to "Confirmed".',
      'Email the stockist bank transfer details.',
      'Note: orders over A$1,000 may need a GST line.',
      'Once shipped, set status to "Shipped".',
    ],
  },
  {
    title: 'Reply to an enquiry',
    steps: [
      'Go to Inbox \u2192 open the message.',
      'Reply from your own email.',
      'Come back and mark it as "Handled" so others know it\u2019s done.',
    ],
  },
  {
    title: 'Write a news article',
    steps: [
      'Go to News \u2192 click "Add article".',
      'Write a title and a short excerpt (1\u20132 sentences for the card).',
      'Add a cover image with alt text.',
      'Write the article body.',
      'Click Save. Read it back.',
      'When happy, tick "Published".',
      'Tick "Featured" to pin it to the top of the News page.',
    ],
  },
];

const ALT_EXAMPLES = [
  {
    good: 'Julie Kere weaving a pandanus basket on her verandah in Sasamunga, Choiseul',
    bad: 'Image of a woman weaving',
  },
  {
    good: 'Shell-money necklace with rows of red spondylus discs and a carved clam pendant',
    bad: 'Necklace product photo P-J-1',
  },
  {
    good: 'Carved kakamora figure in kerosene wood, showing the pattern cut into the back',
    bad: 'Tribal carving',
  },
];

export function AdminGuide() {
  return (
    <>
      <Section
        id="essentials"
        title="Six rules to know"
        intro="These apply to everything you do in this admin. Read them once, and they’ll make sense every time."
      >
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-sm">
          {ESSENTIALS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="rounded-lg border border-sand p-sm">
              <div className="flex items-center gap-2xs mb-2xs">
                <Icon className="w-5 h-5 text-ocean flex-shrink-0" aria-hidden="true" />
                <h3 className="font-heading text-base font-semibold text-deep-blue">{title}</h3>
              </div>
              <p className="text-base text-warm-gray-600 leading-body">{body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="tasks"
        title="How to do things"
        intro="Step-by-step for the most common jobs. Follow each step in order."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {TASKS.map(({ title, steps }) => (
            <div key={title} className="rounded-lg bg-sand-light p-sm">
              <h3 className="font-heading text-base font-semibold text-deep-blue mb-xs">{title}</h3>
              <ol className="space-y-2xs">
                {steps.map((step, index) => (
                  <li key={step} className="flex gap-2xs text-base text-warm-gray-800 leading-body">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-ocean/10 text-ocean text-xs font-bold flex items-center justify-center mt-3xs">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="images"
        title="Photos"
        intro="Good photos sell the crafts. Here’s what to aim for."
      >
        <div className="space-y-md">
          <div>
            <h3 className="font-heading text-base font-semibold text-deep-blue mb-2xs">Choosing photos</h3>
            <ul className="space-y-2xs text-base text-warm-gray-800 leading-body list-disc pl-md">
              <li>Square photos for products. Upright/portrait photos for makers.</li>
              <li>Natural daylight. Plain background. The whole piece in frame.</li>
              <li>Include one close-up showing the weave, grain, or shell work.</li>
              <li>Keep files under 2 MB so pages load fast on mobile.</li>
              <li>Only use photos of people who agreed to appear on the site.</li>
              <li>No price tags. No staged or exoticising set-ups.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-base font-semibold text-deep-blue mb-2xs">Writing alt text</h3>
            <p className="text-base text-warm-gray-800 leading-body mb-xs">
              One sentence, about 125 characters. Say who is in the photo, where they are, and what
              they&rsquo;re doing. Don&rsquo;t start with &ldquo;image of&rdquo; or &ldquo;photo of&rdquo; &mdash; screen
              readers already say that.
            </p>
            <ul className="space-y-xs">
              {ALT_EXAMPLES.map(({ good, bad }) => (
                <li key={good} className="grid grid-cols-1 sm:grid-cols-2 gap-xs">
                  <div className="flex gap-2xs rounded-md bg-success/5 p-xs">
                    <Check className="w-4 h-4 mt-3xs flex-shrink-0 text-success" aria-hidden="true" />
                    <span className="text-base text-warm-gray-800 leading-body">
                      <span className="sr-only">Good example: </span>
                      {good}
                    </span>
                  </div>
                  <div className="flex gap-2xs rounded-md bg-error/5 p-xs">
                    <X className="w-4 h-4 mt-3xs flex-shrink-0 text-error" aria-hidden="true" />
                    <span className="text-base text-warm-gray-600 leading-body">
                      <span className="sr-only">Weak example: </span>
                      {bad}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section
        id="words"
        title="Writing tips"
        intro="The crafts belong to Solomon Islands communities. Our words should reflect that."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div>
            <h3 className="font-heading text-base font-semibold text-deep-blue mb-2xs">Do this</h3>
            <ul className="space-y-2xs text-base text-warm-gray-800 leading-body list-disc pl-md">
              <li>Name the maker, their village, and their province every time.</li>
              <li>Write maker stories in first person (their words, not yours).</li>
              <li>Write &ldquo;Solomon Islands&rdquo; in full.</li>
              <li>Use the local name for a craft or place when you know it.</li>
              <li>If something is unknown, say so plainly.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-heading text-base font-semibold text-deep-blue mb-2xs">Don&apos;t do this</h3>
            <ul className="space-y-2xs text-base text-warm-gray-800 leading-body list-disc pl-md">
              <li>Filler like &ldquo;skilled artisan&rdquo; or &ldquo;local craftsperson&rdquo;.</li>
              <li>&ldquo;The Solomons&rdquo;, &ldquo;tribal&rdquo;, &ldquo;primitive&rdquo;, &ldquo;exotic&rdquo;.</li>
              <li>Making up spiritual meaning or origin stories.</li>
              <li>Putting words in a maker&apos;s mouth they didn&apos;t say.</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section
        id="publish"
        title="Before you publish"
        intro="Run through this checklist before ticking “Published” on anything."
      >
        <ul className="space-y-2xs">
          {[
            'Every image has alt text that describes the photo.',
            'Maker consent status is \u201cSigned\u201d.',
            'Cultural context has been reviewed or left blank.',
            'No prices anywhere in public-facing text.',
            'Product code is unique and matches the swing tag.',
            'Maker and craft are linked (so the provenance page works).',
            'Names, villages, and provinces are spelled correctly.',
            'You\u2019ve opened the public page on your phone and read it.',
          ].map((item) => (
            <li key={item} className="flex gap-2xs text-base text-warm-gray-800 leading-body">
              <Check className="w-4 h-4 mt-3xs flex-shrink-0 text-success" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <p className="text-base text-warm-gray-600 mt-md leading-body">
          Not sure if something is ready? The{' '}
          <Link href="/admin/dashboard" className="text-ocean hover:text-ocean-dark font-medium transition-colors">
            dashboard
          </Link>{' '}
          flags anything missing alt text, consent, or a review — with a link to fix it.
        </p>
      </Section>
    </>
  );
}

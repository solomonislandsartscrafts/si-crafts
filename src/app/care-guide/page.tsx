import { generatePageMetadata } from '@/lib/metadata';
import { PageHeader } from '@/components/layout';
import { getSiteContentSafe } from '@/services/site-content';

export const metadata = generatePageMetadata({
  title: 'Care Guide',
  description: 'How to look after your Solomon Islands handicrafts — pandanus, wood, and shell care tips.',
  path: '/care-guide',
});

const CARE_SECTIONS = [
  {
    heading: 'Pandanus (Bags, Purses, Fans, Trays)',
    tips: [
      'Keep dry — pandanus absorbs moisture and can develop mould if stored damp.',
      'Store flat or gently stuffed with acid-free tissue to maintain shape.',
      'Brush gently with a soft dry brush to remove dust. Do not soak or machine wash.',
      'Avoid prolonged direct sunlight which can fade natural colours over time.',
    ],
  },
  {
    heading: 'Wood (Bowls, Trays, Carvings)',
    tips: [
      'Wipe with a slightly damp cloth, then dry immediately. Never soak or dishwash.',
      'Oil occasionally with food-safe wood oil (for bowls) or furniture oil (for ornaments) to maintain lustre.',
      'Keep away from direct heat sources and extreme temperature changes which can cause cracking.',
      'Dust decorative carvings with a soft microfibre cloth.',
    ],
  },
  {
    heading: 'Shell (Jewellery, Shell-Money Pieces)',
    tips: [
      'Store flat in a soft pouch or lined box to prevent scratching.',
      'Remove before swimming, showering, or applying perfume/sunscreen.',
      'Clean gently with a dry soft cloth. Avoid chemical cleaners and ultrasonic machines.',
      'Handle strung pieces gently — the string can weaken over time with rough use.',
    ],
  },
  {
    heading: 'Bush Twine (Kusa, Trays)',
    tips: [
      'Keep dry or wipe away moisture as soon as possible.',
      'Dust trays with a damp cloth or keep covered when not in use.',
      'It is safe to put hot or cold items on the trays — they will not warp.',
    ],
  },
];

export default async function CareGuidePage() {
  const siteContent = await getSiteContentSafe();

  // Parse newline-delimited CMS text into tip items, falling back to hardcoded tips
  function parseTips(cmsText: string | undefined, fallbackTips: string[]): string[] {
    if (!cmsText || !cmsText.trim()) return fallbackTips;
    return cmsText.split('\n').map((line) => line.trim()).filter(Boolean);
  }

  // Map CMS fields to care sections by material keyword
  const cmsFieldMap: Record<string, string | undefined> = {
    'Pandanus': siteContent.careGuidePandanus,
    'Wood': siteContent.careGuideWood,
    'Shell': siteContent.careGuideShell,
  };

  return (
    <div>
      <PageHeader
        title="Care Guide"
        intro={siteContent.careGuideIntro || "Each material needs different care. Follow these tips to keep your pieces looking beautiful for years."}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16 space-y-12">
        {CARE_SECTIONS.map((section) => {
          // Determine which CMS field matches this section (by first keyword in heading)
          const matchKey = Object.keys(cmsFieldMap).find((key) => section.heading.startsWith(key));
          const tips = parseTips(matchKey ? cmsFieldMap[matchKey] : undefined, section.tips);

          return (
            <section key={section.heading}>
              <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-4">
                {section.heading}
              </h2>
              <ul className="space-y-3 text-warm-gray-600 leading-relaxed">
                {tips.map((tip, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-terracotta font-bold">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

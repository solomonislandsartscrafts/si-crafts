import { generatePageMetadata } from '@/lib/metadata';

export const metadata = generatePageMetadata({
  title: 'Care Guide',
  description: 'How to look after your Solomon Islands handicrafts — pandanus, wood, and shell care tips.',
  path: '/care-guide',
});

export default function CareGuidePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-section-lg">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-deep-blue mb-4">Care Guide</h1>
      <p className="text-lg text-warm-gray-600 mb-12 leading-relaxed">
        Each material needs different care. Follow these tips to keep your pieces looking beautiful for years.
      </p>

      {/* Pandanus */}
      <section className="mb-12">
        <h2 className="font-heading text-xl font-bold text-deep-blue mb-4">Pandanus (Bags, Purses, Fans, Trays)</h2>
        <ul className="space-y-3 text-warm-gray-600">
          <li className="flex gap-2"><span className="text-terracotta font-bold">•</span> Keep dry — pandanus absorbs moisture and can develop mould if stored damp.</li>
          <li className="flex gap-2"><span className="text-terracotta font-bold">•</span> Store flat or gently stuffed with acid-free tissue to maintain shape.</li>
          <li className="flex gap-2"><span className="text-terracotta font-bold">•</span> Brush gently with a soft dry brush to remove dust. Do not soak or machine wash.</li>
          <li className="flex gap-2"><span className="text-terracotta font-bold">•</span> Avoid prolonged direct sunlight which can fade natural colours over time.</li>
        </ul>
      </section>

      {/* Wood */}
      <section className="mb-12">
        <h2 className="font-heading text-xl font-bold text-deep-blue mb-4">Wood (Bowls, Trays, Carvings)</h2>
        <ul className="space-y-3 text-warm-gray-600">
          <li className="flex gap-2"><span className="text-terracotta font-bold">•</span> Wipe with a slightly damp cloth, then dry immediately. Never soak or dishwash.</li>
          <li className="flex gap-2"><span className="text-terracotta font-bold">•</span> Oil occasionally with food-safe wood oil (for bowls) or furniture oil (for ornaments) to maintain lustre.</li>
          <li className="flex gap-2"><span className="text-terracotta font-bold">•</span> Keep away from direct heat sources and extreme temperature changes which can cause cracking.</li>
          <li className="flex gap-2"><span className="text-terracotta font-bold">•</span> Dust decorative carvings with a soft microfibre cloth.</li>
        </ul>
      </section>

      {/* Shell */}
      <section className="mb-12">
        <h2 className="font-heading text-xl font-bold text-deep-blue mb-4">Shell (Jewellery, Shell-Money Pieces)</h2>
        <ul className="space-y-3 text-warm-gray-600">
          <li className="flex gap-2"><span className="text-terracotta font-bold">•</span> Store flat in a soft pouch or lined box to prevent scratching.</li>
          <li className="flex gap-2"><span className="text-terracotta font-bold">•</span> Remove before swimming, showering, or applying perfume/sunscreen.</li>
          <li className="flex gap-2"><span className="text-terracotta font-bold">•</span> Clean gently with a dry soft cloth. Avoid chemical cleaners and ultrasonic machines.</li>
          <li className="flex gap-2"><span className="text-terracotta font-bold">•</span> Handle strung pieces gently — the string can weaken over time with rough use.</li>
        </ul>
      </section>

      {/* Bush Twine */}
      <section>
        <h2 className="font-heading text-xl font-bold text-deep-blue mb-4">Bush Twine (Kusa, Trays)</h2>
        <ul className="space-y-3 text-warm-gray-600">
          <li className="flex gap-2"><span className="text-terracotta font-bold">•</span> Keep dry or wipe away moisture as soon as possible.</li>
          <li className="flex gap-2"><span className="text-terracotta font-bold">•</span> Dust trays with a damp cloth or keep covered when not in use.</li>
          <li className="flex gap-2"><span className="text-terracotta font-bold">•</span> It is safe to put hot or cold items on the trays — they will not warp.</li>
        </ul>
      </section>
    </div>
  );
}

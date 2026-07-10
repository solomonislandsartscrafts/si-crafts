import { Heart, Shield, Eye, Users, DollarSign, HelpCircle } from 'lucide-react';
import { generatePageMetadata } from '@/lib/metadata';

export const metadata = generatePageMetadata({
  title: 'Our Promise',
  description:
    'Our commitment to authenticity, fair trade, and cultural respect for Solomon Islands makers.',
  path: '/our-promise',
});

export default function OurPromisePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-section-lg">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-deep-blue mb-4">
        Our Promise
      </h1>
      <p className="text-lg text-warm-gray-600 max-w-2xl leading-relaxed mb-12">
        Every relationship we build — with makers, stockists, and customers — is grounded
        in these commitments.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-16">
        {/* Authenticity */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-terracotta/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-terracotta" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-deep-blue mb-2">
              Authenticity
            </h2>
            <p className="text-warm-gray-600 leading-relaxed">
              Every piece we sell is genuinely handmade by a named maker in Solomon Islands.
              We never sell mass-produced imitations. Every product tag links to the maker&apos;s
              story so you can verify provenance with a scan.
            </p>
          </div>
        </div>

        {/* Fair Payment */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-terracotta/10 flex items-center justify-center">
            <Heart className="w-6 h-6 text-terracotta" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-deep-blue mb-2">
              Fair Payment
            </h2>
            <p className="text-warm-gray-600 leading-relaxed">
              Makers set their own prices. We pay upfront — not on consignment, not on commission.
              Our wholesale margin covers shipping, documentation, and distribution only.
            </p>
          </div>
        </div>

        {/* Cultural Respect */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-terracotta/10 flex items-center justify-center">
            <Eye className="w-6 h-6 text-terracotta" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-deep-blue mb-2">
              Cultural Respect
            </h2>
            <p className="text-warm-gray-600 leading-relaxed">
              These crafts belong to Solomon Islands peoples and communities. We are a conduit,
              not an owner. We never publish a maker&apos;s story or image without their signed consent,
              and we work with cultural partners to ensure descriptions are accurate and respectful.
            </p>
          </div>
        </div>

        {/* Consent & Transparency */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-terracotta/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-terracotta" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-deep-blue mb-2">
              Consent & Transparency
            </h2>
            <p className="text-warm-gray-600 leading-relaxed">
              Makers choose whether their name, photo, and story appear on this site.
              We only publish profiles with signed consent. If a maker asks to be removed,
              we remove them immediately — no questions, no delay.
            </p>
          </div>
        </div>
      </div>

      {/* WHERE THE MONEY GOES */}
      <section className="border-t border-sand pt-12 mb-16">
        <div className="flex gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-ocean/10 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-ocean" />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold text-deep-blue mb-2">
              Where the money goes
            </h2>
            <p className="text-sm text-warm-gray-400 italic">
              [NEEDS REVIEW — placeholder: exact figures to be confirmed with SIAC team]
            </p>
          </div>
        </div>
        <div className="max-w-2xl space-y-4 text-warm-gray-600 leading-relaxed">
          <p>
            When a shop purchases a piece at wholesale, the breakdown works like this:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>The maker receives the price they set</strong> — paid upfront at the point of purchase in Solomon Islands, before the piece reaches Australia.
              <span className="text-warm-gray-400 italic text-sm"> [NEEDS REVIEW — confirm payment timing and method]</span>
            </li>
            <li>
              <strong>SIAC&apos;s margin covers operations</strong> — international freight, import documentation, photography, provenance tagging, warehousing, and distribution to stockists.
              <span className="text-warm-gray-400 italic text-sm"> [NEEDS REVIEW — confirm margin % or range]</span>
            </li>
            <li>
              <strong>No middlemen, no agents</strong> — we buy directly from makers or maker cooperatives. There is no third-party supply chain taking a cut.
            </li>
          </ul>
          <p>
            We are a volunteer-run operation. No one at SIAC draws a salary from craft sales. Every dollar above operating costs goes toward sourcing more work from more makers.
            <span className="text-warm-gray-400 italic text-sm"> [NEEDS REVIEW — confirm volunteer/salary structure]</span>
          </p>
        </div>
      </section>

      {/* ARE YOU EXPLOITING MAKERS? */}
      <section className="border-t border-sand pt-12">
        <div className="flex gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-ocean/10 flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-ocean" />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold text-deep-blue">
              &ldquo;Are you exploiting makers?&rdquo;
            </h2>
          </div>
        </div>
        <div className="max-w-2xl space-y-4 text-warm-gray-600 leading-relaxed">
          <p>
            We get asked this, and it&apos;s a fair question. Here&apos;s our answer:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Makers set their own prices.</strong> We do not negotiate down. If a maker says a bag costs SBD 500, that&apos;s what we pay.
            </li>
            <li>
              <strong>Consent is non-negotiable.</strong> No maker&apos;s name, image, or story appears on this site without their written, signed consent. They can withdraw at any time.
            </li>
            <li>
              <strong>We pay upfront.</strong> Makers are paid when we collect the work — not when (or if) it sells in Australia.
            </li>
            <li>
              <strong>Cultural IP stays with communities.</strong> We do not claim ownership of designs, patterns, or techniques. We document provenance; we do not appropriate.
            </li>
            <li>
              <strong>We are transparent.</strong> This page exists so you can hold us to account. If something here isn&apos;t right, tell us.
            </li>
          </ul>
          <p className="text-warm-gray-400 italic text-sm">
            [NEEDS REVIEW — entire section to be reviewed by SIAC team and ideally a Solomon Islands cultural partner before publication]
          </p>
        </div>
      </section>
    </div>
  );
}

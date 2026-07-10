import Image from 'next/image';
import Link from 'next/link';
import type { Maker, Craft } from '@/types';

interface MakerSectionProps {
  maker: Maker | null;
  craft?: Craft | null;
}

export function MakerSection({ maker, craft }: MakerSectionProps) {
  if (!maker || !maker.publishedFlag) {
    return (
      <section className="mb-10">
        <h2 className="font-heading text-xl font-bold text-deep-blue mb-3">Your Maker</h2>
        <p className="text-warm-gray-400 italic">Maker details pending.</p>
      </section>
    );
  }

  // Excerpt: max 300 characters
  const storyExcerpt = maker.story
    ? maker.story.length > 300
      ? maker.story.slice(0, 297) + '...'
      : maker.story
    : null;

  return (
    <section className="mb-10">
      <h2 className="font-heading text-xl font-bold text-deep-blue mb-4">Your Maker</h2>
      <div className="flex gap-4 items-start">
        {/* Portrait */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 relative rounded-full overflow-hidden bg-sand">
          {maker.portraitUrl ? (
            <Image
              src={maker.portraitUrl}
              alt={`${maker.name} from ${maker.village}`}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-warm-gray-400 text-xs">Photo</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <Link
            href={`/maker/${maker.slug}`}
            className="font-heading font-semibold text-deep-blue hover:text-ocean transition-colors"
          >
            {maker.name}
          </Link>
          <p className="text-sm text-warm-gray-600">
            {maker.village}, {maker.province}
            {craft && (
              <span> · <Link href={`/craft/${craft.slug}`} className="text-ocean hover:text-ocean-dark">{craft.name}</Link></span>
            )}
          </p>
          {storyExcerpt ? (
            <p className="text-sm text-warm-gray-600 mt-2 italic leading-relaxed">
              &ldquo;{storyExcerpt}&rdquo;
            </p>
          ) : (
            <p className="text-sm text-warm-gray-400 mt-2 italic">
              Story pending cultural review.
            </p>
          )}
          <Link
            href={`/maker/${maker.slug}`}
            className="inline-block mt-2 text-xs font-medium text-ocean hover:text-ocean-dark transition-colors"
          >
            Read full story →
          </Link>
        </div>
      </div>
    </section>
  );
}

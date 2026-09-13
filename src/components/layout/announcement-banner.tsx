import { getAnnouncementSafe } from '@/services/announcement';
import { CmsInline } from '@/components/ui/cms-text';
import type { AnnouncementVariant } from '@/types';

/**
 * Site-wide announcement bar shown at the very top of every PUBLIC page, above
 * the header. Admin-controlled via Admin → Announcement.
 *
 * Server component: it reads admin copy, so it must run on the server (the
 * LayoutShell that positions it is a client component and cannot await). It is
 * therefore rendered in app/layout.tsx and passed into LayoutShell as a prop,
 * following the same pattern as the Footer.
 *
 * Renders nothing when the banner is disabled or the message is blank, so the
 * layout collapses cleanly with no empty bar.
 */

/**
 * Banner fills, drawn from the locked flag palette. blue/green are dark fills
 * (white text, AA+); gold is a light fill and takes dark text — white on gold
 * fails AA at every shade, per the design system's colour rules.
 */
const VARIANT_CLASS: Record<AnnouncementVariant, string> = {
  blue: 'bg-deep-blue text-white',
  green: 'bg-brand-green text-white',
  gold: 'bg-accent-gold text-deep-blue',
};

/** Link colour inside the message, tuned per fill so it stays legible. */
const LINK_CLASS: Record<AnnouncementVariant, string> = {
  blue: 'underline underline-offset-2 font-medium hover:text-accent-gold-light transition-colors',
  green: 'underline underline-offset-2 font-medium hover:text-accent-gold-light transition-colors',
  gold: 'underline underline-offset-2 font-medium text-ocean-dark hover:text-deep-blue transition-colors',
};

export async function AnnouncementBanner() {
  const announcement = await getAnnouncementSafe();

  if (!announcement.enabled || !announcement.message.trim()) return null;

  return (
    <div
      role="region"
      aria-label="Site announcement"
      className={`${VARIANT_CLASS[announcement.variant]} text-sm`}
    >
      <p className="site-container py-2xs text-center leading-body">
        <CmsInline value={announcement.message} linkClassName={LINK_CLASS[announcement.variant]} />
      </p>
    </div>
  );
}

'use client';

import { Lock } from 'lucide-react';
import { CmsInline } from '@/components/ui/cms-text';
import { usePricingAccess } from '@/lib/use-pricing-access';

interface StockistBannerPromptProps {
  /** Admin-editable invite copy, e.g. "Log in as a stockist to view pricing". */
  prompt: string;
  /**
   * Set when the banner it sits inside uses a light fill (the `gold` variant
   * of `<PageHeader banner>`), which takes dark text instead of white. Defaults
   * to the dark-band (white text) treatment used on `blue`/`green`/`terracotta`.
   */
  onLight?: boolean;
}

/**
 * The "log in as a stockist to view wholesale pricing" invite, shown inside the
 * catalogue banner.
 *
 * It lives in the banner (not in the filter bar) so it never pushes the product
 * grid down the page. It is hidden once a valid stockist or admin session is
 * confirmed (both can already see pricing) —
 * that check is client-only, which is why this is its own small client
 * component rather than server-rendered banner copy.
 *
 * Styled for a dark band by default: white/translucent pill, light text. Pass
 * `onLight` when the enclosing banner is the light `gold` fill instead — do
 * not use warm-gray on either treatment, it disappears on both bands.
 */
export function StockistBannerPrompt({ prompt, onLight }: StockistBannerPromptProps) {
  const { canViewPricing } = usePricingAccess();

  if (canViewPricing || !prompt) return null;

  return (
    <div
      className={`mt-md inline-flex items-center gap-2xs rounded-full px-sm py-2xs ${
        onLight ? 'bg-deep-blue/10' : 'bg-white/10'
      }`}
    >
      <Lock
        className={`w-4 h-4 flex-shrink-0 ${onLight ? 'text-deep-blue/70' : 'text-white/80'}`}
        aria-hidden="true"
      />
      <p className={`text-sm ${onLight ? 'text-deep-blue/90' : 'text-white/90'}`}>
        <CmsInline
          value={prompt}
          linkClassName={
            onLight
              ? 'font-semibold text-deep-blue underline hover:text-deep-blue/70'
              : 'font-semibold text-white underline hover:text-white/80'
          }
        />
      </p>
    </div>
  );
}

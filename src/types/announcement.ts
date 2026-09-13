/**
 * Site-wide announcement banner — a thin notice bar shown at the very top of
 * every PUBLIC page (above the header), controlled from the admin dashboard.
 *
 * Stored as a small JSON blob on the SiteContent singleton, mirroring
 * `slideshowSettings`, so no per-field migration is needed to evolve it.
 */

/** Banner colour, drawn from the locked flag palette. */
export type AnnouncementVariant = 'blue' | 'green' | 'gold';

export interface AnnouncementBanner {
  /** Master on/off switch. When false, nothing renders on the public site. */
  enabled: boolean;
  /**
   * The notice text. Supports the same tiny safe subset as other CMS copy:
   * `**bold**` and `[label](/path)`. Rendered via <CmsInline>, never raw HTML.
   * When blank, the banner does not render even if `enabled` is true.
   */
  message: string;
  /** Banner colour. Defaults to 'blue'. */
  variant: AnnouncementVariant;
}

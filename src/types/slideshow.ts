export type SlideCategory = 'product' | 'maker' | 'craft';

/**
 * Per-item toggle: which specific items appear in the slideshow.
 * `id` is the product/maker/craft ID, `enabled` controls visibility.
 */
export interface SlideItemToggle {
  id: string;
  kind: SlideCategory;
  enabled: boolean;
}

/**
 * Admin-controlled slideshow settings stored as JSON in SiteContent.
 * Controls which categories are active and which individual items show.
 */
export interface SlideshowSettings {
  /** Which categories are enabled for the slideshow */
  enabledCategories: {
    product: boolean;
    maker: boolean;
    craft: boolean;
  };
  /** Per-item opt-out toggles. Items listed here with enabled:false are hidden
   *  from the slideshow. Items absent from this array remain enabled by default.
   *  When empty, all items from enabled categories are shown (default behaviour). */
  items: SlideItemToggle[];
}

/**
 * Alt text is mandatory for every image on the site.
 * These helpers are the single source of truth for that rule so every admin
 * form blocks saving in the same way and with the same wording.
 */

/** Zero-based positions of images that have no usable alt text. */
export function missingAltIndexes(urls: string[], alts: string[] = []): number[] {
  return urls.reduce<number[]>((missing, url, index) => {
    if (url && !alts[index]?.trim()) missing.push(index);
    return missing;
  }, []);
}

/** True when at least one image is missing alt text. */
export function hasMissingAlt(urls: string[], alts: string[] = []): boolean {
  return missingAltIndexes(urls, alts).length > 0;
}

/**
 * Validation message for a set of images, or null when every image has alt text.
 * Use the return value to block a save.
 */
export function altTextError(urls: string[], alts: string[] = []): string | null {
  const missing = missingAltIndexes(urls, alts);
  if (missing.length === 0) return null;
  if (urls.length === 1) return 'Alt text is required before saving.';
  const positions = missing.map((i) => `#${i + 1}`).join(', ');
  return `Alt text is required for every photo. Missing: ${positions}.`;
}

/** Validation message for a single image, or null when it is fine. */
export function singleAltError(url: string, alt: string, imageLabel = 'image'): string | null {
  if (url && !alt.trim()) {
    return `Alt text is required for the ${imageLabel} before saving.`;
  }
  return null;
}

/**
 * True when the HTML contains an <img> with a missing or empty alt attribute.
 * Covers images inserted or pasted into the rich text editor.
 */
export function htmlHasImageMissingAlt(html: string): boolean {
  if (!html) return false;
  const imgTags = html.match(/<img\b[^>]*>/gi) ?? [];
  return imgTags.some((tag) => {
    const alt = tag.match(/\balt\s*=\s*"([^"]*)"/i) ?? tag.match(/\balt\s*=\s*'([^']*)'/i);
    return !alt || !alt[1].trim();
  });
}

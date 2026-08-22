import sanitizeHtml from 'sanitize-html';
import { resolveImageUrl } from '@/lib/api-client';

/**
 * Turns admin-authored article HTML into something safe to inject into a page.
 *
 * This is the single place that decides what survives from the rich text
 * editor, so the editor and the public page cannot drift apart. Two things
 * beyond plain sanitising happen here:
 *
 * 1. Image `src` values are run through resolveImageUrl(). Uploads land on R2
 *    with absolute URLs, but the local-dev fallback in the backend returns a
 *    relative "/uploads/..." path that is only reachable from the backend host.
 *    Every other image surface resolves that already (SafeImage does it); body
 *    HTML bypasses next/image, so it has to be done here or the image 404s.
 * 2. Placeholder captions are dropped. The editor used to insert a literal
 *    "Add a caption" figcaption, and any article saved without editing it still
 *    carries that string.
 */

const ALLOWED_TAGS = sanitizeHtml.defaults.allowedTags.concat([
  'img',
  'figure',
  'figcaption',
  'h1',
  'h2',
  'h3',
]);

/** Captions that are really just editor placeholders, not content. */
const PLACEHOLDER_CAPTIONS = new Set(['', 'add a caption', 'caption']);

export function renderArticleHtml(html: string | null | undefined): string {
  if (!html) return '';

  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      // `style` has to be listed here for allowedStyles below to do anything at
      // all — without it sanitize-html strips the attribute before the style
      // whitelist is ever consulted.
      img: ['src', 'alt', 'width', 'height', 'style', 'loading'],
      figure: ['style'],
      figcaption: ['style'],
    },
    allowedStyles: {
      img: {
        width: [/^(\d+(%|px|rem|em)|auto)$/],
        height: [/^(\d+(%|px|rem|em)|auto)$/],
        'border-radius': [/^[\d.]+(px|rem|em|%)$/],
        margin: [/^[\d.\s]+(px|rem|em|%)[\d.\s]*(px|rem|em|%)?$/],
      },
      figcaption: {
        'text-align': [/^(left|center|right)$/],
        'font-size': [/^[\d.]+(px|rem|em)$/],
        color: [/^(#[0-9a-fA-F]{3,6}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\))$/],
        'margin-top': [/^[\d.]+(px|rem|em)$/],
      },
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      img: (tagName, attribs) => {
        // An <img> with no usable src is worse than no image: it renders as a
        // broken-image icon, or as a full-width alt-text box. Marked for
        // removal by exclusiveFilter below, since transformTags cannot drop a
        // tag itself.
        const resolved = attribs.src?.trim() ? resolveImageUrl(attribs.src.trim()) : '';
        if (!resolved) return { tagName, attribs: {} };

        return {
          tagName,
          attribs: {
            ...attribs,
            src: resolved,
            loading: 'lazy',
          },
        };
      },
    },
    exclusiveFilter: (frame) => {
      // The src was stripped above because it was missing or unusable.
      if (frame.tag === 'img') return !frame.attribs.src;
      return (
        frame.tag === 'figcaption' &&
        PLACEHOLDER_CAPTIONS.has(frame.text.replace(/\u00a0/g, ' ').trim().toLowerCase())
      );
    },
  });
}

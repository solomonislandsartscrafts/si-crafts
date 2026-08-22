/**
 * Unit Tests — admin-editable site copy
 *
 * Two things here are easy to break by hand and expensive to notice:
 *
 * 1. The manifest is 169 hand-written entries. A duplicated key means two admin
 *    fields silently fight over one database row; a key the backend rejects
 *    means a save fails with a validation error the admin cannot act on.
 * 2. <CmsText> turns admin-authored strings into links. It must never emit a
 *    javascript: or protocol-relative href, however the copy is written.
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  SITE_TEXT_FIELDS,
  SITE_TEXT_GROUPS,
  SITE_TEXT_DEFAULTS,
} from '@/lib/site-text-manifest';
import { CmsText, splitCmsList, splitCmsParagraphs } from '@/components/ui/cms-text';

/** Mirrors KEY_PATTERN in backend/apps/site_text/serializers.py. */
const BACKEND_KEY_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/;
/** Mirrors MAX_VALUE_LENGTH in the same file. */
const BACKEND_MAX_VALUE = 20_000;

describe('site text manifest', () => {
  it('has no duplicate keys', () => {
    const keys = SITE_TEXT_FIELDS.map((field) => field.key);
    const duplicates = keys.filter((key, i) => keys.indexOf(key) !== i);
    expect(duplicates).toEqual([]);
  });

  it('only uses keys the backend will accept', () => {
    const rejected = SITE_TEXT_FIELDS.map((f) => f.key).filter(
      (key) => !BACKEND_KEY_PATTERN.test(key)
    );
    expect(rejected).toEqual([]);
  });

  it('has default copy short enough to save back', () => {
    const tooLong = SITE_TEXT_FIELDS.filter(
      (field) => field.defaultValue.length > BACKEND_MAX_VALUE
    ).map((field) => field.key);
    expect(tooLong).toEqual([]);
  });

  it('gives every field a label and every group a unique id', () => {
    expect(SITE_TEXT_FIELDS.filter((field) => !field.label.trim())).toEqual([]);

    const ids = SITE_TEXT_GROUPS.map((group) => group.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('ships real copy, not placeholders', () => {
    // A blank default would render an empty heading on the live site; a
    // "[NEEDS REVIEW]"-style marker must never reach a visitor.
    const suspect = SITE_TEXT_FIELDS.filter(
      (field) =>
        !field.defaultValue.trim() ||
        /needs review|lorem ipsum|TODO|FIXME/i.test(field.defaultValue)
    ).map((field) => field.key);
    expect(suspect).toEqual([]);
  });

  it('exposes a default for every field', () => {
    expect(Object.keys(SITE_TEXT_DEFAULTS).length).toBe(SITE_TEXT_FIELDS.length);
  });
});

describe('CmsText', () => {
  it('renders bold and internal links', () => {
    const { container } = render(
      <CmsText value="**Bold bit** and a [link](/wholesale)." />
    );
    expect(container.querySelector('strong')?.textContent).toBe('Bold bit');
    const link = container.querySelector('a');
    expect(link?.getAttribute('href')).toBe('/wholesale');
  });

  it('opens external links safely', () => {
    const { container } = render(<CmsText value="[Site](https://example.com)" />);
    const link = container.querySelector('a');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toContain('noopener');
  });

  it.each([
    'javascript:alert(1)',
    'JavaScript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    '//evil.example.com',
    'vbscript:msgbox(1)',
  ])('refuses to link %s', (href) => {
    const { container } = render(<CmsText value={`[Click me](${href})`} />);
    // No anchor at all — the label survives as plain text.
    expect(container.querySelector('a')).toBeNull();
    expect(container.textContent).toContain('Click me');
  });

  it('does not render raw HTML from copy', () => {
    const { container } = render(
      <CmsText value={'<script>alert(1)</script><b>bold?</b>'} />
    );
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('b')).toBeNull();
    expect(container.textContent).toContain('<script>alert(1)</script>');
  });

  it('splits paragraphs on blank lines and ignores stray whitespace', () => {
    expect(splitCmsParagraphs('One\n\nTwo\n\n\n  \n Three ')).toEqual([
      'One',
      'Two',
      'Three',
    ]);
    expect(splitCmsParagraphs('')).toEqual([]);
  });

  it('splits list fields one item per line', () => {
    expect(splitCmsList('First\n\nSecond\n   \nThird  ')).toEqual([
      'First',
      'Second',
      'Third',
    ]);
    expect(splitCmsList('')).toEqual([]);
  });

  it('renders nothing for empty copy, so a cleared field hides its section', () => {
    const { container } = render(<CmsText value="" />);
    expect(container.firstChild).toBeNull();
  });
});

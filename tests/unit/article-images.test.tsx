/**
 * Regression tests — images in article content
 *
 * The bug these cover: an admin could add images to a news article, see them in
 * the editor, publish, and get an article with no images. Two separate causes,
 * both of which lost the image before it ever reached the saved HTML:
 *
 *  1. Pasting from Word or Google Docs discarded the `text/html` flavour of the
 *     clipboard and re-inserted plain text, so every image in the pasted
 *     content vanished silently.
 *  2. Inserting via the toolbar used document.execCommand('insertHTML'), which
 *     writes wherever the selection happens to be. The file picker and the
 *     alt-text prompt both destroy the selection, so the markup could land
 *     outside the editor — visible on screen, absent from innerHTML.
 *
 * Every assertion here is about what `onChange` emits, because that string is
 * what gets sent to the backend. "It looks right in the editor" is exactly the
 * failure mode being guarded against, so the DOM is not the subject under test.
 *
 * The last block runs an editor-produced string through the public render path,
 * which is the only assertion that proves the two halves agree.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { htmlHasImageMissingAlt } from '@/lib/image-alt';

// Canvas is not implemented in jsdom, and compression is not what is under
// test — the blob just needs to survive the trip to the upload call.
vi.mock('@/lib/compress-image', () => ({
  compressImage: async (blob: Blob) => blob,
}));

const BACKEND = 'https://backend.test';

/** URLs the mocked upload endpoint has handed out, in order. */
let uploaded: string[] = [];

function mockFetch() {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : String(input);

    // Our own upload endpoint.
    if (url.includes('/api/upload')) {
      const next = `https://cdn.test/uploads/${uploaded.length + 1}.webp`;
      uploaded.push(next);
      return { ok: true, json: async () => ({ url: next }) } as Response;
    }

    // A remote image the browser is allowed to read (e.g. an image copied from
    // a public web page).
    if (url.startsWith('https://readable.test/')) {
      return {
        ok: true,
        blob: async () => new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' }),
      } as Response;
    }

    // Anything else behaves like a CORS refusal.
    throw new TypeError('fetch failed');
  });
}

/**
 * Holds `value` in state the way the article editor modal does, and exposes the
 * latest emitted HTML — the thing that would be saved.
 */
function Harness({ initial = '' }: { initial?: string }) {
  const [html, setHtml] = useState(initial);
  return (
    <>
      <RichTextEditor value={html} onChange={setHtml} label="Content" />
      <output data-testid="emitted">{html}</output>
    </>
  );
}

function emitted(): string {
  return screen.getByTestId('emitted').textContent ?? '';
}

function editorEl(): HTMLElement {
  return screen.getByRole('textbox', { name: 'Content' });
}

/** Runs the real handleFileChange path, as the file picker would. */
async function insertImageViaToolbar(name = 'photo.png') {
  fireEvent.click(screen.getByLabelText('Insert image'));
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  const file = new File([new Uint8Array([1, 2, 3])], name, { type: 'image/png' });
  await act(async () => {
    fireEvent.change(fileInput, { target: { files: [file] } });
  });
  await waitFor(() => expect(emitted()).toContain('<img'));
}

/** Dispatches a native paste event, since jsdom has no real clipboard. */
async function paste({ html = '', text = '', files = [] as File[] }) {
  const event = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'clipboardData', {
    value: {
      files,
      getData: (type: string) => (type === 'text/html' ? html : text),
    },
  });
  await act(async () => {
    editorEl().dispatchEvent(event);
  });
}

beforeEach(() => {
  uploaded = [];
  process.env.NEXT_PUBLIC_API_URL = BACKEND;
  vi.stubGlobal('fetch', mockFetch());
  // Neither exists in jsdom.
  Element.prototype.scrollIntoView = vi.fn();
  document.execCommand = vi.fn(() => true);
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.NEXT_PUBLIC_API_URL;
});

/* ========================================================================== */

describe('inserting an image from the toolbar', () => {
  it('puts the image in the saved HTML even when the caret was never in the editor', async () => {
    // The original failure: click the image button as the very first action, so
    // there is no selection inside the editor for insertHTML to target.
    render(<Harness />);
    await insertImageViaToolbar();

    expect(emitted()).toContain(`<img src="${uploaded[0]}"`);
    expect(emitted()).toContain('<figure>');
  });

  it('inserts into the editor element, not into the surrounding document', async () => {
    render(<Harness initial="<p>Existing copy.</p>" />);
    await insertImageViaToolbar();

    const imagesInEditor = editorEl().querySelectorAll('img');
    expect(imagesInEditor).toHaveLength(1);
    expect(imagesInEditor[0].getAttribute('src')).toBe(uploaded[0]);
    // Existing content is kept, not replaced.
    expect(emitted()).toContain('Existing copy.');
  });

  it('inserts at the caret when there is one', async () => {
    render(<Harness initial="<p>First.</p><p>Second.</p>" />);
    const editor = editorEl();

    const range = document.createRange();
    range.setStartAfter(editor.firstChild!);
    range.collapse(true);
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    fireEvent.mouseUp(editor);

    await insertImageViaToolbar();

    const children = Array.from(editor.children).map((c) => c.tagName);
    expect(children.indexOf('FIGURE')).toBe(1); // between the two paragraphs
    expect(emitted()).toContain('First.');
    expect(emitted()).toContain('Second.');
  });

  it('reports a failed upload instead of pretending it worked', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false }) as Response));
    render(<Harness />);

    fireEvent.click(screen.getByLabelText('Insert image'));
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(fileInput, {
        target: { files: [new File(['x'], 'a.png', { type: 'image/png' })] },
      });
    });

    expect(await screen.findByText(/could not be uploaded/i)).toBeInTheDocument();
    expect(emitted()).not.toContain('<img');
  });
});

describe('pasting content that contains images', () => {
  it('keeps a readable image by re-hosting it, instead of dropping it silently', async () => {
    render(<Harness />);
    await paste({
      html:
        '<p>Step one.</p>' +
        '<img src="https://readable.test/shell-money.png" alt="Shell money strands">' +
        '<p>Step two.</p>',
      text: 'Step one. Step two.',
    });

    await waitFor(() => expect(emitted()).toContain('<img'));
    expect(emitted()).toContain(`src="${uploaded[0]}"`);
    expect(emitted()).toContain('alt="Shell money strands"');
    // Structure survives — the old handler flattened everything to plain text.
    expect(emitted()).toContain('Step one.');
    expect(emitted()).toContain('Step two.');
  });

  it('fails loudly when a pasted image cannot be read', async () => {
    // What a Word paste actually looks like: a local file path the browser
    // cannot fetch. This is the case that produced the gap-riddled article.
    render(<Harness />);
    await paste({
      html: '<p>Bride price ceremony.</p><img src="file:///C:/Users/a/photo.png">',
      text: 'Bride price ceremony.',
    });

    expect(
      await screen.findByText(/could not be copied across/i)
    ).toBeInTheDocument();
    expect(emitted()).not.toContain('<img');
    expect(emitted()).toContain('Bride price ceremony.');
  });

  it('strips Word markup without stripping the content', async () => {
    render(<Harness />);
    await paste({
      html:
        '<!--[if gte mso 9]><xml>junk</xml><![endif]-->' +
        '<style>p.MsoNormal { mso-x: 1 }</style>' +
        '<p class="MsoNormal" style="mso-line-height:1"><span style="font-family:Calibri">' +
        'Langa Langa Lagoon</span></p>' +
        '<script>alert(1)</script>',
      text: 'Langa Langa Lagoon',
    });

    await waitFor(() => expect(emitted()).toContain('Langa Langa Lagoon'));
    const html = emitted();
    expect(html).toContain('<p>Langa Langa Lagoon</p>');
    expect(html).not.toContain('MsoNormal');
    expect(html).not.toContain('mso-');
    expect(html).not.toContain('<span');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('style=');
  });

  it('accepts an image file pasted straight from the clipboard', async () => {
    render(<Harness />);
    await paste({
      files: [new File([new Uint8Array([9])], 'screenshot.png', { type: 'image/png' })],
    });

    await waitFor(() => expect(emitted()).toContain('<img'));
    expect(emitted()).toContain(`src="${uploaded[0]}"`);
  });

  it('does not re-upload an image that is already hosted', async () => {
    render(<Harness />);
    await paste({
      html: `<figure><img src="${BACKEND}/media/uploads/existing.webp" alt="Carving"></figure>`,
      text: '',
    });

    await waitFor(() => expect(emitted()).toContain('<img'));
    expect(uploaded).toHaveLength(0);
    expect(emitted()).toContain('uploads/existing.webp');
  });
});

describe('alt text and captions', () => {
  it('lets the author describe an image, which is what unblocks saving', async () => {
    render(<Harness />);
    await insertImageViaToolbar();

    // An undescribed image blocks the save, so the editor has to say so.
    expect(htmlHasImageMissingAlt(emitted())).toBe(true);
    expect(screen.getByText(/still need alt text/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Alt text for the selected image'), {
      target: { value: 'Woven pandanus basket' },
    });

    expect(emitted()).toContain('alt="Woven pandanus basket"');
    expect(htmlHasImageMissingAlt(emitted())).toBe(false);
    await waitFor(() =>
      expect(screen.queryByText(/still need alt text/i)).not.toBeInTheDocument()
    );
  });

  it('adds and removes a caption without leaving a placeholder behind', async () => {
    render(<Harness />);
    await insertImageViaToolbar();

    const caption = screen.getByLabelText('Caption for the selected image');
    fireEvent.change(caption, { target: { value: 'Julie in Langa Langa Lagoon' } });
    expect(emitted()).toContain('<figcaption>Julie in Langa Langa Lagoon</figcaption>');

    fireEvent.change(caption, { target: { value: '' } });
    expect(emitted()).not.toContain('figcaption');
  });

  it('removes an image on request', async () => {
    render(<Harness initial="<p>Keep me.</p>" />);
    await insertImageViaToolbar();

    fireEvent.click(screen.getByText('Remove'));

    expect(emitted()).not.toContain('<img');
    expect(emitted()).toContain('Keep me.');
  });
});

describe('what the editor saves is what the page renders', () => {
  it('survives the public sanitiser with its src and alt intact', async () => {
    render(<Harness initial="<p>Intro.</p>" />);
    await insertImageViaToolbar();
    fireEvent.change(screen.getByLabelText('Alt text for the selected image'), {
      target: { value: 'Shell money necklace' },
    });
    fireEvent.change(screen.getByLabelText('Caption for the selected image'), {
      target: { value: 'Made in Malaita' },
    });

    const { renderArticleHtml } = await import('@/lib/article-html');
    const rendered = renderArticleHtml(emitted());

    expect(rendered).toContain(`<img src="${uploaded[0]}"`);
    expect(rendered).toContain('alt="Shell money necklace"');
    expect(rendered).toContain('<figcaption>Made in Malaita</figcaption>');
    expect(rendered).toContain('Intro.');
  });
});

describe('renderArticleHtml', () => {
  async function subject() {
    process.env.NEXT_PUBLIC_API_URL = BACKEND;
    const { renderArticleHtml } = await import('@/lib/article-html');
    return renderArticleHtml;
  }

  it('resolves a relative upload path to the backend that serves it', async () => {
    const render = await subject();
    // The backend's non-R2 fallback returns "/uploads/x", served at "/media/uploads/x".
    expect(render('<img src="/uploads/x.webp" alt="Basket">')).toContain(
      `src="${BACKEND}/media/uploads/x.webp"`
    );
    expect(render('<img src="/media/uploads/y.webp" alt="Basket">')).toContain(
      `src="${BACKEND}/media/uploads/y.webp"`
    );
  });

  it('leaves an absolute URL alone', async () => {
    const render = await subject();
    expect(render('<img src="https://cdn.test/uploads/z.webp" alt="Carving">')).toContain(
      'src="https://cdn.test/uploads/z.webp"'
    );
  });

  it('keeps the inline styles the editor is allowed to write', async () => {
    const render = await subject();
    const out = render('<img src="https://cdn.test/a.webp" alt="A" style="width:100%;border-radius:0.5rem">');
    expect(out).toContain('width:100%');
    expect(out).toContain('border-radius:0.5rem');
  });

  it('drops leftover placeholder captions but keeps real ones', async () => {
    const render = await subject();
    expect(render('<figure><img src="https://cdn.test/a.webp" alt="A"><figcaption>Add a caption</figcaption></figure>'))
      .not.toContain('Add a caption');
    expect(render('<figure><img src="https://cdn.test/a.webp" alt="A"><figcaption>&nbsp;</figcaption></figure>'))
      .not.toContain('figcaption');
    expect(render('<figure><img src="https://cdn.test/a.webp" alt="A"><figcaption>Julie weaving</figcaption></figure>'))
      .toContain('<figcaption>Julie weaving</figcaption>');
  });

  it('refuses script, event handlers and javascript: sources', async () => {
    const render = await subject();
    const out = render(
      '<script>alert(1)</script>' +
      '<img src="javascript:alert(1)" alt="x">' +
      '<img src="https://cdn.test/ok.webp" alt="ok" onerror="alert(1)">'
    );
    expect(out).not.toContain('<script');
    expect(out).not.toContain('javascript:');
    expect(out).not.toContain('onerror');
    expect(out).toContain('src="https://cdn.test/ok.webp"');
  });

  it('adds lazy loading to body images', async () => {
    const render = await subject();
    expect(render('<img src="https://cdn.test/a.webp" alt="A">')).toContain('loading="lazy"');
  });
});

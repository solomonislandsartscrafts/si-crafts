'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import {
  Bold, Italic, List, ListOrdered, Heading2, Heading3,
  ImagePlus, Link2, Quote, Minus, Type, Undo2, Redo2,
  AlertTriangle, Loader2, Trash2,
} from 'lucide-react';

import { compressImage } from '@/lib/compress-image';
import { inputClasses } from '@/components/ui/form-field';

interface RichTextEditorProps {
  value: string; // HTML string
  onChange: (html: string) => void;
  label?: string;
  placeholder?: string;
  minRows?: number;
  enableImages?: boolean; // show image insert button (default true for articles)
}

/* ==========================================================================
   Paste cleaning
   ==========================================================================
   Pasting from Word, Google Docs or a web page brings a mountain of markup we
   do not want (mso-* styles, spans, classes, font tags). The old handler dealt
   with that by throwing the HTML away and inserting plain text, which silently
   dropped every image in the pasted content — the article looked right in the
   editor but published with gaps. Now the structure is kept, the junk is
   stripped, and images are re-hosted so they survive the save.
   ========================================================================== */

/** Tags kept when pasting. Anything else is unwrapped, keeping its text. */
const PASTE_ALLOWED_TAGS = new Set([
  'P', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'A', 'UL', 'OL', 'LI',
  'H2', 'H3', 'BLOCKQUOTE', 'FIGURE', 'FIGCAPTION', 'IMG', 'HR', 'DIV',
]);

/** The only attributes allowed to survive a paste, by tag. */
const PASTE_KEEP_ATTRS: Record<string, string[]> = {
  A: ['href'],
  IMG: ['src', 'alt', 'width', 'height'],
};

const DROPPED_TAGS = 'style, script, meta, link, title, iframe, object, embed';

function unwrap(el: Element) {
  const parent = el.parentNode;
  if (!parent) return;
  while (el.firstChild) parent.insertBefore(el.firstChild, el);
  parent.removeChild(el);
}

function cleanElement(el: Element, root: Element) {
  // Depth-first so unwrapping a parent cannot skip its children.
  for (const child of Array.from(el.children)) cleanElement(child, root);
  if (el === root) return;

  if (!PASTE_ALLOWED_TAGS.has(el.tagName)) {
    unwrap(el);
    return;
  }
  const keep = PASTE_KEEP_ATTRS[el.tagName] ?? [];
  for (const attr of Array.from(el.attributes)) {
    if (!keep.includes(attr.name.toLowerCase())) el.removeAttribute(attr.name);
  }
}

/** Parses pasted HTML and returns a scrubbed detached body element. */
function cleanPastedHtml(html: string): HTMLElement {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const root = doc.body;

  root.querySelectorAll(DROPPED_TAGS).forEach((n) => n.remove());

  // Word wraps chunks of markup in conditional comments.
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_COMMENT);
  const comments: Comment[] = [];
  while (walker.nextNode()) comments.push(walker.currentNode as Comment);
  comments.forEach((c) => c.remove());

  cleanElement(root, root);
  return root;
}

/* ==========================================================================
   Upload
   ========================================================================== */

async function uploadImage(data: Blob, filename: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', data, filename);

  const token = localStorage.getItem('admin_session') ?? '';
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
  const endpoint = apiUrl ? `${apiUrl}/api/upload/` : '/api/upload';

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) throw new Error('Upload failed');

  const { url } = (await res.json()) as { url?: string };
  if (!url) throw new Error('Upload returned no URL');
  return url;
}

/** Compress to WebP and upload. Returns the hosted URL. */
async function compressAndUpload(source: Blob, name: string): Promise<string> {
  const compressed = await compressImage(source, 1000, 0.8);
  const base = name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-_]+/g, '-') || 'image';
  return uploadImage(compressed, `${Date.now()}-${base}.webp`);
}

async function blobFromSrc(src: string): Promise<Blob> {
  if (!/^(data:|https?:)/i.test(src)) throw new Error('Unsupported image source');
  const res = await fetch(src);
  if (!res.ok) throw new Error('Could not read image');
  const blob = await res.blob();
  if (!blob.type.startsWith('image/')) throw new Error('Not an image');
  return blob;
}

/**
 * True only for images already living on our own storage.
 *
 * The path alone is not enough: `https://someone-elses-cms.com/uploads/x.jpg`
 * contains `/uploads/` too, and treating it as ours left the article pointing
 * at a third-party host that can rename, rate-limit or delete the file. The
 * origin has to match the API host or the site itself; a relative path is by
 * definition local.
 */
function isAlreadyHosted(src: string): boolean {
  if (!src) return false;

  const ours = [process.env.NEXT_PUBLIC_API_URL, window.location.origin].filter(
    (value): value is string => Boolean(value)
  );

  let path: string;
  try {
    const url = new URL(src, window.location.origin);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    const isLocal = ours.some((base) => {
      try {
        return new URL(base, window.location.origin).origin === url.origin;
      } catch {
        return false;
      }
    });
    if (!isLocal) return false;
    path = url.pathname;
  } catch {
    return false;
  }

  return path.includes('/uploads/') || path.includes('/media/');
}

/**
 * Re-uploads every pasted image to our own storage so it still resolves after
 * publishing. Returns how many had to be dropped — a file:// path from Word or
 * a CORS-protected Google Docs URL cannot be read from the browser, and those
 * must be reported rather than published as a broken image.
 */
async function hostPastedImages(root: Element): Promise<number> {
  let dropped = 0;
  for (const img of Array.from(root.querySelectorAll('img'))) {
    const src = img.getAttribute('src') ?? '';
    if (isAlreadyHosted(src)) continue;
    try {
      img.setAttribute('src', await compressAndUpload(await blobFromSrc(src), 'pasted'));
    } catch {
      (img.closest('figure') ?? img).remove();
      dropped += 1;
    }
  }
  return dropped;
}

function countMissingAlt(root: HTMLElement): number {
  return Array.from(root.querySelectorAll('img')).filter(
    (img) => !img.getAttribute('alt')?.trim()
  ).length;
}

/* ==========================================================================
   Toolbar button
   ==========================================================================
   onMouseDown is prevented so clicking a button never steals focus from the
   editor — the caret (and therefore the selection a command applies to) stays
   exactly where the author left it.
   ========================================================================== */

function ToolButton({ onClick, label, children, active, disabled }: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      className={`tap-target p-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-ocean disabled:opacity-40 ${
        active ? 'bg-ocean/10 text-ocean' : 'text-warm-gray-400 hover:text-warm-gray-800 hover:bg-sand-light'
      }`}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

/**
 * Blog-style rich text editor using contentEditable.
 * Supports: bold, italic, headings, lists, blockquotes, links, inline images,
 * horizontal rules.
 */
export function RichTextEditor({
  value,
  onChange,
  label = 'Content',
  placeholder = 'Start typing...',
  minRows = 6,
  enableImages = true,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const altInputRef = useRef<HTMLInputElement>(null);

  /**
   * Last caret position known to be inside the editor. Uploading is async and
   * the file picker takes focus, so the live selection cannot be trusted by the
   * time an image is ready to insert.
   */
  const savedRangeRef = useRef<Range | null>(null);

  /**
   * The last HTML this component pushed upward. The value → DOM sync below
   * compares against it instead of using a boolean "is this my own edit" flag:
   * a flag gets stuck whenever the parent does not re-render, and a stuck flag
   * means the editor and the saved value can silently disagree.
   */
  const lastEmittedRef = useRef<string | null>(null);

  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [missingAltCount, setMissingAltCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [altDraft, setAltDraft] = useState('');
  const [captionDraft, setCaptionDraft] = useState('');

  // Sync external value into contentEditable. Skipped when the incoming value
  // is the one we just emitted, so typing never resets the caret.
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (lastEmittedRef.current !== null && value === lastEmittedRef.current) return;
    if (el.innerHTML !== value) el.innerHTML = value;
    lastEmittedRef.current = value;
    setMissingAltCount(countMissingAlt(el));
  }, [value]);

  const emit = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML;
    lastEmittedRef.current = html;
    setMissingAltCount(countMissingAlt(el));
    setSelectedImage((current) => (current && !el.contains(current) ? null : current));
    onChange(html);
  }, [onChange]);

  function rememberSelection() {
    const el = editorRef.current;
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (el.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  }

  function usableRange(): Range | null {
    const el = editorRef.current;
    const range = savedRangeRef.current;
    if (!el || !range) return null;
    return el.contains(range.commonAncestorContainer) ? range : null;
  }

  function restoreSelection() {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    const range = usableRange();
    const sel = window.getSelection();
    if (range && sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  function placeCaretAfter(node: Node) {
    const el = editorRef.current;
    if (!el || !el.contains(node)) return;
    const range = document.createRange();
    range.setStartAfter(node);
    range.collapse(true);
    savedRangeRef.current = range.cloneRange();
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  /**
   * Inserts nodes directly into the editor element rather than relying on
   * document.execCommand('insertHTML'), which needs the editor to hold the
   * selection. It did not after the file picker and alt-text prompt had run, so
   * the markup landed outside the editor: the author saw the image on screen but
   * innerHTML — the thing that gets saved — never contained it.
   *
   * If there is no usable caret the content is appended to the end. Losing the
   * position is a nuisance; losing the image is the bug being fixed.
   */
  function insertFragment(frag: DocumentFragment) {
    const el = editorRef.current;
    if (!el) return;
    const lastNode = frag.lastChild;
    const range = usableRange();
    if (range) {
      range.deleteContents();
      range.insertNode(frag);
    } else {
      el.appendChild(frag);
    }
    if (lastNode) placeCaretAfter(lastNode);
    emit();
  }

  const execCommand = useCallback((command: string, cmdValue?: string) => {
    restoreSelection();
    document.execCommand(command, false, cmdValue);
    rememberSelection();
    emit();
    editorRef.current?.focus();
  }, [emit]);

  /* --- Images --- */

  async function insertImageFile(file: Blob, name: string) {
    setBusy(true);
    setNotice(null);
    try {
      const url = await compressAndUpload(file, name);

      const frag = document.createDocumentFragment();
      const figure = document.createElement('figure');
      const img = document.createElement('img');
      img.setAttribute('src', url);
      // Inserted without alt text on purpose: the panel below the toolbar opens
      // on the new image so the author can describe what they can actually see.
      img.setAttribute('alt', '');
      figure.appendChild(img);
      frag.appendChild(figure);
      const trailing = document.createElement('p');
      trailing.appendChild(document.createElement('br'));
      frag.appendChild(trailing);

      insertFragment(frag);
      setSelectedImage(img);
      img.scrollIntoView({ block: 'nearest' });
    } catch {
      setNotice('That image could not be uploaded. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  async function insertPastedHtml(html: string) {
    const root = cleanPastedHtml(html);

    let dropped = 0;
    if (enableImages) {
      dropped = await hostPastedImages(root);
    } else {
      const imgs = Array.from(root.querySelectorAll('img'));
      dropped = imgs.length;
      imgs.forEach((img) => (img.closest('figure') ?? img).remove());
    }

    const frag = document.createDocumentFragment();
    while (root.firstChild) frag.appendChild(root.firstChild);
    insertFragment(frag);

    if (dropped > 0) {
      setNotice(
        `${dropped} image${dropped > 1 ? 's' : ''} in the pasted content could not be copied across. ` +
        `Save ${dropped > 1 ? 'them' : 'it'} to your computer and add ${dropped > 1 ? 'them' : 'it'} with the image button.`
      );
    }
  }

  function handleImageClick() {
    rememberSelection();
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void insertImageFile(file, file.name);
    e.target.value = '';
  }

  function handlePaste(e: React.ClipboardEvent) {
    // Everything must be read synchronously — clipboardData is unusable once an
    // await has yielded.
    const imageFiles = Array.from(e.clipboardData.files ?? []).filter((f) =>
      f.type.startsWith('image/')
    );
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');

    e.preventDefault();
    rememberSelection();

    if (enableImages && imageFiles.length > 0) {
      void (async () => {
        for (const file of imageFiles) await insertImageFile(file, file.name);
      })();
      return;
    }

    if (html.trim()) {
      setBusy(true);
      setNotice(null);
      void insertPastedHtml(html).finally(() => setBusy(false));
      return;
    }

    if (text) {
      document.execCommand('insertText', false, text);
      rememberSelection();
      emit();
    }
  }

  function handleEditorClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      setSelectedImage(target as HTMLImageElement);
      return;
    }
    setSelectedImage(null);
    rememberSelection();
  }

  // Load the selected image's alt text and caption into the panel.
  useEffect(() => {
    if (!selectedImage) return;
    setAltDraft(selectedImage.getAttribute('alt') ?? '');
    const caption = selectedImage.closest('figure')?.querySelector('figcaption');
    setCaptionDraft(caption?.textContent?.replace(/\u00a0/g, ' ').trim() ?? '');
    altInputRef.current?.focus();
  }, [selectedImage]);

  /** Wraps a bare <img> in a <figure> so it can carry a caption. */
  function ensureFigure(img: HTMLImageElement): HTMLElement {
    const existing = img.closest('figure');
    if (existing) return existing;
    const figure = document.createElement('figure');
    img.replaceWith(figure);
    figure.appendChild(img);
    return figure;
  }

  function handleAltChange(next: string) {
    setAltDraft(next);
    if (!selectedImage) return;
    selectedImage.setAttribute('alt', next);
    emit();
  }

  function handleCaptionChange(next: string) {
    setCaptionDraft(next);
    if (!selectedImage) return;
    const figure = ensureFigure(selectedImage);
    const existing = figure.querySelector('figcaption');
    if (next.trim()) {
      const caption = existing ?? figure.appendChild(document.createElement('figcaption'));
      caption.textContent = next;
    } else {
      existing?.remove();
    }
    emit();
  }

  function removeSelectedImage() {
    if (!selectedImage) return;
    (selectedImage.closest('figure') ?? selectedImage).remove();
    setSelectedImage(null);
    emit();
  }

  function selectFirstImageMissingAlt() {
    const el = editorRef.current;
    if (!el) return;
    const target = Array.from(el.querySelectorAll('img')).find(
      (img) => !img.getAttribute('alt')?.trim()
    );
    if (!target) return;
    setSelectedImage(target);
    target.scrollIntoView({ block: 'center' });
  }

  /* --- Links --- */

  function handleInsertLink() {
    if (showLinkInput) {
      if (linkUrl.trim()) {
        const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
        execCommand('createLink', url);
      }
      setShowLinkInput(false);
      setLinkUrl('');
    } else {
      rememberSelection();
      setShowLinkInput(true);
    }
  }

  function handleLinkKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInsertLink();
    }
    if (e.key === 'Escape') {
      setShowLinkInput(false);
      setLinkUrl('');
    }
  }

  const panelClasses = 'px-3 py-2 border-x border-sand-dark bg-sand-light/30';

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-warm-gray-800 mb-1">
          {label}
        </label>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border border-b-0 border-sand-dark rounded-t-md bg-sand-light/50">
        {/* Text formatting */}
        <ToolButton onClick={() => execCommand('bold')} label="Bold (Ctrl+B)">
          <Bold className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => execCommand('italic')} label="Italic (Ctrl+I)">
          <Italic className="w-4 h-4" />
        </ToolButton>

        <div className="w-px h-5 bg-sand-dark mx-1" />

        {/* Block formatting */}
        <ToolButton onClick={() => execCommand('formatBlock', 'p')} label="Paragraph">
          <Type className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => execCommand('formatBlock', 'h2')} label="Heading">
          <Heading2 className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => execCommand('formatBlock', 'h3')} label="Subheading">
          <Heading3 className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => execCommand('formatBlock', 'blockquote')} label="Quote">
          <Quote className="w-4 h-4" />
        </ToolButton>

        <div className="w-px h-5 bg-sand-dark mx-1" />

        {/* Lists */}
        <ToolButton onClick={() => execCommand('insertUnorderedList')} label="Bullet list">
          <List className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => execCommand('insertOrderedList')} label="Numbered list">
          <ListOrdered className="w-4 h-4" />
        </ToolButton>

        <div className="w-px h-5 bg-sand-dark mx-1" />

        {/* Insert */}
        <ToolButton onClick={handleInsertLink} label="Insert link" active={showLinkInput}>
          <Link2 className="w-4 h-4" />
        </ToolButton>
        {enableImages && (
          <ToolButton onClick={handleImageClick} label="Insert image" disabled={busy}>
            <ImagePlus className="w-4 h-4" />
          </ToolButton>
        )}
        <ToolButton onClick={() => execCommand('insertHorizontalRule')} label="Divider">
          <Minus className="w-4 h-4" />
        </ToolButton>

        <div className="w-px h-5 bg-sand-dark mx-1" />

        {/* Undo/Redo */}
        <ToolButton onClick={() => execCommand('undo')} label="Undo">
          <Undo2 className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => execCommand('redo')} label="Redo">
          <Redo2 className="w-4 h-4" />
        </ToolButton>

        {busy && (
          <span className="flex items-center gap-1.5 ml-auto pr-1 text-sm text-warm-gray-600">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            Uploading images...
          </span>
        )}
      </div>

      {/* Link URL input (shown inline when link button is active) */}
      {showLinkInput && (
        <div className="flex items-center gap-2 px-3 py-2 border-x border-sand-dark bg-sand-light/30">
          <Link2 className="w-4 h-4 text-warm-gray-400" />
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={handleLinkKeyDown}
            placeholder="Paste URL and press Enter"
            className="flex-1 px-2 py-1 text-sm bg-transparent text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ocean"
            autoFocus
          />
          <button
            type="button"
            onClick={handleInsertLink}
            className="text-xs font-medium text-ocean hover:text-ocean-dark"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => { setShowLinkInput(false); setLinkUrl(''); }}
            className="text-xs text-warm-gray-400 hover:text-warm-gray-800"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Selected image — alt text and caption */}
      {selectedImage && (
        <div className={`${panelClasses} space-y-2`}>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-warm-gray-800">Selected image</p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={removeSelectedImage}
                className="tap-target flex items-center gap-1 px-2 py-1 rounded text-sm text-error hover:bg-error/10 focus:outline-none focus:ring-2 focus:ring-ocean"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="tap-target px-2 py-1 rounded text-sm font-medium text-ocean hover:text-ocean-dark focus:outline-none focus:ring-2 focus:ring-ocean"
              >
                Done
              </button>
            </div>
          </div>
          <input
            ref={altInputRef}
            type="text"
            value={altDraft}
            onChange={(e) => handleAltChange(e.target.value)}
            placeholder="Alt text (required) — describe the image for screen readers"
            aria-label="Alt text for the selected image"
            data-error={altDraft.trim() ? undefined : 'true'}
            className={inputClasses}
          />
          <input
            type="text"
            value={captionDraft}
            onChange={(e) => handleCaptionChange(e.target.value)}
            placeholder="Caption (optional) — shown under the image"
            aria-label="Caption for the selected image"
            className={inputClasses}
          />
        </div>
      )}

      {/* Images still missing alt text — this blocks saving, so say so here */}
      {missingAltCount > 0 && (
        <div className={`${panelClasses} flex items-start gap-2 bg-warning/10`} role="status">
          <AlertTriangle className="w-4 h-4 text-warning-text shrink-0 mt-1" aria-hidden="true" />
          <p className="flex-1 text-sm text-warning-text">
            {missingAltCount} image{missingAltCount > 1 ? 's' : ''} still need alt text.
            The article cannot be saved until every image is described.
          </p>
          <button
            type="button"
            onClick={selectFirstImageMissingAlt}
            className="tap-target px-2 py-1 rounded text-sm font-medium text-warning-text underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-ocean"
          >
            Fix
          </button>
        </div>
      )}

      {/* Upload / paste problems */}
      {notice && (
        <div className={`${panelClasses} flex items-start gap-2 bg-ocean/5`} role="status">
          <AlertTriangle className="w-4 h-4 text-ocean shrink-0 mt-1" aria-hidden="true" />
          <p className="flex-1 text-sm text-warm-gray-800">{notice}</p>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="tap-target px-2 py-1 rounded text-sm font-medium text-ocean hover:text-ocean-dark focus:outline-none focus:ring-2 focus:ring-ocean"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={emit}
        onPaste={handlePaste}
        onKeyUp={rememberSelection}
        onMouseUp={rememberSelection}
        onBlur={rememberSelection}
        onClick={handleEditorClick}
        className="w-full px-6 py-4 border border-sand-dark rounded-b-md bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent overflow-y-auto article-content"
        style={{ minHeight: `${minRows * 1.6}rem` }}
        role="textbox"
        aria-multiline="true"
        aria-label={label}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      {/* Hidden file input for images */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="text-xs text-warm-gray-400 mt-2">
        <strong>Tip:</strong> Use the toolbar to format text, insert images, and add links.
        You can paste text and images straight from a document. Click any image in the
        editor to add its alt text and caption.
      </p>
    </div>
  );
}

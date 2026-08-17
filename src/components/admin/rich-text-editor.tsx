'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import {
  Bold, Italic, List, ListOrdered, Heading2, Heading3,
  ImagePlus, Link2, Quote, Minus, Type, Undo2, Redo2,
} from 'lucide-react';

import { compressImage } from '@/lib/compress-image';

interface RichTextEditorProps {
  value: string; // HTML string
  onChange: (html: string) => void;
  label?: string;
  placeholder?: string;
  minRows?: number;
  enableImages?: boolean; // show image insert button (default true for articles)
}

/**
 * Blog-style rich text editor using contentEditable.
 * Supports: bold, italic, headings, lists, blockquotes, links, inline images, horizontal rules.
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
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const isInternalUpdate = useRef(false);

  // Sync external value into contentEditable only when it changes externally
  // (not from user typing which triggers onChange → value update)
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const execCommand = useCallback((command: string, cmdValue?: string) => {
    document.execCommand(command, false, cmdValue);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    editorRef.current?.focus();
  }, [onChange]);

  function syncContent() {
    if (editorRef.current) {
      isInternalUpdate.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    // Allow pasting images
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) insertImageFile(file);
        return;
      }
    }
    // Otherwise paste as plain text
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }

  async function insertImageFile(file: File) {
    // Alt text is mandatory — ask before uploading, and abort without it.
    const altText = window.prompt(
      'Describe this image for screen readers (alt text). This is required.'
    );
    if (altText === null || !altText.trim()) {
      alert('Image not inserted. Alt text is required for every image.');
      return;
    }
    const safeAlt = altText
      .trim()
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Capture the current selection/range before async work
    const selection = window.getSelection();
    const savedRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;

    // Compress and upload via the upload API
    try {
      const compressed = await compressImage(file, 1000, 0.8);
      const formData = new FormData();
      const filename = `${Date.now()}-${file.name.replace(/\.[^.]+$/, '')}.webp`;
      formData.append('file', compressed, filename);

      const token = localStorage.getItem('admin_session') ?? '';
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
      const uploadEndpoint = apiUrl ? `${apiUrl}/api/upload/` : '/api/upload';
      const res = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();

      // Restore saved range and focus before inserting
      if (savedRange && editorRef.current) {
        editorRef.current.focus();
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(savedRange);
        }
      }

      // Insert image HTML at cursor
      document.execCommand('insertHTML', false,
        `<figure><img src="${url}" alt="${safeAlt}" style="width:100%;border-radius:0.5rem;margin:1rem 0;" /><figcaption style="text-align:center;font-size:0.875rem;color:#7A7067;margin-top:0.5rem;">Add a caption</figcaption></figure><p><br></p>`
      );
      syncContent();
    } catch {
      alert('Image upload failed. Please try again.');
    }
  }

  function handleImageClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) insertImageFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleInsertLink() {
    if (showLinkInput) {
      // Apply the link
      if (linkUrl.trim()) {
        const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
        execCommand('createLink', url);
      }
      setShowLinkInput(false);
      setLinkUrl('');
    } else {
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

  const ToolButton = ({ onClick, label: btnLabel, children, active }: {
    onClick: () => void;
    label: string;
    children: React.ReactNode;
    active?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`tap-target p-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-ocean ${
        active ? 'bg-ocean/10 text-ocean' : 'text-warm-gray-400 hover:text-warm-gray-800 hover:bg-sand-light'
      }`}
      aria-label={btnLabel}
      title={btnLabel}
    >
      {children}
    </button>
  );

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
          <ToolButton onClick={handleImageClick} label="Insert image">
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

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={syncContent}
        onPaste={handlePaste}
        className="w-full px-6 py-4 border border-sand-dark rounded-b-md bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent overflow-y-auto article-content"
        style={{ minHeight: `${minRows * 1.6}rem` }}
        role="textbox"
        aria-multiline="true"
        aria-label={label}
        data-placeholder={placeholder}
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
        You can also paste images directly from clipboard.
      </p>
    </div>
  );
}



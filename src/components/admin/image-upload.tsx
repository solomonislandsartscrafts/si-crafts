'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { compressImage } from '@/lib/compress-image';

interface ImageUploadProps {
  value: string; // current image URL/path
  onChange: (url: string) => void;
  altText?: string; // current alt text
  onAltTextChange?: (alt: string) => void;
  label?: string;
  aspectHint?: string; // e.g. "1:1 square" or "16:9 landscape"
  maxWidth?: number; // max compressed width in px (default 1200)
  quality?: number; // 0-1 compression quality (default 0.8)
}

export function ImageUpload({
  value,
  onChange,
  altText = '',
  onAltTextChange,
  label = 'Image',
  aspectHint,
  maxWidth = 1200,
  quality = 0.8,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (max 10MB raw, will be compressed)
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum 10 MB.');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Compress client-side
      const compressed = await compressImage(file, maxWidth, quality);

      // Build form data
      const formData = new FormData();
      const ext = 'webp';
      const filename = `${Date.now()}-${file.name.replace(/\.[^.]+$/, '')}.${ext}`;
      formData.append('file', compressed, filename);

      // Upload to API
      const token = localStorage.getItem('admin_session') ?? '';
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Upload failed');
      }

      const { url } = await res.json();
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function handleRemove() {
    onChange('');
    onAltTextChange?.('');
  }

  return (
    <div>
      <label className="block text-sm font-medium text-warm-gray-800 mb-1">
        {label}
      </label>

      {value ? (
        <div className="relative inline-block">
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-sand bg-sand-light">
            <Image
              src={value}
              alt={altText || 'Uploaded preview'}
              fill
              className="object-cover"
              sizes="128px"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center hover:bg-error/80 focus:outline-none focus:ring-2 focus:ring-error"
            aria-label="Remove image"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="tap-target flex flex-col items-center justify-center w-32 h-32 rounded-lg border-2 border-dashed border-sand-dark hover:border-ocean bg-sand-light/50 hover:bg-sand-light transition-colors focus:outline-none focus:ring-2 focus:ring-ocean disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 text-ocean animate-spin" />
          ) : (
            <>
              <Upload className="w-6 h-6 text-warm-gray-400 mb-1" />
              <span className="text-xs text-warm-gray-400">Upload</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        aria-label={`Upload ${label}`}
      />

      {aspectHint && !value && (
        <p className="text-xs text-warm-gray-400 mt-1">Recommended: {aspectHint}</p>
      )}

      {/* Alt text input — shown when an image is uploaded or when handler is provided */}
      {onAltTextChange && (
        <div className="mt-3">
          <label className="block text-xs font-medium text-warm-gray-600 mb-1">
            Alt text <span className="text-error">*</span>
            <span className="font-normal text-warm-gray-400 ml-1">(describes the image for accessibility)</span>
          </label>
          <input
            type="text"
            value={altText}
            onChange={(e) => onAltTextChange(e.target.value)}
            placeholder="Describe what this image shows"
            required
            aria-invalid={Boolean(value) && !altText.trim()}
            className={`w-full px-3 py-2 text-sm rounded-md border bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent ${
              value && !altText.trim() ? 'border-error' : 'border-sand-dark'
            }`}
          />
          {value && !altText.trim() && (
            <p className="text-sm text-error mt-1" aria-live="assertive">
              Alt text is required. You cannot save until this image is described.
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-error mt-1" aria-live="assertive">{error}</p>
      )}

      {uploading && (
        <p className="text-xs text-warm-gray-400 mt-1">Compressing and uploading...</p>
      )}
    </div>
  );
}

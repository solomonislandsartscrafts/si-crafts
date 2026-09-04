'use client';

import { useState, useRef } from 'react';
import { Upload, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { compressImage } from '@/lib/compress-image';
import { missingAltIndexes } from '@/lib/image-alt';
import { resolveImageUrl } from '@/lib/api-client';

const MAX_IMAGES = 6;

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  altTexts?: string[];
  onAltTextsChange?: (alts: string[]) => void;
  label?: string;
  aspectHint?: string;
  maxWidth?: number;
  quality?: number;
}

/**
 * Multi-image upload for product galleries.
 * Supports up to 6 images with reorder (move left/right) and remove.
 */
export function MultiImageUpload({
  value,
  onChange,
  altTexts = [],
  onAltTextsChange,
  label = 'Product Photos',
  aspectHint,
  maxWidth = 1200,
  quality = 0.8,
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, or WebP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum 10 MB.');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const compressed = await compressImage(file, maxWidth, quality);

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

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Upload failed');
      }

      const { url } = await res.json();
      onChange([...value, url]);
      onAltTextsChange?.([...altTexts, '']);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function handleRemove(index: number) {
    onChange(value.filter((_, i) => i !== index));
    if (onAltTextsChange) {
      onAltTextsChange(altTexts.filter((_, i) => i !== index));
    }
  }

  function handleMoveLeft(index: number) {
    if (index === 0) return;
    const next = [...value];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
    if (onAltTextsChange) {
      const nextAlts = [...altTexts];
      [nextAlts[index - 1], nextAlts[index]] = [nextAlts[index], nextAlts[index - 1]];
      onAltTextsChange(nextAlts);
    }
  }

  function handleMoveRight(index: number) {
    if (index === value.length - 1) return;
    const next = [...value];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
    if (onAltTextsChange) {
      const nextAlts = [...altTexts];
      [nextAlts[index], nextAlts[index + 1]] = [nextAlts[index + 1], nextAlts[index]];
      onAltTextsChange(nextAlts);
    }
  }

  // Every existing photo needs alt text before another one can be added,
  // so images can never pile up undescribed.
  const missingAlt = onAltTextsChange ? missingAltIndexes(value, altTexts) : [];
  const blockedByMissingAlt = missingAlt.length > 0;
  const canAdd = value.length < MAX_IMAGES && !blockedByMissingAlt;

  return (
    <div>
      <label className="block text-sm font-medium text-warm-gray-800 mb-2xs">
        {label}
        <span className="text-xs text-warm-gray-400 font-normal ml-2xs">
          ({value.length}/{MAX_IMAGES})
        </span>
      </label>

      {/* Thumbnail grid */}
      <div className="flex flex-wrap gap-xs">
        {value.map((url, index) => (
          <div key={`${url}-${index}`} className="relative group">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-sand bg-sand-light">
              <Image
                src={resolveImageUrl(url)}
                alt={`Product image ${index + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>

            {/* First image badge */}
            {index === 0 && (
              <span className="absolute top-1 left-1 bg-ocean text-white text-[10px] font-medium px-2xs py-3xs rounded">
                Main
              </span>
            )}

            {/* Remove button. Visible on hover AND on keyboard focus — without
                `focus:opacity-100` a keyboard user could tab onto this button
                and see nothing there until the mouse also happened to hover it. */}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center hover:bg-error/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
              aria-label={`Remove image ${index + 1}`}
            >
              <X className="w-3 h-3" />
            </button>

            {/* Reorder buttons — same hover/focus-visibility rule as above. */}
            <div className="absolute bottom-1 inset-x-0 flex justify-center gap-3xs opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => handleMoveLeft(index)}
                  className="w-5 h-5 bg-white/90 text-deep-blue rounded flex items-center justify-center shadow-sm hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean focus:opacity-100"
                  aria-label={`Move image ${index + 1} left`}
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
              )}
              {index < value.length - 1 && (
                <button
                  type="button"
                  onClick={() => handleMoveRight(index)}
                  className="w-5 h-5 bg-white/90 text-deep-blue rounded flex items-center justify-center shadow-sm hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean focus:opacity-100"
                  aria-label={`Move image ${index + 1} right`}
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Add button — hidden while any photo is missing alt text */}
        {canAdd && value.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="tap-target flex flex-col items-center justify-center w-24 h-24 rounded-lg border-2 border-dashed border-sand-dark hover:border-ocean bg-sand-light/50 hover:bg-sand-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 text-ocean animate-spin" />
            ) : (
              <>
                <Upload className="w-5 h-5 text-warm-gray-400 mb-3xs" />
                <span className="text-xs text-warm-gray-400">Add</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload product image"
      />

      {/* Alt text inputs for each uploaded image */}
      {onAltTextsChange && value.length > 0 && (
        <div className="mt-sm space-y-2xs">
          <p className="text-xs font-medium text-warm-gray-600">
            Alt text <span className="text-error">*</span>
            <span className="font-normal text-warm-gray-400 ml-3xs">(describes each image for accessibility)</span>
          </p>
          {value.map((_, index) => {
            const isMissing = missingAlt.includes(index);
            return (
              <div key={`alt-${index}`} className="flex items-center gap-2xs">
                <span className="text-xs text-warm-gray-400 w-6 shrink-0">#{index + 1}</span>
                <input
                  type="text"
                  value={altTexts[index] ?? ''}
                  onChange={(e) => {
                    const next = [...altTexts];
                    next[index] = e.target.value;
                    onAltTextsChange(next);
                  }}
                  required
                  aria-invalid={isMissing}
                  aria-label={`Alt text for image ${index + 1}`}
                  placeholder={`Describe image ${index + 1}`}
                  className={`flex-1 px-xs py-2xs text-sm rounded-md border bg-white text-warm-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean focus-visible:border-transparent ${
                    isMissing ? 'border-error' : 'border-sand-dark'
                  }`}
                />
              </div>
            );
          })}
          {blockedByMissingAlt && (
            <p className="text-sm text-error" aria-live="assertive">
              Alt text is required for every photo. You cannot save or add another photo until each one is described.
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-error mt-2xs" aria-live="assertive">{error}</p>
      )}

      {uploading && (
        <p className="text-xs text-warm-gray-400 mt-3xs">Compressing and uploading...</p>
      )}

      {value.length === 0 && !uploading && (
        <p className="text-xs text-warm-gray-400 mt-2xs">
          Upload up to {MAX_IMAGES} images. The first image will be the main product photo.
          Each one needs alt text before you can save.
          {aspectHint && <><br />Recommended: {aspectHint}</>}
        </p>
      )}
    </div>
  );
}

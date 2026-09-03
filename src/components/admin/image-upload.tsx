'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { compressImage } from '@/lib/compress-image';
import { resolveImageUrl } from '@/lib/api-client';

/** Reads intrinsic width/height of an image file without uploading. */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image dimensions'));
    };
    img.src = url;
  });
}

interface ImageUploadProps {
  value: string; // current image URL/path
  onChange: (url: string) => void;
  altText?: string; // current alt text
  onAltTextChange?: (alt: string) => void;
  label?: string;
  aspectHint?: string; // e.g. "1:1 square" or "16:9 landscape"
  /** Recommended minimum width in px — shows a warning if the uploaded image is smaller */
  recommendedMinWidth?: number;
  /** Recommended aspect ratio as width/height (e.g. 1.5 for 3:2). Shows warning if image deviates significantly. */
  recommendedAspectRatio?: number;
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
  recommendedMinWidth,
  recommendedAspectRatio,
  maxWidth = 1200,
  quality = 0.8,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sizeWarning, setSizeWarning] = useState<string | null>(null);
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
    setSizeWarning(null);
    setUploading(true);

    try {
      // Check image dimensions for guidance warnings
      if (recommendedMinWidth || recommendedAspectRatio) {
        const dims = await getImageDimensions(file);
        const warnings: string[] = [];
        if (recommendedMinWidth && dims.width < recommendedMinWidth) {
          warnings.push(`Image is ${dims.width}px wide — recommended at least ${recommendedMinWidth}px for best quality.`);
        }
        if (recommendedAspectRatio) {
          const actualRatio = dims.width / dims.height;
          const deviation = Math.abs(actualRatio - recommendedAspectRatio) / recommendedAspectRatio;
          if (deviation > 0.25) {
            warnings.push(`Aspect ratio differs from recommended — image may be cropped in the slideshow.`);
          }
        }
        if (warnings.length > 0) {
          setSizeWarning(warnings.join(' '));
        }
      }

      // Compress client-side
      const compressed = await compressImage(file, maxWidth, quality);

      // Build form data
      const formData = new FormData();
      const ext = 'webp';
      const filename = `${Date.now()}-${file.name.replace(/\.[^.]+$/, '')}.${ext}`;
      formData.append('file', compressed, filename);

      // Upload to the Django backend, which handles R2 storage.
      // Falls back to the local Next.js route when no backend is configured.
      const token = localStorage.getItem('admin_session') ?? '';
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
      const uploadEndpoint = apiUrl ? `${apiUrl}/api/upload/` : '/api/upload';

      const res = await fetch(uploadEndpoint, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) {
        const data: unknown = await res.json().catch(() => null);
        const message =
          data &&
          typeof data === 'object' &&
          'error' in data &&
          typeof data.error === 'string'
            ? data.error
            : 'Upload failed';
        throw new Error(message);
      }

      const data: unknown = await res.json();
      const url =
        data &&
        typeof data === 'object' &&
        'url' in data &&
        typeof data.url === 'string'
          ? data.url
          : null;
      if (!url || !url.trim()) {
        throw new Error('Upload response did not include a valid URL');
      }
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
    setSizeWarning(null);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-warm-gray-800 mb-3xs">
        {label}
      </label>

      {value ? (
        <div className="relative inline-block">
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-sand bg-sand-light">
            <Image
              src={resolveImageUrl(value)}
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
              <Upload className="w-6 h-6 text-warm-gray-400 mb-3xs" />
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

      {aspectHint && (
        <p className="text-xs text-warm-gray-400 mt-3xs">Recommended: {aspectHint}</p>
      )}

      {sizeWarning && (
        <p className="text-xs text-warning mt-3xs" role="alert">{sizeWarning}</p>
      )}

      {/* Alt text input — shown when an image is uploaded or when handler is provided */}
      {onAltTextChange && (
        <div className="mt-xs">
          <label className="block text-xs font-medium text-warm-gray-600 mb-3xs">
            Alt text <span className="text-error">*</span>
            <span className="font-normal text-warm-gray-400 ml-3xs">(describes the image for accessibility)</span>
          </label>
          <input
            type="text"
            value={altText}
            onChange={(e) => onAltTextChange(e.target.value)}
            placeholder="Describe what this image shows"
            required
            aria-invalid={Boolean(value) && !altText.trim()}
            className={`w-full px-xs py-2xs text-sm rounded-md border bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent ${
              value && !altText.trim() ? 'border-error' : 'border-sand-dark'
            }`}
          />
          {value && !altText.trim() && (
            <p className="text-sm text-error mt-3xs" aria-live="assertive">
              Alt text is required. You cannot save until this image is described.
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-error mt-3xs" aria-live="assertive">{error}</p>
      )}

      {uploading && (
        <p className="text-xs text-warm-gray-400 mt-3xs">Compressing and uploading...</p>
      )}
    </div>
  );
}

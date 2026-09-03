'use client';

import { useState, useEffect } from 'react';
import { Share2, Link2, Check } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  url?: string; // If not provided, uses current page URL
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [clipboardAvailable, setClipboardAvailable] = useState(true);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && !navigator.clipboard?.writeText) {
      setClipboardAvailable(false);
    }
  }, []);

  function getUrl() {
    return url || (typeof window !== 'undefined' ? window.location.href : '');
  }

  async function handleNativeShare() {
    const shareUrl = getUrl();
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
      } catch {
        // User cancelled — ignore
      }
    }
  }

  async function handleCopyLink() {
    setCopyFailed(false);
    try {
      if (!navigator.clipboard?.writeText) {
        setCopyFailed(true);
        setTimeout(() => setCopyFailed(false), 3000);
        return;
      }
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 3000);
    }
  }

  function handleFacebook() {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getUrl())}`, '_blank', 'width=600,height=400');
  }

  function handleTwitter() {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(getUrl())}`, '_blank', 'width=600,height=400');
  }

  function handleEmail() {
    window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this article: ${getUrl()}`)}`;
  }

  const [hasNativeShare, setHasNativeShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && !!navigator.share) {
      setHasNativeShare(true);
    }
  }, []);

  return (
    <div className="flex items-center gap-2xs">
      <span className="text-xs text-warm-gray-400 mr-3xs">Share</span>

      {/* Native share (mobile) — only shown after hydration */}
      {hasNativeShare && (
        <button
          onClick={handleNativeShare}
          className="tap-target p-2xs rounded-full text-warm-gray-400 hover:text-ocean hover:bg-ocean/10 transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
          aria-label="Share article"
        >
          <Share2 className="w-4 h-4" />
        </button>
      )}

      {/* Facebook */}
      <button
        onClick={handleFacebook}
        className="tap-target p-2xs rounded-full text-warm-gray-400 hover:text-[#1877F2] hover:bg-[#1877F2]/10 transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
        aria-label="Share on Facebook"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </button>

      {/* Twitter/X */}
      <button
        onClick={handleTwitter}
        className="tap-target p-2xs rounded-full text-warm-gray-400 hover:text-warm-gray-800 hover:bg-warm-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
        aria-label="Share on X"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </button>

      {/* Email */}
      <button
        onClick={handleEmail}
        className="tap-target p-2xs rounded-full text-warm-gray-400 hover:text-ocean hover:bg-ocean/10 transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
        aria-label="Share via email"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M22 7l-10 6L2 7" />
        </svg>
      </button>

      {/* Copy link */}
      {clipboardAvailable && (
        <button
          onClick={handleCopyLink}
          className="tap-target p-2xs rounded-full text-warm-gray-400 hover:text-ocean hover:bg-ocean/10 transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
          aria-label={copied ? 'Link copied' : copyFailed ? 'Copy failed' : 'Copy link'}
        >
          {copied ? <Check className="w-4 h-4 text-success" /> : <Link2 className="w-4 h-4" />}
        </button>
      )}
      <span className="sr-only" aria-live="polite">
        {copied ? 'Link copied to clipboard' : copyFailed ? 'Failed to copy link' : ''}
      </span>
    </div>
  );
}

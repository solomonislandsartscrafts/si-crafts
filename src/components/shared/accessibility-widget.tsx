'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Volume2, VolumeX } from 'lucide-react';

type ColorblindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

export function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [colorblindMode, setColorblindMode] = useState<ColorblindMode>('none');
  const [isReading, setIsReading] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Load saved preferences
  useEffect(() => {
    const saved = localStorage.getItem('a11y-prefs');
    if (saved) {
      try {
        const prefs = JSON.parse(saved);
        if (prefs.fontSize) setFontSize(prefs.fontSize);
        if (prefs.highContrast) setHighContrast(prefs.highContrast);
        if (prefs.colorblindMode) setColorblindMode(prefs.colorblindMode);
      } catch {
        // Invalid stored prefs — ignore
      }
    }
  }, []);

  // Apply preferences
  useEffect(() => {
    const html = document.documentElement;
    html.style.fontSize = `${fontSize}%`;
    html.classList.toggle('a11y-high-contrast', highContrast);

    // Colorblind modes
    html.classList.remove('a11y-protanopia', 'a11y-deuteranopia', 'a11y-tritanopia');
    if (colorblindMode !== 'none') {
      html.classList.add(`a11y-${colorblindMode}`);
    }

    localStorage.setItem('a11y-prefs', JSON.stringify({ fontSize, highContrast, colorblindMode }));
  }, [fontSize, highContrast, colorblindMode]);

  // Read Aloud — Web Speech API
  function handleReadAloud() {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      return;
    }

    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    const text = mainContent.innerText || mainContent.textContent || '';
    if (!text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.lang = 'en-AU';
    utterance.onend = () => setIsReading(false);
    utterance.onerror = () => setIsReading(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsReading(true);
  }

  // Stop reading on unmount
  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  // Close handler — restores focus to trigger
  const closePanel = useCallback(() => {
    setOpen(false);
    // Restore focus to the trigger button
    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }, []);

  // Focus entry + keyboard handling (Escape to close) + focus trap
  useEffect(() => {
    if (!open) return;

    // Move focus into the panel
    requestAnimationFrame(() => {
      panelRef.current?.focus();
    });

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closePanel();
        return;
      }

      // Focus trap within the panel
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, closePanel]);

  function resetAll() {
    setFontSize(100);
    setHighContrast(false);
    setColorblindMode('none');
    window.speechSynthesis.cancel();
    setIsReading(false);
  }

  return (
    <>
      {/* Floating button */}
      <button
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 right-4 sm:bottom-4 z-50 w-12 h-12 bg-terracotta hover:bg-terracotta-dark text-white rounded-full shadow-lg flex items-center justify-center transition-colors focus:outline-none focus:ring-4 focus:ring-terracotta-light"
        aria-label="Accessibility options"
        aria-expanded={open}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="4" r="1.5" fill="currentColor" />
          <path d="M7 8h10M12 8v8M9 20l3-4 3 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Panel — bottom sheet on mobile, anchored popover on desktop */}
      {open && (
        <>
          {/* Backdrop on mobile */}
          <div
            className="fixed inset-0 z-50 bg-black/20 sm:hidden"
            onClick={closePanel}
          />
          <div
            ref={panelRef}
            tabIndex={-1}
            className="fixed z-50 inset-x-0 bottom-0 sm:inset-auto sm:bottom-16 sm:right-4 sm:w-72 bg-white rounded-t-xl sm:rounded-lg shadow-xl border border-sand p-5 outline-none"
            role="dialog"
            aria-modal="true"
            aria-label="Accessibility settings"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-base font-medium text-deep-blue">Accessibility</h2>
              <button
                onClick={closePanel}
                className="tap-target p-2 text-warm-gray-400 hover:text-warm-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-ocean rounded-md"
                aria-label="Close accessibility panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Read Aloud */}
              <div>
                <button
                  onClick={handleReadAloud}
                  className={`tap-target w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean ${
                    isReading
                      ? 'bg-error/10 text-error border border-error/30'
                      : 'bg-ocean/10 text-ocean border border-ocean/30 hover:bg-ocean/20'
                  }`}
                  aria-label={isReading ? 'Stop reading' : 'Read page content aloud'}
                >
                  {isReading ? (
                    <><VolumeX className="w-4 h-4" /> Stop Reading</>
                  ) : (
                    <><Volume2 className="w-4 h-4" /> Read This Page</>
                  )}
                </button>
              </div>

              {/* Text Size */}
              <div>
                <p className="text-sm font-medium text-warm-gray-800 mb-2">Text Size</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFontSize(Math.max(80, fontSize - 10))}
                    className="tap-target w-10 h-10 flex items-center justify-center rounded-md border border-sand-dark text-deep-blue font-bold hover:bg-sand-light focus:outline-none focus:ring-2 focus:ring-ocean"
                    aria-label="Decrease text size"
                  >
                    A-
                  </button>
                  <span className="text-sm text-warm-gray-600 min-w-[3rem] text-center">{fontSize}%</span>
                  <button
                    onClick={() => setFontSize(Math.min(150, fontSize + 10))}
                    className="tap-target w-10 h-10 flex items-center justify-center rounded-md border border-sand-dark text-deep-blue font-bold hover:bg-sand-light focus:outline-none focus:ring-2 focus:ring-ocean"
                    aria-label="Increase text size"
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* Colour Vision */}
              <div>
                <p className="text-sm font-medium text-warm-gray-800 mb-2">Colour Vision</p>
                <select
                  value={colorblindMode}
                  onChange={(e) => setColorblindMode(e.target.value as ColorblindMode)}
                  className="w-full px-3 py-2 rounded-md border border-sand-dark bg-white text-warm-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-ocean"
                  aria-label="Colour vision mode"
                >
                  <option value="none">Default colours</option>
                  <option value="protanopia">Protanopia (red-blind)</option>
                  <option value="deuteranopia">Deuteranopia (green-blind)</option>
                  <option value="tritanopia">Tritanopia (blue-blind)</option>
                </select>
              </div>

              {/* High Contrast */}
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-warm-gray-800">High Contrast</span>
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  className="w-5 h-5 rounded border-sand-dark text-ocean focus:ring-ocean"
                />
              </label>

              {/* Reset */}
              <button
                onClick={resetAll}
                className="w-full text-center text-sm font-medium text-ocean hover:text-ocean-dark transition-colors py-2 border-t border-sand pt-3"
              >
                Reset to defaults
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

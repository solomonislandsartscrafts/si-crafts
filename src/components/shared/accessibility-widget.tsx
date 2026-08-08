'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Volume2, VolumeX } from 'lucide-react';

type ColorblindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

export function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [underlineLinks, setUnderlineLinks] = useState(false);
  const [colorblindMode, setColorblindMode] = useState<ColorblindMode>('none');
  const [isReading, setIsReading] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load saved preferences
  useEffect(() => {
    const saved = localStorage.getItem('a11y-prefs');
    if (saved) {
      try {
        const prefs = JSON.parse(saved);
        if (prefs.fontSize) setFontSize(prefs.fontSize);
        if (prefs.highContrast) setHighContrast(prefs.highContrast);
        if (prefs.reducedMotion) setReducedMotion(prefs.reducedMotion);
        if (prefs.underlineLinks) setUnderlineLinks(prefs.underlineLinks);
        if (prefs.colorblindMode) setColorblindMode(prefs.colorblindMode);
      } catch {
        // Invalid stored prefs — ignore
      }
    }
  }, []);

  // Apply preferences
  useEffect(() => {
    const html = document.documentElement;

    // Font size
    html.style.fontSize = `${fontSize}%`;

    // High contrast
    html.classList.toggle('a11y-high-contrast', highContrast);

    // Reduced motion
    html.classList.toggle('a11y-reduced-motion', reducedMotion);

    // Underline all links
    html.classList.toggle('a11y-underline-links', underlineLinks);

    // Colorblind modes
    html.classList.remove('a11y-protanopia', 'a11y-deuteranopia', 'a11y-tritanopia');
    if (colorblindMode !== 'none') {
      html.classList.add(`a11y-${colorblindMode}`);
    }

    // Save preferences
    localStorage.setItem('a11y-prefs', JSON.stringify({
      fontSize,
      highContrast,
      reducedMotion,
      underlineLinks,
      colorblindMode,
    }));
  }, [fontSize, highContrast, reducedMotion, underlineLinks, colorblindMode]);

  // Read Aloud — uses Web Speech API
  function handleReadAloud() {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      return;
    }

    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    // Get visible text content, skipping hidden elements
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

  // Stop reading when navigating away
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Close panel on Escape key
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  function resetAll() {
    setFontSize(100);
    setHighContrast(false);
    setReducedMotion(false);
    setUnderlineLinks(false);
    setColorblindMode('none');
    window.speechSynthesis.cancel();
    setIsReading(false);
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-terracotta hover:bg-terracotta-dark text-white rounded-full shadow-lg flex items-center justify-center transition-colors focus:outline-none focus:ring-4 focus:ring-terracotta-light"
        aria-label="Accessibility options"
        aria-expanded={open}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="4" r="1.5" fill="currentColor" />
          <path d="M7 8h10M12 8v8M9 20l3-4 3 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 max-w-[calc(100vw-3rem)] max-h-[calc(100vh-8rem)] overflow-y-auto bg-white rounded-lg shadow-xl border border-sand p-5"
          role="dialog"
          aria-modal="false"
          aria-label="Accessibility settings"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-medium text-deep-blue">Accessibility</h2>
            <button
              onClick={() => setOpen(false)}
              className="tap-target p-2 text-warm-gray-400 hover:text-warm-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-ocean rounded-md"
              aria-label="Close accessibility panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-5">
            {/* Read Aloud */}
            <div>
              <p className="text-sm font-medium text-warm-gray-800 mb-2">Read Aloud</p>
              <button
                onClick={handleReadAloud}
                className={`tap-target w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean ${
                  isReading
                    ? 'bg-error/10 text-error border border-error/30'
                    : 'bg-ocean/10 text-ocean border border-ocean/30 hover:bg-ocean/20'
                }`}
                aria-label={isReading ? 'Stop reading' : 'Read page content aloud'}
              >
                {isReading ? (
                  <>
                    <VolumeX className="w-5 h-5" />
                    Stop Reading
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5" />
                    Read This Page
                  </>
                )}
              </button>
              <p className="text-xs text-warm-gray-400 mt-1">
                Uses your browser&apos;s built-in speech engine.
              </p>
            </div>

            {/* Font size */}
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

            {/* Colorblind mode */}
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

            {/* High contrast */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-warm-gray-800">High Contrast</span>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="w-5 h-5 rounded border-sand-dark text-ocean focus:ring-ocean"
              />
            </label>

            {/* Reduced motion */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-warm-gray-800">Reduce Motion</span>
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
                className="w-5 h-5 rounded border-sand-dark text-ocean focus:ring-ocean"
              />
            </label>

            {/* Underline links */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-warm-gray-800">Underline All Links</span>
              <input
                type="checkbox"
                checked={underlineLinks}
                onChange={(e) => setUnderlineLinks(e.target.checked)}
                className="w-5 h-5 rounded border-sand-dark text-ocean focus:ring-ocean"
              />
            </label>

            {/* Reset */}
            <button
              onClick={resetAll}
              className="w-full text-center text-sm font-medium text-ocean hover:text-ocean-dark transition-colors py-2 border-t border-sand mt-2 pt-4"
            >
              Reset to defaults
            </button>
          </div>
        </div>
      )}
    </>
  );
}

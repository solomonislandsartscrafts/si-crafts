'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import {
  getStoredThemePreference,
  resolveTheme,
  setStoredThemePreference,
  THEME_CHANGE_EVENT,
} from '@/lib/theme';

/**
 * Single-icon light/dark toggle.
 *
 * Shows a Sun by default (light) and a Moon when dark is active. Clicking flips
 * to the OPPOSITE of the currently resolved theme and stores it as an explicit
 * 'light'/'dark' preference (so it overrides 'system' from then on). Writing the
 * preference dispatches THEME_CHANGE_EVENT so LayoutShell re-resolves and flips
 * `.dp-dark` on the public wrapper immediately — no reload.
 *
 * Renders a stable placeholder icon until mounted so it does not flicker or
 * mismatch during hydration (the resolved theme is only known client-side).
 */
export function ThemeToggleButton({ className = '' }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const sync = () => setIsDark(resolveTheme(getStoredThemePreference()) === 'dark');
    sync();
    setMounted(true);
    // Keep in sync if another control (the mobile-nav copy, another tab) or the
    // OS ('system') changes the resolved theme.
    window.addEventListener(THEME_CHANGE_EVENT, sync);
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', sync);
    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, sync);
      media.removeEventListener('change', sync);
    };
  }, []);

  function toggle() {
    const next = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    setStoredThemePreference(next);
    // Same-tab consumers listen for this; storage events only fire cross-tab.
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  // Before mount show the light (Sun) icon — the site's default surface — so the
  // control is never blank and does not assert a state that might differ from
  // what the user has stored.
  const showDark = mounted && isDark;
  const label = showDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      aria-pressed={showDark}
      className={`tap-target flex items-center justify-center rounded-md text-warm-gray-600 transition-colors hover:bg-sand-light hover:text-deep-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean ${className}`.trim()}
    >
      {showDark ? (
        <Moon className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Sun className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}

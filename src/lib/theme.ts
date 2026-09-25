/**
 * Theme preference — the single source of truth for the site's light/dark mode.
 *
 * Three preferences, matching the toggle:
 *   'system' (default) — follow the OS. This is the "auto dark at night wherever
 *                        you are" behaviour: the OS flips to dark at sunset per
 *                        the device's location, and we follow it.
 *   'light'            — force light, ignore the OS.
 *   'dark'             — force dark, ignore the OS.
 *
 * The preference is persisted in localStorage so it survives reloads and applies
 * across every public page. The `.dp-dark` class (see globals.css) is what
 * actually turns the palette on; LayoutShell adds/removes it on the public
 * wrapper based on the RESOLVED theme, and a blocking script in layout.tsx does
 * the same before first paint to avoid a flash.
 */

export type ThemePreference = 'light' | 'dark' | 'system';

export const THEME_STORAGE_KEY = 'si-theme';

/**
 * Fired on `window` after the preference changes, so every consumer in the same
 * tab (LayoutShell, the toggle itself) re-resolves immediately. `storage` events
 * only fire in OTHER tabs, so this covers the current tab.
 */
export const THEME_CHANGE_EVENT = 'si-theme-change';

/** Read the stored preference. Defaults to 'system' when unset or invalid. */
export function getStoredThemePreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  try {
    const v = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch {
    // localStorage can throw in private mode / when blocked — treat as unset.
  }
  return 'system';
}

/** Persist the preference. */
export function setStoredThemePreference(pref: ThemePreference): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch {
    // Non-fatal: the in-memory state still updates the current page.
  }
}

/** Does the OS currently ask for dark? */
export function osPrefersDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** Resolve a preference to the actual theme to render. */
export function resolveTheme(pref: ThemePreference): 'light' | 'dark' {
  if (pref === 'system') return osPrefersDark() ? 'dark' : 'light';
  return pref;
}

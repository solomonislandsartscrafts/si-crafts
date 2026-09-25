/**
 * Theme preference — the single source of truth for the site's light/dark mode.
 *
 * Two preferences, matching the toggle:
 *   'light' (default) — the site's default surface. This is what a first-time
 *                       visitor always gets, regardless of their OS setting.
 *   'dark'            — force dark. Only ever set by the user tapping the toggle.
 *
 * There is deliberately NO 'system'/auto option: the site does not follow the
 * OS `prefers-color-scheme`. It opens light for everyone and only goes dark when
 * the user explicitly chooses it. Once chosen, the choice persists.
 *
 * The preference is persisted in localStorage so it survives reloads and applies
 * across every public page. The `.dp-dark` class (see globals.css) is what
 * actually turns the palette on; LayoutShell adds/removes it on the public
 * wrapper based on the RESOLVED theme, and a blocking script in layout.tsx does
 * the same before first paint to avoid a flash.
 */

export type ThemePreference = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'si-theme';

/**
 * Fired on `window` after the preference changes, so every consumer in the same
 * tab (LayoutShell, the toggle itself) re-resolves immediately. `storage` events
 * only fire in OTHER tabs, so this covers the current tab.
 */
export const THEME_CHANGE_EVENT = 'si-theme-change';

/** Read the stored preference. Defaults to 'light' when unset or invalid. */
export function getStoredThemePreference(): ThemePreference {
  if (typeof window === 'undefined') return 'light';
  try {
    const v = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (v === 'light' || v === 'dark') return v;
  } catch {
    // localStorage can throw in private mode / when blocked — treat as unset.
  }
  return 'light';
}

/** Persist the preference. */
export function setStoredThemePreference(pref: ThemePreference): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch {
    // Non-fatal: the in-memory state still updates the current page.
  }
}

/**
 * Resolve a preference to the actual theme to render. With the OS-following
 * 'system' option removed, the preference IS the theme — this is now an
 * identity function, kept so call sites read intentionally and so a future
 * option could reintroduce resolution in one place.
 */
export function resolveTheme(pref: ThemePreference): 'light' | 'dark' {
  return pref;
}

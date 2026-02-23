export const LOCALE_STORAGE_KEY = 'amane-locale';
export const defaultLocale = 'fr' as const;
export type Locale = 'fr' | 'en';
export const locales: Locale[] = ['fr', 'en'];

export function getLocaleFromStorage(): Locale {
  if (typeof window === 'undefined') return defaultLocale;
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored === 'fr' || stored === 'en') return stored;
  return defaultLocale;
}

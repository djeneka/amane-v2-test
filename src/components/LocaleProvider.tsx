'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getLocaleFromStorage, LOCALE_STORAGE_KEY, type Locale } from '@/i18n/config';
import fr from '../../messages/fr.json';
import en from '../../messages/en.json';

const messagesMap: Record<Locale, typeof fr> = { fr, en };

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fr');

  useEffect(() => {
    setLocaleState(getLocaleFromStorage());
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale;
    }
  }, []);

  const messages = messagesMap[locale];

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider key={locale} locale={locale} messages={messages} timeZone="Africa/Abidjan">
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}

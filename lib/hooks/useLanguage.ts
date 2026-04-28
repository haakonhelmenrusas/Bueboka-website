'use client';

import { useEffect, useState } from 'react';
import type { Locale } from '@/lib/i18n/types';

const STORAGE_KEY = 'bueboka_language';
const DEFAULT: Locale = 'no';

export function useLanguage() {
  const [locale, setLocale] = useState<Locale>(DEFAULT);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored === 'no' || stored === 'en') setLocale(stored);
    setIsLoaded(true);
  }, []);

  const setLanguage = (next: Locale) => {
    localStorage.setItem(STORAGE_KEY, next);
    setLocale(next);
    document.documentElement.lang = next === 'en' ? 'en' : 'no-nb';
  };

  return { locale, setLanguage, isLoaded };
}

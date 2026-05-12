'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { getTranslations } from '@/lib/i18n';
import type { Locale, TranslationKeys } from '@/lib/i18n/types';

interface LanguageContextType {
  locale: Locale;
  setLanguage: (locale: Locale) => void;
  t: TranslationKeys;
  isLoaded: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { locale, setLanguage, isLoaded } = useLanguage();

  return (
    <LanguageContext.Provider value={{ locale, setLanguage, t: getTranslations(locale), isLoaded }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useTranslation must be used within a LanguageProvider');
  return ctx;
}

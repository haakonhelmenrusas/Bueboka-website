import type { Locale, TranslationKeys } from './types';
import { no } from './translations/no';
import { en } from './translations/en';

const translations: Record<Locale, TranslationKeys> = { no, en };

export function getTranslations(locale: Locale): TranslationKeys {
  return translations[locale];
}

export type { Locale, TranslationKeys };

'use client';

import { useTranslation } from '@/context/LanguageProvider';
import styles from './LanguageSwitcher.module.css';

export function LanguageSwitcher() {
  const { locale, setLanguage, t } = useTranslation();
  const isNorwegian = locale === 'no';

  return (
    <button
      className={styles.switcher}
      onClick={() => setLanguage(isNorwegian ? 'en' : 'no')}
      aria-label={t['lang.switchTo']}
      title={isNorwegian ? t['lang.english'] : t['lang.norwegian']}
    >
      {isNorwegian ? 'EN' : 'NO'}
    </button>
  );
}

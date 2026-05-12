'use client';

import { useCallback, useRef, useState } from 'react';
import { LuChevronDown, LuLanguages } from 'react-icons/lu';
import { useTranslation } from '@/context/LanguageProvider';
import { useClickOutside, useEscapeKey } from '@/lib/hooks';
import styles from './LanguageSwitcher.module.css';

const LANGUAGES = [
  { code: 'no', flag: '🇳🇴', label: 'Norsk' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
] as const;

interface Props {
  variant?: 'dark' | 'light';
}

export function LanguageSwitcher({ variant = 'dark' }: Props) {
  const { locale, setLanguage, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close, open);
  useEscapeKey(close, open);

  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  return (
    <div ref={ref} className={`${styles.wrapper} ${variant === 'light' ? styles.wrapperLight : ''}`}>
      <button
        className={variant === 'light' ? styles.triggerLight : styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t['lang.switchTo']}
      >
        {variant === 'light' ? (
          <>
            <LuLanguages size={16} />
            <span className={styles.currentLabel}>{current.flag} {current.label}</span>
            <LuChevronDown size={14} className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} />
          </>
        ) : (
          <>
            <span className={styles.flag}>{current.flag}</span>
            <span className={styles.code}>{current.code.toUpperCase()}</span>
            <LuChevronDown size={12} className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} />
          </>
        )}
      </button>

      {open && (
        <ul
          className={`${styles.dropdown} ${variant === 'light' ? styles.dropdownLight : ''}`}
          role="listbox"
          aria-label={t['lang.switchTo']}
        >
          {LANGUAGES.map((lang) => (
            <li key={lang.code} role="option" aria-selected={locale === lang.code}>
              <button
                className={`${styles.option} ${locale === lang.code ? styles.optionActive : ''}`}
                onClick={() => {
                  setLanguage(lang.code);
                  setOpen(false);
                }}
              >
                <span className={styles.flag}>{lang.flag}</span>
                <span className={styles.optionLabel}>{lang.label}</span>
                {locale === lang.code && <span className={styles.check}>✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

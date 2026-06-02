'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from '@/context/SessionProvider';
import type { Locale } from '@/lib/i18n/types';

const STORAGE_KEY = 'bueboka_language';
const DEFAULT: Locale = 'no';

function isLocale(value: unknown): value is Locale {
  return value === 'no' || value === 'en';
}

function applyDocumentLang(next: Locale) {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = next === 'en' ? 'en' : 'no-nb';
  }
}

async function persistLocaleToServer(next: Locale) {
  try {
    await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: next }),
    });
  } catch {
    // Network failures are non-fatal: localStorage remains authoritative
    // for the current device until the next successful sync.
  }
}

export function useLanguage() {
  const [locale, setLocale] = useState<Locale>(DEFAULT);
  const [isLoaded, setIsLoaded] = useState(false);
  const { data: session, isPending: sessionPending } = useSession();
  const syncedForUserRef = useRef<string | null>(null);

  // Read localStorage on mount for an instant render before the session resolves.
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) {
      setLocale(stored);
      applyDocumentLang(stored);
    } else {
      applyDocumentLang(DEFAULT);
    }
    setIsLoaded(true);
  }, []);

  // Once the session resolves, reconcile with the server. DB wins when set;
  // otherwise we backfill from localStorage so existing users keep their choice.
  useEffect(() => {
    if (sessionPending) return;
    const userId = session?.user?.id ?? null;
    if (!userId) return;
    if (syncedForUserRef.current === userId) return;
    syncedForUserRef.current = userId;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) return;
        const { profile } = await res.json();
        if (cancelled) return;

        const serverLocale = isLocale(profile?.locale) ? (profile.locale as Locale) : null;
        const stored = localStorage.getItem(STORAGE_KEY);
        const localLocale = isLocale(stored) ? stored : null;

        if (serverLocale) {
          if (serverLocale !== localLocale) {
            localStorage.setItem(STORAGE_KEY, serverLocale);
            setLocale(serverLocale);
            applyDocumentLang(serverLocale);
          }
        } else if (localLocale) {
          void persistLocaleToServer(localLocale);
        }
      } catch {
        // Ignore — localStorage remains the source of truth until next sync.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, sessionPending]);

  const setLanguage = (next: Locale) => {
    localStorage.setItem(STORAGE_KEY, next);
    setLocale(next);
    applyDocumentLang(next);
    if (session?.user?.id) {
      void persistLocaleToServer(next);
    }
  };

  return { locale, setLanguage, isLoaded };
}

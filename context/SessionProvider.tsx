'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSession as useBetterAuthSession } from '@/lib/auth-client';

type SessionData = ReturnType<typeof useBetterAuthSession>;

const SessionContext = createContext<SessionData | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const session = useBetterAuthSession();

  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionData {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}

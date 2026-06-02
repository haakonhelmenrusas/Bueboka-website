import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { SessionProvider } from '@/context/SessionProvider';
import { LanguageProvider } from '@/context/LanguageProvider';

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </SessionProvider>
  );
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

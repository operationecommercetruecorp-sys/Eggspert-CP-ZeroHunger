'use client';

import { SessionProvider } from 'next-auth/react';
import { LanguageProvider } from '@/lib/i18n/LanguageProvider';

export function PublicProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </SessionProvider>
  );
}

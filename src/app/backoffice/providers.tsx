'use client';

import { SessionProvider } from 'next-auth/react';

export function BackofficeProviders({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import th from '../../../messages/th.json';
import en from '../../../messages/en.json';

export type Lang = 'th' | 'en';
export type Messages = typeof th;

const DICTS: Record<Lang, Messages> = { th, en };

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Messages;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('th');
  const value = useMemo(() => ({ lang, setLang, t: DICTS[lang] }), [lang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

/** Replaces {token} placeholders — used for the few strings with embedded live numbers. */
export function formatTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
}

'use client';

import { useLanguage } from '@/lib/i18n/LanguageProvider';

export function Header() {
  const { lang, setLang, t } = useLanguage();

  const navLinks = [
    { href: '#top', label: t.navHome },
    { href: '#knowledge', label: t.navKnow },
    { href: '#project', label: t.navProject },
    { href: '#schools', label: t.navSchools },
    { href: '#news', label: t.navNews },
  ];

  return (
    <div className="flex h-[74px] items-center justify-between gap-8 bg-primary px-10 text-white">
      <div className="flex items-center gap-3.5">
        <div className="h-[42px] w-[34px] flex-none rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-eggshell" />
        <div className="leading-tight">
          <div className="text-[16px] font-bold">{t.brand}</div>
          <div className="text-[11px] opacity-75">{t.brandSub}</div>
        </div>
      </div>
      <nav className="hidden gap-6 text-sm font-medium md:flex">
        {navLinks.map((n) => (
          <a
            key={n.href}
            href={n.href}
            className="border-b-2 border-transparent pb-[3px] text-white/[.82] no-underline first:border-gold first:text-white"
          >
            {n.label}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-3.5">
        <div className="flex overflow-hidden rounded-pill border border-white/40 text-xs font-semibold">
          <button
            onClick={() => setLang('th')}
            className="px-3 py-[5px]"
            style={{ background: lang === 'th' ? '#fff' : 'transparent', color: lang === 'th' ? '#14663C' : '#fff' }}
          >
            TH
          </button>
          <button
            onClick={() => setLang('en')}
            className="px-3 py-[5px]"
            style={{ background: lang === 'en' ? '#fff' : 'transparent', color: lang === 'en' ? '#14663C' : '#fff' }}
          >
            EN
          </button>
        </div>
        <a href="/backoffice/login" className="text-[13px] font-medium text-white opacity-80 no-underline">
          {t.staffLogin}
        </a>
      </div>
    </div>
  );
}

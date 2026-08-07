'use client';

import { useLanguage } from '@/lib/i18n/LanguageProvider';

export function Footer() {
  const { t } = useLanguage();

  return (
    <div id="news" className="flex justify-between gap-10 bg-primary px-10 py-11 text-white" style={{ scrollMarginTop: 90 }}>
      <div className="max-w-[320px]">
        <div className="text-[16px] font-bold">{t.brand}</div>
        <p className="mt-2 text-[13px] leading-[1.7] opacity-75">{t.footAddr}</p>
      </div>
      <div className="flex gap-16 text-[13px] leading-[2.1] opacity-85">
        <div>
          <div className="mb-1 font-bold opacity-100">{t.navKnow}</div>
          <div>{t.footNutrition}</div>
          <div>{t.footRaise}</div>
          <div>{t.footRecipes}</div>
        </div>
        <div>
          <div className="mb-1 font-bold opacity-100">{t.navProject}</div>
          <div>{t.footAbout}</div>
          <div>{t.apply}</div>
          <div>{t.footDownloads}</div>
        </div>
      </div>
    </div>
  );
}

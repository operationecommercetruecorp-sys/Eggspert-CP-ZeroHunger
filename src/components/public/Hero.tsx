'use client';

import { useLanguage } from '@/lib/i18n/LanguageProvider';

export function Hero({ onOpenChat }: { onOpenChat: () => void }) {
  const { t } = useLanguage();

  return (
    <div
      id="top"
      className="relative overflow-hidden bg-eggshell px-10 pb-14 pt-16 text-center"
      style={{ scrollMarginTop: 90 }}
    >
      <div className="relative mx-auto max-w-[820px]">
        <div className="text-[12px] font-bold uppercase tracking-[.14em] text-success">{t.kicker}</div>
        <h1 className="my-3.5 text-balance text-[46px] font-extrabold leading-tight text-ink">{t.heroTitle}</h1>
        <p className="mx-auto mb-[30px] max-w-[620px] text-base leading-relaxed text-ink-muted">{t.heroSub}</p>
        <button
          onClick={onOpenChat}
          className="flex w-full items-center gap-3.5 rounded-pill border border-border bg-white py-2 pl-[22px] pr-2 shadow-card-lg"
        >
          <div className="h-8 w-[26px] flex-none rounded-[50%/60%_60%_40%_40%] border-[1.5px] border-gold bg-eggshell" />
          <span className="flex-1 text-left text-base text-ink-faint">ask the Eggspert</span>
          <span className="rounded-[5px] border border-border px-1.5 py-0.5 text-[11px] text-ink-faint">AI</span>
          <span className="rounded-pill bg-primary px-6 py-[11px] text-sm font-bold text-white">{t.ask}</span>
        </button>
        <div className="mt-4 flex flex-wrap justify-center gap-2.5">
          {t.chips.map((c) => (
            <span key={c} className="rounded-pill border border-border bg-white px-3.5 py-1.5 text-[13px] text-ink-body">
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

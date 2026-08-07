'use client';

import { useLanguage } from '@/lib/i18n/LanguageProvider';

export function ProjectSection({
  projOpen,
  onToggleProj,
  onOpenForm,
}: {
  projOpen: boolean;
  onToggleProj: () => void;
  onOpenForm: () => void;
}) {
  const { t } = useLanguage();

  return (
    <div id="project" className="bg-white px-10 py-[60px]" style={{ scrollMarginTop: 90 }}>
      <div className="mx-auto grid max-w-[1200px] grid-cols-[1.05fr_.95fr] items-center gap-[52px]">
        <div>
          <h2 className="mb-4 text-balance text-[32px] font-extrabold leading-tight text-ink">{t.projTitle}</h2>
          <p className="text-balance text-base leading-[1.75] text-ink-body">{t.projSummary}</p>
          {projOpen && (
            <div className="mt-[18px] border-t border-border-soft pt-[18px]">
              <p className="mb-3.5 text-[15px] leading-[1.75] text-ink-body">{t.projFull1}</p>
              <p className="text-[15px] leading-[1.75] text-ink-body">{t.projFull2}</p>
            </div>
          )}
          <div className="mt-[26px] flex gap-3">
            <a
              href="https://www.cp-foundationforrural.org/project-p01/"
              target="_blank"
              rel="noreferrer"
              onClick={onToggleProj}
              className="rounded-btn border-[1.5px] border-primary px-6 py-[13px] text-[15px] font-bold text-primary no-underline"
            >
              {t.seeMore}
            </a>
            <button
              onClick={onOpenForm}
              className="rounded-btn bg-primary px-[26px] py-[13px] text-[15px] font-bold text-white shadow-card-lg"
            >
              {t.apply}
            </button>
          </div>
        </div>
        <div className="aspect-[4/3] overflow-hidden rounded-card border border-border">
          <div
            className="h-full w-full"
            style={{ background: 'repeating-linear-gradient(135deg,#F7F1E3 0 12px,#EFE6D2 12px 24px)' }}
          />
        </div>
      </div>
    </div>
  );
}

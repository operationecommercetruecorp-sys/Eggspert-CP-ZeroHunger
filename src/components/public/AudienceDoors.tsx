'use client';

import { useLanguage } from '@/lib/i18n/LanguageProvider';

// The prototype used uploaded character illustrations here (design-tool asset refs we don't
// have access to). Using a placeholder swatch in the same style as the backoffice's photo/doc
// placeholders until real artwork is supplied, rather than fabricating stock imagery.
function DoorArt() {
  return (
    <div
      className="h-[140px] w-[140px] flex-none rounded-card-sm border border-border"
      style={{ background: 'repeating-linear-gradient(135deg,#F7F1E3 0 10px,#EFE6D2 10px 20px)' }}
    />
  );
}

export function AudienceDoors() {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-2 border-b border-border-soft bg-white">
      <div className="flex items-center gap-5 border-r border-border-soft p-10">
        <DoorArt />
        <div>
          <div className="text-[19px] font-bold text-ink">{t.doorTeachTitle}</div>
          <p className="my-1.5 max-w-[372px] text-sm leading-relaxed text-ink-muted">{t.doorTeachSub}</p>
          <span className="text-sm font-bold text-primary">{t.doorTeachCta} →</span>
        </div>
      </div>
      <div className="flex items-center gap-5 p-10">
        <DoorArt />
        <div>
          <div className="text-[19px] font-bold text-ink">{t.doorStudTitle}</div>
          <p className="my-1.5 max-w-[372px] text-sm leading-relaxed text-ink-muted">{t.doorStudSub}</p>
          <span className="text-sm font-bold text-primary">{t.doorStudCta} →</span>
        </div>
      </div>
    </div>
  );
}

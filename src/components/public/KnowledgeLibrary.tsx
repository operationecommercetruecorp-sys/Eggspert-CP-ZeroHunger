'use client';

import { useLanguage } from '@/lib/i18n/LanguageProvider';

export interface ArticleData {
  id: string;
  tag: string;
  title: string;
  body: string;
}

export function KnowledgeLibrary({ articles }: { articles: ArticleData[] }) {
  const { t } = useLanguage();

  return (
    <div id="knowledge" className="bg-eggshell px-10 pb-[70px] pt-[60px]" style={{ scrollMarginTop: 90 }}>
      <div className="mx-auto max-w-[1140px]">
        <div className="mb-[26px] flex items-end justify-between">
          <div>
            <h2 className="text-[30px] font-extrabold text-ink">{t.knowTitle}</h2>
            <p className="mt-2 text-sm text-ink-muted">{t.knowSub}</p>
          </div>
          <span className="text-sm font-bold text-primary">{t.seeAll} →</span>
        </div>
        <div className="grid grid-cols-3 gap-[18px]">
          {articles.length === 0 && <p className="text-sm text-ink-faint">{t.noArticlesYet}</p>}
          {articles.map((k) => (
            <div key={k.id} className="overflow-hidden rounded-card border border-border bg-white">
              <div className="px-5 pb-[22px] pt-[18px]">
                <div className="text-[11px] font-bold uppercase tracking-[.1em] text-success">{k.tag}</div>
                <div className="my-1.5 text-balance text-[17px] font-bold text-ink">{k.title}</div>
                <p className="text-[13px] leading-relaxed text-ink-muted">{k.body.slice(0, 140)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

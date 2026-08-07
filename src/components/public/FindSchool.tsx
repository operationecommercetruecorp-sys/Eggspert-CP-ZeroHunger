'use client';

import { useState } from 'react';
import { useLanguage, formatTemplate } from '@/lib/i18n/LanguageProvider';

export interface SchoolCardData {
  id: string;
  name: string;
  location: string;
  joinedYearAD: number;
  todayEggs: number;
}

export function FindSchool({ schools, onView }: { schools: SchoolCardData[]; onView: (id: string) => void }) {
  const { t, lang } = useLanguage();
  const [query, setQuery] = useState('');

  const filtered = schools.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div id="schools" className="bg-white px-10 py-[60px]" style={{ scrollMarginTop: 90 }}>
      <div className="mx-auto max-w-[1000px]">
        <h2 className="mb-1.5 text-center text-[30px] font-extrabold text-ink">{t.findTitle}</h2>
        <p className="mb-[26px] text-center text-sm text-ink-muted">{t.findSub}</p>
        <div className="mb-5 flex gap-3">
          <div className="flex flex-1 items-center gap-3 rounded-[10px] border border-border bg-[#FDFCF8] px-[18px] py-3.5">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.findQuery}
              className="w-full bg-transparent text-[15px] text-ink-body outline-none placeholder:text-ink-fainter"
            />
          </div>
          <span className="rounded-[10px] bg-primary px-7 py-3.5 text-[15px] font-bold text-white">{t.search}</span>
        </div>
        <div className="grid gap-2.5">
          {filtered.length === 0 && <p className="text-sm text-ink-faint">{t.noSchoolsYet}</p>}
          {filtered.map((s) => (
            <div key={s.id} className="flex items-center gap-5 rounded-card-sm border border-border-soft bg-white p-4">
              <div
                className="h-16 w-16 flex-none rounded-[10px] border border-border"
                style={{ background: 'repeating-linear-gradient(135deg,#F7F1E3 0 8px,#EFE6D2 8px 16px)' }}
              />
              <div className="flex-1">
                <div className="text-base font-bold text-ink">{s.name}</div>
                <div className="mt-[3px] text-[13px] text-ink-muted">
                  {s.location} ·{' '}
                  {formatTemplate(t.joinedYearTemplate, { year: lang === 'th' ? s.joinedYearAD + 543 : s.joinedYearAD })}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-ink-faint">{t.eggsPerDay}</div>
                <div className="text-lg font-extrabold text-primary">{s.todayEggs}</div>
              </div>
              <button
                onClick={() => onView(s.id)}
                className="rounded-btn border-[1.5px] border-primary px-[18px] py-2.5 text-[13px] font-bold text-primary"
              >
                {t.viewSchool}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

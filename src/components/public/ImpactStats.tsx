'use client';

import { useLanguage, formatTemplate } from '@/lib/i18n/LanguageProvider';

export interface ProjectResultData {
  updateDate: string;
  provinces: number;
  countries: number;
  schoolCount: number;
  studentCount: number;
  staffCount: number;
  communityCount: number;
  eggsPerCycle: string;
}

export function ImpactStats({ result }: { result: ProjectResultData | null }) {
  const { t, lang } = useLanguage();

  if (!result) return null;

  const gregorianYear = new Date(result.updateDate).getFullYear();
  const year = lang === 'th' ? gregorianYear + 543 : gregorianYear;
  const cycleYear = gregorianYear - 1989 + 1;
  const fmt = (n: number) => n.toLocaleString();

  const stats = [
    { v: fmt(result.studentCount), k: t.statStudents },
    { v: fmt(result.staffCount), k: t.statStaff },
    { v: fmt(result.communityCount), k: t.statCommunities },
    { v: result.eggsPerCycle, k: t.statEggs },
  ];

  return (
    <div className="bg-eggshell px-10 py-16">
      <div className="mb-[38px] text-center">
        <h2 className="text-[30px] font-extrabold text-ink">{t.impactTitle}</h2>
        <p className="mt-2 text-sm text-ink-muted">{formatTemplate(t.impactSubTemplate, { year, cycleYear })}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-14">
        <div className="relative h-[400px] w-[400px] flex-none">
          <div className="absolute inset-0 rounded-full border-[14px] border-primary bg-white shadow-card-lg" />
          <div className="absolute inset-3.5 rounded-full border border-dashed border-[#cfe0d4]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-14 text-center">
            <div className="text-[11px] font-bold uppercase tracking-[.12em] text-success">
              {formatTemplate(t.yearLabelTemplate, { year })}
            </div>
            <div className="my-0.5 text-[56px] font-extrabold leading-none text-primary">
              {result.schoolCount.toLocaleString()}
            </div>
            <div className="text-[15px] font-semibold text-ink">
              {formatTemplate(t.schoolsWordTemplate, { provinces: result.provinces })}
            </div>
            <div className="my-3.5 h-px w-11 bg-border" />
            <div className="text-[13px] leading-relaxed text-ink-body">
              {formatTemplate(t.circleBodyTemplate, {
                students: fmt(result.studentCount),
                staff: fmt(result.staffCount),
                communities: fmt(result.communityCount),
              })}
            </div>
          </div>
        </div>
        <div className="grid w-[420px] grid-cols-2 gap-4">
          {stats.map((s) => (
            <div key={s.k} className="rounded-card-sm border border-border bg-white p-5">
              <div className="text-2xl font-extrabold text-primary">{s.v}</div>
              <div className="mt-1 text-[13px] text-ink-muted">{s.k}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

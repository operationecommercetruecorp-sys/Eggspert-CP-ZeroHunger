'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

interface SchoolDetail {
  id: string;
  name: string;
  location: string;
  joinedYearAD: number;
  production: { day: string; count: number }[];
}

interface Insights {
  temp: number | null;
  humidity: number | null;
  water: number | null;
  feed: number | null;
}

export function SchoolModal({ schoolId, onClose }: { schoolId: string; onClose: () => void }) {
  const { t, lang } = useLanguage();
  const { data: session } = useSession();
  const [detail, setDetail] = useState<SchoolDetail | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const isLoggedInHere = session?.user?.kind === 'school' && session.user.schoolId === schoolId;

  useEffect(() => {
    fetch(`/api/public/schools/${schoolId}`)
      .then((r) => r.json())
      .then(setDetail);
  }, [schoolId]);

  useEffect(() => {
    if (!isLoggedInHere) {
      setInsights(null);
      return;
    }
    fetch(`/api/public/schools/${schoolId}/insights`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setInsights);
  }, [isLoggedInHere, schoolId]);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError(null);
    const res = await signIn('school-credentials', { redirect: false, code, password });
    setLoggingIn(false);
    if (res?.error) {
      setLoginError(t.loginError);
      return;
    }
  }

  const maxCount = Math.max(1, ...(detail?.production.map((p) => p.count) ?? [1]));

  return (
    <div className="fixed inset-0 z-30 flex justify-center overflow-y-auto bg-[#1C1A17]/55 py-12" onClick={onClose}>
      <div
        className="h-fit w-[920px] max-w-[94vw] overflow-hidden rounded-[18px] bg-white shadow-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between bg-primary px-[34px] py-[26px] text-white">
          <div>
            <div className="text-xs uppercase tracking-[.1em] opacity-75">{t.schoolLabel}</div>
            <div className="mt-1 text-2xl font-extrabold">{detail?.name ?? '…'}</div>
            {detail && (
              <div className="mt-1 text-[13px] opacity-80">
                {detail.location} · {lang === 'th' ? detail.joinedYearAD + 543 : detail.joinedYearAD}
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-2xl leading-none">
            ×
          </button>
        </div>

        <div
          className="h-[180px] border-b border-border"
          style={{ background: 'repeating-linear-gradient(135deg,#F7F1E3 0 12px,#EFE6D2 12px 24px)' }}
        />

        <div className="px-[34px] pb-2 pt-[30px]">
          <div className="mb-4 flex items-baseline justify-between">
            <div className="text-[17px] font-bold text-ink">{t.prodTitle}</div>
            <div className="text-xs text-ink-faint">{t.prodUnit}</div>
          </div>
          {!detail || detail.production.length === 0 ? (
            <p className="pb-4 text-sm text-ink-faint">{t.noProdYet}</p>
          ) : (
            <div className="flex h-[150px] items-end gap-3.5 border-b border-border-soft px-1">
              {detail.production.map((d, i) => (
                <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <div className="text-[11px] font-bold text-primary">{d.count}</div>
                  <div className="w-full rounded-t-md bg-primary" style={{ height: `${(d.count / maxCount) * 120}px` }} />
                  <div className="text-[11px] text-ink-faint">{d.day}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isLoggedInHere ? (
          <div className="px-[34px] pb-9 pt-[30px]">
            <div className="mb-3.5 text-[17px] font-bold text-ink">{t.insightTitle}</div>
            {!insights ? (
              <p className="text-sm text-ink-faint">…</p>
            ) : insights.temp === null ? (
              <p className="text-sm text-ink-faint">{t.noIotYet}</p>
            ) : (
              <div className="grid grid-cols-3 gap-3.5">
                {[
                  { k: t.insightTemp, v: `${insights.temp}°C` },
                  { k: t.insightHumidity, v: `${insights.humidity}%` },
                  { k: t.insightWater, v: `${insights.water} L` },
                  { k: t.insightFeed, v: `${insights.feed} kg` },
                ].map((ins) => (
                  <div key={ins.k} className="rounded-card-sm border border-border-soft bg-[#FDFCF8] px-[18px] py-4">
                    <div className="text-xs text-ink-faint">{ins.k}</div>
                    <div className="mt-1 text-xl font-extrabold text-primary">{ins.v}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="px-[34px] pb-9 pt-7">
            <div className="grid grid-cols-2 items-center gap-7 rounded-card border border-border bg-eggshell p-[26px]">
              <div>
                <div className="text-base font-bold text-ink">{t.loginGateTitle}</div>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{t.loginGateSub}</p>
              </div>
              <form onSubmit={onLogin} className="grid gap-2.5">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={t.schoolCodePh}
                  className="rounded-[9px] border border-border bg-white px-3.5 py-2.5 text-[13px] text-ink"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPh}
                  className="rounded-[9px] border border-border bg-white px-3.5 py-2.5 text-[13px] text-ink"
                />
                {loginError && <p className="text-xs text-error">{loginError}</p>}
                <button
                  type="submit"
                  disabled={loggingIn}
                  className="rounded-[9px] bg-primary py-3 text-sm font-bold text-white disabled:opacity-60"
                >
                  {loggingIn ? t.loggingIn : t.loginBtn}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

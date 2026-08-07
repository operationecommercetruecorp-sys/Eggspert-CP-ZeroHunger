'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { applicationSchema, type ApplicationInput } from '@/lib/validation';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export function ApplyModal({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationInput>({ resolver: zodResolver(applicationSchema) });

  async function onSubmit(data: ApplicationInput) {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setResult(res.ok ? 'success' : 'error');
  }

  return (
    <div className="fixed inset-0 z-20 flex items-start justify-center overflow-y-auto bg-[#1C1A17]/50 py-20" onClick={onClose}>
      <div className="w-[560px] max-w-[92vw] overflow-hidden rounded-card bg-white shadow-modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between bg-eggshell px-7 py-6">
          <div>
            <div className="text-[19px] font-extrabold text-ink">{t.formTitle}</div>
            <div className="mt-1 text-[13px] text-ink-muted">{t.formSub}</div>
          </div>
          <button onClick={onClose} className="text-xl leading-none text-ink-faint">
            ×
          </button>
        </div>

        {result === 'success' ? (
          <div className="grid gap-4 px-7 py-8 text-center">
            <p className="text-sm text-ink-body">{t.submitSuccess}</p>
            <button onClick={onClose} className="rounded-btn bg-primary py-3 text-sm font-bold text-white">
              {t.close}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 px-7 py-[26px]">
            <Field label={t.formName} error={errors.name?.message}>
              <input className={inputClass} placeholder={t.formNamePh} {...register('name')} />
            </Field>
            <Field label={t.formPhone} error={errors.phone?.message}>
              <input className={inputClass} placeholder={t.formPhonePh} {...register('phone')} />
            </Field>
            <Field label={t.formEmail} error={errors.email?.message}>
              <input className={inputClass} placeholder={t.formEmailPh} {...register('email')} />
            </Field>
            <Field label={t.formSchool} error={errors.school?.message}>
              <input className={inputClass} placeholder={t.formSchoolPh} {...register('school')} />
            </Field>
            <Field label={t.formAddress} error={errors.address?.message}>
              <input className={inputClass} placeholder={t.formAddressPh} {...register('address')} />
            </Field>
            {result === 'error' && <p className="text-sm text-error">{t.submitError}</p>}
            <div className="mt-1.5 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-[9px] border-[1.5px] border-border px-[22px] py-[13px] text-[15px] font-semibold text-ink-muted"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-[9px] bg-primary py-[13px] text-[15px] font-bold text-white disabled:opacity-60"
              >
                {isSubmitting ? t.submitting : t.submit}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const inputClass =
  'w-full rounded-[9px] border border-border bg-[#FDFCF8] px-3.5 py-3 text-sm text-ink placeholder:text-ink-fainter focus:outline-none focus:ring-2 focus:ring-primary/30';

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-[13px] font-semibold text-ink-body">{label}</div>
      {children}
      {error && <div className="mt-1 text-xs text-error">{error}</div>}
    </div>
  );
}

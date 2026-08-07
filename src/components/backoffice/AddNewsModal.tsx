'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { newsSchema, type NewsInput } from '@/lib/validation';
import { Modal, FormField, ModalActions, inputClass } from './Modal';

export function AddNewsModal({
  fixedSchoolId,
  schools,
  triggerLabel = '+ เขียนข่าว',
}: {
  fixedSchoolId?: string;
  schools?: { id: string; name: string }[];
  triggerLabel?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsInput>({ resolver: zodResolver(newsSchema), defaultValues: { schoolId: fixedSchoolId } });

  function close() {
    setOpen(false);
    reset();
  }

  async function onSubmit(data: NewsInput) {
    const res = await fetch('/api/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) return;
    close();
    router.refresh();
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-btn bg-primary px-4 py-2.5 text-[13px] font-bold text-white">
        {triggerLabel}
      </button>
      {open && (
        <Modal title={fixedSchoolId ? 'เขียนข่าวของโรงเรียน' : 'เขียนข่าว (เลือกโรงเรียน)'} onClose={close}>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3.5">
            {fixedSchoolId ? (
              <input type="hidden" value={fixedSchoolId} {...register('schoolId')} />
            ) : (
              <FormField label="โรงเรียน" error={errors.schoolId?.message}>
                <select className={inputClass} {...register('schoolId')}>
                  <option value="">เลือกโรงเรียน</option>
                  {schools?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </FormField>
            )}
            <FormField label="หัวข้อข่าว" error={errors.title?.message}>
              <input className={inputClass} {...register('title')} />
            </FormField>
            <FormField label="เนื้อหา" error={errors.body?.message}>
              <textarea className={inputClass} rows={4} {...register('body')} />
            </FormField>
            <ModalActions onCancel={close} submitting={isSubmitting} />
          </form>
        </Modal>
      )}
    </>
  );
}

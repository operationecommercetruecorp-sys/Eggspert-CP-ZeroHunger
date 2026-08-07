'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eggLogSchema, type EggLogInput } from '@/lib/validation';
import { Modal, FormField, ModalActions, inputClass } from './Modal';

export function AddEggLogModal({ schoolId }: { schoolId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EggLogInput>({
    resolver: zodResolver(eggLogSchema),
    defaultValues: { date: new Date().toISOString().slice(0, 10) },
  });

  function close() {
    setOpen(false);
    reset();
  }

  async function onSubmit(data: EggLogInput) {
    const res = await fetch(`/api/schools/${schoolId}/egg-logs`, {
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
        + บันทึกวันนี้
      </button>
      {open && (
        <Modal title="บันทึกผลผลิตไข่วันนี้" onClose={close}>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3.5">
            <FormField label="วันที่" error={errors.date?.message}>
              <input type="date" className={inputClass} {...register('date')} />
            </FormField>
            <FormField label="จำนวนไข่ (ฟอง)" error={errors.count?.message}>
              <input type="number" className={inputClass} {...register('count', { valueAsNumber: true })} />
            </FormField>
            <ModalActions onCancel={close} submitting={isSubmitting} />
          </form>
        </Modal>
      )}
    </>
  );
}

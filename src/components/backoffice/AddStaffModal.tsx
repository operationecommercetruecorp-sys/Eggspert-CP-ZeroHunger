'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createStaffSchema, type CreateStaffInput } from '@/lib/validation';
import { Modal, FormField, ModalActions, inputClass } from './Modal';

export function AddStaffModal({
  role,
  title,
  triggerLabel,
  disabled,
}: {
  role: 'admin' | 'cp';
  title: string;
  triggerLabel: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateStaffInput>({ resolver: zodResolver(createStaffSchema) });

  function close() {
    setOpen(false);
    setGeneratedPassword(null);
    reset();
    router.refresh();
  }

  async function onSubmit(data: CreateStaffInput) {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, ...data }),
    });
    if (!res.ok) return;
    const json = await res.json();
    setGeneratedPassword(json.password);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="rounded-btn bg-primary px-[18px] py-2.5 text-[13.5px] font-bold text-white disabled:bg-[#B8AF97]"
      >
        {triggerLabel}
      </button>
      {open && (
        <Modal title={title} onClose={close}>
          {generatedPassword ? (
            <div>
              <p className="text-sm text-ink-body">สร้างบัญชีสำเร็จ รหัสผ่านชั่วคราว (แสดงครั้งเดียว):</p>
              <div className="mt-2 rounded-[9px] border border-border bg-eggshell px-4 py-3 font-mono text-sm text-ink">
                {generatedPassword}
              </div>
              <button onClick={close} className="mt-4 w-full rounded-btn bg-primary py-3 text-sm font-bold text-white">
                ปิด
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3.5">
              <FormField label="อีเมล" error={errors.email?.message}>
                <input className={inputClass} {...register('email')} />
              </FormField>
              <FormField label="ชื่อ-นามสกุล (TH)" error={errors.nameTh?.message}>
                <input className={inputClass} {...register('nameTh')} />
              </FormField>
              <FormField label="Full name (EN)" error={errors.nameEn?.message}>
                <input className={inputClass} {...register('nameEn')} />
              </FormField>
              <ModalActions onCancel={close} submitting={isSubmitting} />
            </form>
          )}
        </Modal>
      )}
    </>
  );
}

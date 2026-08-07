'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { emailSchema, type EmailInput } from '@/lib/validation';
import { Modal, FormField, ModalActions, inputClass } from './Modal';

export function AddNotificationEmailModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmailInput>({ resolver: zodResolver(emailSchema) });

  function close() {
    setOpen(false);
    reset();
  }

  async function onSubmit(data: EmailInput) {
    const res = await fetch('/api/notification-emails', {
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
      <button
        onClick={() => setOpen(true)}
        className="inline-block rounded-btn border-[1.5px] border-primary px-5 py-[11px] text-[13.5px] font-bold text-primary"
      >
        + เพิ่มอีเมล
      </button>
      {open && (
        <Modal title="เพิ่มอีเมลรับแจ้งใบสมัคร" onClose={close}>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3.5">
            <FormField label="อีเมล" error={errors.email?.message}>
              <input className={inputClass} placeholder="name@cpfoundation.org" {...register('email')} />
            </FormField>
            <ModalActions onCancel={close} submitting={isSubmitting} />
          </form>
        </Modal>
      )}
    </>
  );
}

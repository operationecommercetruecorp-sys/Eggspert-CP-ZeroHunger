'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSchoolSchema, type CreateSchoolInput } from '@/lib/validation';
import { Modal, FormField, ModalActions, inputClass } from './Modal';

export function AddSchoolModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState<{ code: string; password: string } | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateSchoolInput>({ resolver: zodResolver(createSchoolSchema) });

  function close() {
    setOpen(false);
    setCreated(null);
    reset();
    router.refresh();
  }

  async function onSubmit(data: CreateSchoolInput) {
    const res = await fetch('/api/schools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) return;
    const json = await res.json();
    setCreated({ code: json.code, password: json.password });
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-btn bg-primary px-5 py-[11px] text-[13.5px] font-bold text-white">
        + เพิ่มโรงเรียน
      </button>
      {open && (
        <Modal title="เพิ่มโรงเรียนใหม่" onClose={close}>
          {created ? (
            <div>
              <p className="text-sm text-ink-body">สร้างโรงเรียนสำเร็จ รหัสเข้าสู่ระบบสำหรับโรงเรียน (แสดงครั้งเดียว):</p>
              <div className="mt-2 grid gap-2 rounded-[9px] border border-border bg-eggshell px-4 py-3 font-mono text-sm text-ink">
                <div>รหัสโรงเรียน: {created.code}</div>
                <div>รหัสผ่าน: {created.password}</div>
              </div>
              <button onClick={close} className="mt-4 w-full rounded-btn bg-primary py-3 text-sm font-bold text-white">
                ปิด
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3.5">
              <FormField label="ชื่อโรงเรียน" error={errors.name?.message}>
                <input className={inputClass} placeholder="เช่น โรงเรียนบ้านใหม่" {...register('name')} />
              </FormField>
              <FormField label="ที่ตั้ง" error={errors.location?.message}>
                <input className={inputClass} placeholder="ตำบล อำเภอ จังหวัด" {...register('location')} />
              </FormField>
              <ModalActions onCancel={close} submitting={isSubmitting} />
            </form>
          )}
        </Modal>
      )}
    </>
  );
}

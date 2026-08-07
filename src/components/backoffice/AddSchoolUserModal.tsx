'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSchoolUserSchema, type CreateSchoolUserInput } from '@/lib/validation';
import { Modal, FormField, ModalActions, inputClass } from './Modal';

export function AddSchoolUserModal({
  schools,
  fixedSchoolId,
  allowedRoles,
  triggerLabel,
}: {
  schools: { id: string; name: string }[];
  fixedSchoolId?: string;
  allowedRoles: ('teacher' | 'student')[];
  triggerLabel: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateSchoolUserInput>({
    resolver: zodResolver(createSchoolUserSchema),
    defaultValues: { role: allowedRoles[0], schoolId: fixedSchoolId ?? '' },
  });

  function close() {
    setOpen(false);
    setGeneratedPassword(null);
    reset();
    router.refresh();
  }

  async function onSubmit(data: CreateSchoolUserInput) {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) return;
    const json = await res.json();
    setGeneratedPassword(json.password);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-btn bg-primary px-[18px] py-2.5 text-[13.5px] font-bold text-white">
        {triggerLabel}
      </button>
      {open && (
        <Modal title="เพิ่มครู/นักเรียน" onClose={close}>
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
              {allowedRoles.length > 1 ? (
                <FormField label="บทบาท" error={errors.role?.message}>
                  <select className={inputClass} {...register('role')}>
                    {allowedRoles.map((r) => (
                      <option key={r} value={r}>
                        {r === 'teacher' ? 'ครู' : 'นักเรียน'}
                      </option>
                    ))}
                  </select>
                </FormField>
              ) : (
                <input type="hidden" value={allowedRoles[0]} {...register('role')} />
              )}
              {fixedSchoolId ? (
                <input type="hidden" value={fixedSchoolId} {...register('schoolId')} />
              ) : (
                <FormField label="สถานศึกษา (จำเป็น)" error={errors.schoolId?.message}>
                  <select className={inputClass} {...register('schoolId')}>
                    <option value="">เลือกโรงเรียน</option>
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </FormField>
              )}
              <FormField label="ชื่อ-นามสกุล (TH)" error={errors.nameTh?.message}>
                <input className={inputClass} {...register('nameTh')} />
              </FormField>
              <FormField label="Full name (EN)" error={errors.nameEn?.message}>
                <input className={inputClass} {...register('nameEn')} />
              </FormField>
              <FormField label="เบอร์โทรศัพท์" error={errors.phone?.message}>
                <input className={inputClass} {...register('phone')} />
              </FormField>
              <FormField label="อีเมล" error={errors.email?.message}>
                <input className={inputClass} {...register('email')} />
              </FormField>
              {allowedRoles.includes('teacher') && (
                <label className="flex items-center gap-2 text-sm text-ink-body">
                  <input type="checkbox" {...register('isMainContact')} />
                  ผู้รับผิดชอบหลักของโรงเรียน
                </label>
              )}
              <ModalActions onCancel={close} submitting={isSubmitting} />
            </form>
          )}
        </Modal>
      )}
    </>
  );
}

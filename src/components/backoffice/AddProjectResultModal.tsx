'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProjectResultSchema, type CreateProjectResultInput } from '@/lib/validation';
import { Modal, FormField, ModalActions, inputClass } from './Modal';

export function AddProjectResultModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectResultInput>({ resolver: zodResolver(createProjectResultSchema) });

  function close() {
    setOpen(false);
    reset();
  }

  async function onSubmit(data: CreateProjectResultInput) {
    const res = await fetch('/api/project-results', {
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
      <button onClick={() => setOpen(true)} className="rounded-btn bg-primary px-5 py-[11px] text-[13.5px] font-bold text-white">
        + เพิ่มข้อมูลรอบใหม่
      </button>
      {open && (
        <Modal title="เพิ่มข้อมูลผลลัพธ์โครงการรอบใหม่" onClose={close}>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3.5">
            <FormField label="วันที่อัปเดต" error={errors.updateDate?.message}>
              <input type="date" className={inputClass} {...register('updateDate')} />
            </FormField>
            <FormField label="จำนวนจังหวัด" error={errors.provinces?.message}>
              <input type="number" className={inputClass} {...register('provinces', { valueAsNumber: true })} />
            </FormField>
            <FormField label="จำนวนประเทศ" error={errors.countries?.message}>
              <input type="number" className={inputClass} {...register('countries', { valueAsNumber: true })} />
            </FormField>
            <FormField label="จำนวนโรงเรียน" error={errors.schoolCount?.message}>
              <input type="number" className={inputClass} {...register('schoolCount', { valueAsNumber: true })} />
            </FormField>
            <FormField label="จำนวนนักเรียน" error={errors.studentCount?.message}>
              <input type="number" className={inputClass} {...register('studentCount', { valueAsNumber: true })} />
            </FormField>
            <FormField label="จำนวนบุคลากรทางการศึกษา" error={errors.staffCount?.message}>
              <input type="number" className={inputClass} {...register('staffCount', { valueAsNumber: true })} />
            </FormField>
            <FormField label="จำนวนชุมชน" error={errors.communityCount?.message}>
              <input type="number" className={inputClass} {...register('communityCount', { valueAsNumber: true })} />
            </FormField>
            <FormField label="ไข่ต่อรุ่นการเลี้ยง" error={errors.eggsPerCycle?.message}>
              <input className={inputClass} placeholder="เช่น 27 ล้านฟอง" {...register('eggsPerCycle')} />
            </FormField>
            <ModalActions onCancel={close} submitting={isSubmitting} />
          </form>
        </Modal>
      )}
    </>
  );
}

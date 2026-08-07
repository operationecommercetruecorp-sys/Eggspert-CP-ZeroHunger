'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { waterFeedLogSchema, type WaterFeedLogInput } from '@/lib/validation';
import { Modal, FormField, ModalActions, inputClass } from './Modal';

export function AddWaterFeedLogModal({ schoolId }: { schoolId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WaterFeedLogInput>({
    resolver: zodResolver(waterFeedLogSchema),
    defaultValues: { date: new Date().toISOString().slice(0, 10), type: 'water', action: 'usage' },
  });

  function close() {
    setOpen(false);
    reset();
  }

  async function onSubmit(data: WaterFeedLogInput) {
    const res = await fetch(`/api/schools/${schoolId}/water-feed-logs`, {
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
        + บันทึกรายการ
      </button>
      {open && (
        <Modal title="บันทึกรายการน้ำ/อาหารไก่" onClose={close}>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3.5">
            <FormField label="วันที่" error={errors.date?.message}>
              <input type="date" className={inputClass} {...register('date')} />
            </FormField>
            <FormField label="ประเภท" error={errors.type?.message}>
              <select className={inputClass} {...register('type')}>
                <option value="water">น้ำ</option>
                <option value="feed">อาหารไก่</option>
              </select>
            </FormField>
            <FormField label="รายการ" error={errors.action?.message}>
              <select className={inputClass} {...register('action')}>
                <option value="purchase">สั่งซื้อ</option>
                <option value="usage">ใช้งาน</option>
              </select>
            </FormField>
            <FormField label="ปริมาณ" error={errors.amount?.message}>
              <input className={inputClass} placeholder="เช่น 40 กก. / 150 ลิตร" {...register('amount')} />
            </FormField>
            <ModalActions onCancel={close} submitting={isSubmitting} />
          </form>
        </Modal>
      )}
    </>
  );
}

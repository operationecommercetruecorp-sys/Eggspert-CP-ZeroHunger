'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { iotReadingSchema, type IotReadingInput } from '@/lib/validation';
import { Modal, FormField, ModalActions, inputClass } from './Modal';

export function AddIotReadingModal({
  schoolId,
  devices,
}: {
  schoolId: string;
  devices: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IotReadingInput>({
    resolver: zodResolver(iotReadingSchema),
    defaultValues: { deviceId: devices[0]?.id ?? '' },
  });

  function close() {
    setOpen(false);
    reset();
  }

  async function onSubmit(data: IotReadingInput) {
    const res = await fetch(`/api/schools/${schoolId}/iot-readings`, {
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
        disabled={devices.length === 0}
        className="rounded-btn bg-primary px-4 py-2.5 text-[13px] font-bold text-white disabled:bg-[#B8AF97]"
      >
        + บันทึกค่าที่วัดได้
      </button>
      {open && (
        <Modal title="บันทึกค่าที่วัดได้จากโรงเรือน" onClose={close}>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3.5">
            <FormField label="อุปกรณ์" error={errors.deviceId?.message}>
              <select className={inputClass} {...register('deviceId')}>
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="อุณหภูมิ (°C)" error={errors.temp?.message}>
              <input type="number" step="0.1" className={inputClass} {...register('temp', { valueAsNumber: true })} />
            </FormField>
            <FormField label="ความชื้น (%)" error={errors.humidity?.message}>
              <input type="number" step="0.1" className={inputClass} {...register('humidity', { valueAsNumber: true })} />
            </FormField>
            <FormField label="น้ำที่ใช้วันนี้ (ลิตร)" error={errors.water?.message}>
              <input type="number" step="0.1" className={inputClass} {...register('water', { valueAsNumber: true })} />
            </FormField>
            <FormField label="อาหารที่ใช้วันนี้ (กก.)" error={errors.feed?.message}>
              <input type="number" step="0.1" className={inputClass} {...register('feed', { valueAsNumber: true })} />
            </FormField>
            <p className="text-xs text-ink-faint">*ยังไม่มีอุปกรณ์ IoT เชื่อมต่อจริง — บันทึกค่าด้วยตนเองไปก่อน</p>
            <ModalActions onCancel={close} submitting={isSubmitting} />
          </form>
        </Modal>
      )}
    </>
  );
}

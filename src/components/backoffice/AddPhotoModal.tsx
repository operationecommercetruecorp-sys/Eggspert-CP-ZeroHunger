'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, FormField, ModalActions, inputClass } from './Modal';

export function AddPhotoModal({ schoolId }: { schoolId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function close() {
    setOpen(false);
    setFile(null);
    setError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError('กรุณาแนบไฟล์ภาพ');
      return;
    }
    setSubmitting(true);
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`/api/schools/${schoolId}/photos`, { method: 'POST', body: form });
    setSubmitting(false);
    if (!res.ok) {
      setError('อัปโหลดไม่สำเร็จ');
      return;
    }
    close();
    router.refresh();
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-btn bg-primary px-4 py-2.5 text-[13px] font-bold text-white">
        + อัปโหลดภาพ
      </button>
      {open && (
        <Modal title="อัปโหลดภาพโรงเรือน" onClose={close}>
          <form onSubmit={onSubmit} className="grid gap-3.5">
            <FormField label="ภาพ" error={error ?? undefined}>
              <input
                type="file"
                accept="image/*"
                className={inputClass}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </FormField>
            <ModalActions onCancel={close} submitting={submitting} />
          </form>
        </Modal>
      )}
    </>
  );
}

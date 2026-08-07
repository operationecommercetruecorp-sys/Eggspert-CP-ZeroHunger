'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, FormField, ModalActions, inputClass } from './Modal';

export function AddSyllabusModal({ schoolId }: { schoolId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('lesson_plan');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function close() {
    setOpen(false);
    setTitle('');
    setType('lesson_plan');
    setFile(null);
    setError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('กรุณากรอกชื่อเอกสาร');
      return;
    }
    if (!file) {
      setError('กรุณาแนบไฟล์เอกสาร');
      return;
    }
    setSubmitting(true);
    const form = new FormData();
    form.append('title', title);
    form.append('type', type);
    form.append('file', file);
    const res = await fetch(`/api/schools/${schoolId}/syllabus`, { method: 'POST', body: form });
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
        + อัปโหลดเอกสาร
      </button>
      {open && (
        <Modal title="อัปโหลดแผนการสอน/การบ้าน" onClose={close}>
          <form onSubmit={onSubmit} className="grid gap-3.5">
            <FormField label="ชื่อเอกสาร">
              <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เช่น แผนการสอนสัปดาห์ที่ 5" />
            </FormField>
            <FormField label="ประเภท">
              <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
                <option value="lesson_plan">แผนการสอน</option>
                <option value="worksheet">ใบงาน</option>
                <option value="quiz">แบบทดสอบ</option>
              </select>
            </FormField>
            <FormField label="ไฟล์เอกสาร" error={error ?? undefined}>
              <input type="file" className={inputClass} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </FormField>
            <ModalActions onCancel={close} submitting={submitting} />
          </form>
        </Modal>
      )}
    </>
  );
}

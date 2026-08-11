'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export function SiteImageSlot({
  imageKey,
  label,
  hint,
  currentUrl,
}: {
  imageKey: 'teacher' | 'student' | 'project';
  label: string;
  hint: string;
  currentUrl: string | null;
}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setError(null);
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`/api/site-images/${imageKey}`, { method: 'POST', body: form });
    setUploading(false);
    if (!res.ok) {
      setError('อัปโหลดไม่สำเร็จ');
      return;
    }
    router.refresh();
  }

  async function onRemove() {
    if (!window.confirm(`ลบรูป${label}และกลับไปใช้ภาพตัวอย่างแทน?`)) return;
    setUploading(true);
    await fetch(`/api/site-images/${imageKey}`, { method: 'DELETE' });
    setUploading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4 rounded-[9px] border border-border bg-[#FDFCF8] p-3.5">
      <div
        className="h-16 w-16 flex-none overflow-hidden rounded-[9px] border border-border bg-cover bg-center"
        style={{
          background: currentUrl
            ? `url(${currentUrl}) center/cover`
            : 'repeating-linear-gradient(135deg,#F7F1E3 0 8px,#EFE6D2 8px 16px)',
        }}
      />
      <div className="flex-1">
        <div className="text-sm font-bold text-ink">{label}</div>
        <p className="text-[12px] text-ink-muted">{hint}</p>
        {error && <p className="mt-1 text-[12px] text-error">{error}</p>}
      </div>
      <div className="flex flex-none items-center gap-3">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
          className="rounded-btn border-[1.5px] border-primary px-3.5 py-2 text-[12px] font-bold text-primary disabled:opacity-60"
        >
          {uploading ? 'กำลังอัปโหลด…' : currentUrl ? 'เปลี่ยนรูป' : 'อัปโหลดรูป'}
        </button>
        {currentUrl && (
          <button
            type="button"
            onClick={onRemove}
            disabled={uploading}
            className="text-xs font-bold text-error disabled:opacity-60"
          >
            ลบ
          </button>
        )}
        <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
      </div>
    </div>
  );
}

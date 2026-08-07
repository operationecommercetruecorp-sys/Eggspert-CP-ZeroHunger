'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export function CsvImportButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    setStatus('กำลังนำเข้า...');
    const res = await fetch('/api/schools/import', { method: 'POST', body: form });
    const json = await res.json();
    if (!res.ok) {
      setStatus(json.error ?? 'นำเข้าล้มเหลว');
      return;
    }
    setStatus(`นำเข้าสำเร็จ ${json.created} รายการ`);
    if (inputRef.current) inputRef.current.value = '';
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => inputRef.current?.click()}
        className="rounded-btn border-[1.5px] border-primary px-[18px] py-[11px] text-[13.5px] font-bold text-primary"
      >
        นำเข้า CSV
      </button>
      <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={onChange} />
      {status && <span className="text-xs text-ink-muted">{status}</span>}
    </div>
  );
}

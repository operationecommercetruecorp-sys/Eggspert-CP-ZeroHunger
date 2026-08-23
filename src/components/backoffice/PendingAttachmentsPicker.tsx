'use client';

import { useRef } from 'react';

export interface PendingAttachment {
  type: 'file' | 'link';
  file?: File;
  url?: string;
}

export function PendingAttachmentsPicker({
  pending,
  onChange,
}: {
  pending: PendingAttachment[];
  onChange: (next: PendingAttachment[]) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const linkInput = useRef<HTMLInputElement>(null);

  function remove(index: number) {
    onChange(pending.filter((_, i) => i !== index));
  }

  return (
    <div className="border-t border-border-soft pt-3.5">
      <div className="mb-2 text-[13px] font-semibold text-ink-body">เอกสารแนบ</div>
      <div className="mb-3 grid gap-2">
        {pending.length === 0 && <p className="text-xs text-ink-faint">ยังไม่มีเอกสารแนบ</p>}
        {pending.map((p, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-2 rounded-[9px] border border-border bg-[#FDFCF8] px-3.5 py-2.5"
          >
            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink">
              {p.type === 'link' ? '🔗' : '📄'} {p.type === 'file' ? p.file?.name : p.url}
            </span>
            <button type="button" onClick={() => remove(i)} className="flex-none text-xs font-bold text-error">
              ลบ
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => fileInput.current?.click()}
        className="rounded-btn border-[1.5px] border-primary px-3.5 py-2 text-[12px] font-bold text-primary"
      >
        + แนบไฟล์ (doc, pdf, xlsx, pptx, csv, html)
      </button>
      <input
        ref={fileInput}
        type="file"
        accept=".doc,.docx,.pdf,.xlsx,.pptx,.csv,.html"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) onChange([...pending, { type: 'file', file }]);
        }}
      />
      <div className="mt-2.5 flex gap-2">
        <input
          ref={linkInput}
          placeholder="วางลิงก์ Google Docs / Sheets"
          className="flex-1 rounded-[9px] border border-border bg-white px-3 py-2 text-[12.5px] text-ink placeholder:text-ink-fainter"
        />
        <button
          type="button"
          onClick={() => {
            const val = linkInput.current?.value.trim();
            if (!val) return;
            onChange([...pending, { type: 'link', url: val }]);
            if (linkInput.current) linkInput.current.value = '';
          }}
          className="flex-none rounded-btn bg-primary px-3.5 py-2 text-[12px] font-bold text-white"
        >
          + เพิ่มลิงก์
        </button>
      </div>
    </div>
  );
}

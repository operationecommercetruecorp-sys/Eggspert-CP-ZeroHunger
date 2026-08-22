'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface AttachmentData {
  id: string;
  kind: string;
  label: string;
  url: string;
  fileType: string | null;
}

export function ArticleAttachments({ articleId, attachments }: { articleId: string; attachments: AttachmentData[] }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(form: FormData) {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/learning-articles/${articleId}/attachments`, { method: 'POST', body: form });
    setBusy(false);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? 'ไม่สำเร็จ');
      return;
    }
    router.refresh();
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    await submit(form);
  }

  async function onAddLink(e: React.FormEvent) {
    e.preventDefault();
    if (!linkUrl.trim()) return;
    const form = new FormData();
    form.append('linkUrl', linkUrl.trim());
    await submit(form);
    setLinkUrl('');
  }

  async function remove(attachmentId: string) {
    if (!window.confirm('ลบเอกสารนี้?')) return;
    await fetch(`/api/learning-articles/${articleId}/attachments/${attachmentId}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div className="border-t border-border-soft pt-3.5">
      <div className="mb-2 text-[13px] font-semibold text-ink-body">เอกสารแนบ</div>
      <div className="mb-3 grid gap-2">
        {attachments.length === 0 && <p className="text-xs text-ink-faint">ยังไม่มีเอกสารแนบ</p>}
        {attachments.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between gap-2 rounded-[9px] border border-border bg-[#FDFCF8] px-3.5 py-2.5"
          >
            <a
              href={a.url}
              target="_blank"
              rel="noreferrer"
              className="min-w-0 flex-1 truncate text-[13px] font-semibold text-primary"
            >
              {a.kind === 'link' ? '🔗' : '📄'} {a.label}
            </a>
            <button
              type="button"
              onClick={() => remove(a.id)}
              className="flex-none text-xs font-bold text-error"
            >
              ลบ
            </button>
          </div>
        ))}
      </div>
      {error && <p className="mb-2 text-xs text-error">{error}</p>}
      <button
        type="button"
        onClick={() => fileInput.current?.click()}
        disabled={busy}
        className="rounded-btn border-[1.5px] border-primary px-3.5 py-2 text-[12px] font-bold text-primary disabled:opacity-60"
      >
        + อัปโหลดไฟล์ (doc, xlsx, csv, html)
      </button>
      <input
        ref={fileInput}
        type="file"
        accept=".doc,.docx,.xlsx,.csv,.html"
        className="hidden"
        onChange={onFileChange}
      />
      <form onSubmit={onAddLink} className="mt-2.5 flex gap-2">
        <input
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="วางลิงก์ Google Docs / Sheets"
          className="flex-1 rounded-[9px] border border-border bg-white px-3 py-2 text-[12.5px] text-ink placeholder:text-ink-fainter"
        />
        <button
          type="submit"
          disabled={busy}
          className="flex-none rounded-btn bg-primary px-3.5 py-2 text-[12px] font-bold text-white disabled:opacity-60"
        >
          + เพิ่มลิงก์
        </button>
      </form>
    </div>
  );
}

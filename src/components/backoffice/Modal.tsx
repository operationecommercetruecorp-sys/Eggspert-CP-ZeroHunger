'use client';

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-30 flex items-start justify-center overflow-y-auto bg-[#1C1A17]/50 py-20"
      onClick={onClose}
    >
      <div
        className="w-[520px] max-w-[92vw] overflow-hidden rounded-card bg-white shadow-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border bg-eggshell px-[26px] py-[22px]">
          <div className="text-[17px] font-extrabold text-ink">{title}</div>
          <button onClick={onClose} className="text-xl leading-none text-ink-faint" aria-label="Close">
            ×
          </button>
        </div>
        <div className="grid gap-3.5 px-[26px] py-6">{children}</div>
      </div>
    </div>
  );
}

export function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 text-[13px] font-semibold text-ink-body">{label}</div>
      {children}
      {error && <div className="mt-1 text-xs text-error">{error}</div>}
    </div>
  );
}

export const inputClass =
  'w-full rounded-[9px] border border-border bg-[#FDFCF8] px-3.5 py-3 text-sm text-ink placeholder:text-ink-fainter focus:outline-none focus:ring-2 focus:ring-primary/30';

export function ModalActions({
  onCancel,
  submitting,
  submitLabel = 'บันทึก',
}: {
  onCancel: () => void;
  submitting?: boolean;
  submitLabel?: string;
}) {
  return (
    <div className="mt-2 flex gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-[9px] border-[1.5px] border-border px-[22px] py-3 text-sm font-semibold text-ink-muted"
      >
        ยกเลิก
      </button>
      <button
        type="submit"
        disabled={submitting}
        className="flex-1 rounded-[9px] bg-primary px-[22px] py-3 text-sm font-bold text-white disabled:opacity-60"
      >
        {submitting ? 'กำลังบันทึก…' : submitLabel}
      </button>
    </div>
  );
}

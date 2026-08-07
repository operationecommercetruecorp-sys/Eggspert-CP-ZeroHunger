'use client';

import { useLanguage } from '@/lib/i18n/LanguageProvider';

export function ChatPanel({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();

  return (
    <div className="fixed bottom-7 right-7 z-30 w-[400px] max-w-[92vw] overflow-hidden rounded-card border border-border bg-white shadow-modal">
      <div className="flex items-center gap-3 bg-primary px-[18px] py-4 text-white">
        <div className="h-[30px] w-6 flex-none rounded-[50%/60%_60%_40%_40%] bg-eggshell" />
        <div className="flex-1">
          <div className="text-[15px] font-bold">Eggspert AI</div>
          <div className="text-[11px] opacity-75">{t.chatStatus}</div>
        </div>
        <button onClick={onClose} className="text-lg">
          ×
        </button>
      </div>
      <div className="bg-[#FDFCF8] p-[18px]">
        <p className="text-sm leading-relaxed text-ink-muted">{t.chatComingSoon}</p>
      </div>
    </div>
  );
}

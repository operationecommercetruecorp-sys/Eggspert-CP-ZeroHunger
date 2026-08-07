'use client';

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  citations?: string[];
}

export function ChatPanel({ onClose, initialQuestion }: { onClose: () => void; initialQuestion?: string }) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);
  const sentInitial = useRef(false);

  async function ask(question: string) {
    if (!question.trim() || loading) return;
    setMessages((m) => [...m, { role: 'user', text: question }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'failed');
      if (json.configured === false) {
        setNotConfigured(true);
      } else {
        setMessages((m) => [...m, { role: 'assistant', text: json.answer, citations: json.citations }]);
      }
    } catch {
      setMessages((m) => [...m, { role: 'assistant', text: t.chatError }]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialQuestion && !sentInitial.current) {
      sentInitial.current = true;
      ask(initialQuestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion]);

  return (
    <div className="fixed bottom-7 right-7 z-30 flex max-h-[70vh] w-[400px] max-w-[92vw] flex-col overflow-hidden rounded-card border border-border bg-white shadow-modal">
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

      <div className="flex-1 space-y-3.5 overflow-y-auto bg-[#FDFCF8] p-[18px]">
        {notConfigured ? (
          <p className="text-sm leading-relaxed text-ink-muted">{t.chatComingSoon}</p>
        ) : messages.length === 0 ? (
          <p className="text-sm leading-relaxed text-ink-faint">{t.chatEmptyState}</p>
        ) : (
          messages.map((m, i) =>
            m.role === 'user' ? (
              <div
                key={i}
                className="ml-auto max-w-[80%] rounded-[14px_14px_4px_14px] bg-success-bg px-3.5 py-2.5 text-sm text-ink"
              >
                {m.text}
              </div>
            ) : (
              <div key={i} className="max-w-[88%]">
                <div className="rounded-[14px_14px_14px_4px] border border-border bg-white px-[15px] py-3.5 text-sm leading-relaxed text-ink-body">
                  {m.text}
                </div>
                {!!m.citations?.length && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.citations.map((c) => (
                      <span key={c} className="rounded-pill bg-success-bg px-[11px] py-[5px] text-[11px] text-primary">
                        {t.chatSourcePrefix} {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ),
          )
        )}
        {loading && <p className="text-sm text-ink-faint">{t.chatThinking}</p>}
      </div>

      {!notConfigured && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="flex items-center gap-2.5 border-t border-border-soft px-4 py-3.5"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ask the Eggspert"
            className="flex-1 text-sm text-ink outline-none placeholder:text-ink-fainter"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-primary text-[15px] text-white disabled:opacity-60"
          >
            ↑
          </button>
        </form>
      )}
    </div>
  );
}

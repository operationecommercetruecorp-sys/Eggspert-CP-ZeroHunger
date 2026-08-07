'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function RemoveButton({ url, confirmMessage }: { url: string; confirmMessage: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    if (!window.confirm(confirmMessage)) return;
    setLoading(true);
    await fetch(url, { method: 'DELETE' });
    setLoading(false);
    router.refresh();
  }

  return (
    <button onClick={onClick} disabled={loading} className="justify-self-end text-xs font-bold text-error">
      ลบ
    </button>
  );
}

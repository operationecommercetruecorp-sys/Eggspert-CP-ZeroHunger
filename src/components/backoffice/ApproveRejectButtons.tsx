'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ApproveRejectButtons({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setStatus(status: 'APPROVED' | 'REJECTED') {
    setLoading(true);
    await fetch(`/api/applications/${applicationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2 border-t-0 px-5 pb-3.5 pt-0">
      <button disabled={loading} onClick={() => setStatus('APPROVED')} className="text-xs font-bold text-primary">
        อนุมัติ
      </button>
      <button disabled={loading} onClick={() => setStatus('REJECTED')} className="text-xs font-bold text-error">
        ปฏิเสธ
      </button>
    </div>
  );
}

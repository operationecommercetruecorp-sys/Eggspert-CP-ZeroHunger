'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function TogglePublishButton({
  schoolId,
  docId,
  published,
}: {
  schoolId: string;
  docId: string;
  published: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    await fetch(`/api/schools/${schoolId}/syllabus/${docId}`, { method: 'PATCH' });
    setLoading(false);
    router.refresh();
  }

  return (
    <button onClick={onClick} disabled={loading} className="text-xs font-bold text-primary">
      {published ? 'เก็บเป็นฉบับร่าง' : 'เผยแพร่'}
    </button>
  );
}

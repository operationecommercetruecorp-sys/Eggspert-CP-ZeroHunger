'use client';

import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="flex w-full items-center gap-2 rounded-lg px-1 py-2 text-left text-[13.5px] font-semibold text-white hover:opacity-90"
    >
      ← ออกจากระบบ / กลับหน้าเว็บหลัก
    </button>
  );
}

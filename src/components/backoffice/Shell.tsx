'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignOutButton } from './SignOutButton';

export interface ShellNavItem {
  key: string;
  label: string;
  href: string;
}

export function BackofficeShell({
  navItems,
  userName,
  userSub,
  children,
}: {
  navItems: ShellNavItem[];
  userName: string;
  userSub: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex w-[252px] flex-none flex-col bg-primary text-white">
        <div className="border-b border-white/15 px-[22px] pb-[18px] pt-[22px]">
          <div className="flex items-center gap-[10px]">
            <div className="h-8 w-[26px] flex-none rounded-[50%/60%_60%_40%_40%] bg-eggshell" />
            <div className="text-[15px] font-bold leading-tight">Eggspert Backoffice</div>
          </div>
        </div>

        <div className="border-b border-white/15 px-[22px] py-4">
          <div className="text-[12px] opacity-85">{userName}</div>
          <div className="text-[11px] opacity-60">{userSub}</div>
        </div>

        <nav className="flex flex-1 flex-col gap-[3px] overflow-y-auto p-[14px_12px] px-3 py-3.5">
          {navItems.map((item) => {
            const active =
              item.href === '/backoffice' ? pathname === '/backoffice' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                className="rounded-[9px] px-3.5 py-[11px] text-[14px] font-semibold"
                style={{
                  background: active ? 'rgba(255,255,255,.16)' : 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,.75)',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/15 px-[22px] py-3.5">
          <SignOutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-canvas">
        <div className="mx-auto max-w-[1180px] px-10 pb-20 pt-9">{children}</div>
      </main>
    </div>
  );
}

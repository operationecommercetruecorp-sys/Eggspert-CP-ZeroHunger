import Link from 'next/link';
import { requireStaffPage } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { AddStaffModal } from '@/components/backoffice/AddStaffModal';
import { AddSchoolUserModal } from '@/components/backoffice/AddSchoolUserModal';
import { RemoveButton } from '@/components/backoffice/RemoveButton';
import { ROLE_LABEL } from '@/lib/roleLabels';

type AccessTab = 'admins' | 'cp' | 'users';

export default async function AccessPage({ searchParams }: { searchParams: { tab?: string } }) {
  const user = await requireStaffPage(['developer', 'admin', 'cp']);
  const isDevAdmin = user.role === 'developer' || user.role === 'admin';

  const tabs: AccessTab[] = isDevAdmin ? ['admins', 'cp', 'users'] : ['users'];
  const tab: AccessTab = tabs.includes(searchParams.tab as AccessTab) ? (searchParams.tab as AccessTab) : tabs[0];
  const tabLabel: Record<string, string> = { admins: 'ผู้ดูแลระบบ', cp: 'ผู้ใช้งาน CP', users: 'ครูและนักเรียน' };

  const [admins, cpUsers, schoolUsers, schools] = await Promise.all([
    tab === 'admins' ? prisma.user.findMany({ where: { role: 'admin' }, orderBy: { createdAt: 'asc' } }) : Promise.resolve([]),
    tab === 'cp' ? prisma.user.findMany({ where: { role: 'cp' }, orderBy: { createdAt: 'asc' } }) : Promise.resolve([]),
    tab === 'users'
      ? prisma.user.findMany({
          where: { role: { in: ['teacher', 'student'] } },
          include: { school: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        })
      : Promise.resolve([]),
    tab === 'users' ? prisma.school.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }) : Promise.resolve([]),
  ]);

  const adminCount = tab === 'admins' ? admins.length : await prisma.user.count({ where: { role: 'admin' } });

  return (
    <div>
      <h1 className="mb-1.5 text-2xl font-extrabold text-ink">สิทธิ์การเข้าถึงและบัญชีผู้ใช้</h1>
      <p className="mb-[22px] text-[13.5px] text-ink-muted">จัดการบัญชีผู้ดูแลระบบ ผู้ใช้งาน CP ครู และนักเรียน</p>

      <div className="mb-[22px] flex gap-2 border-b border-border">
        {tabs.map((t) => (
          <Link
            key={t}
            href={`/backoffice/access?tab=${t}`}
            className="mr-[22px] pb-2.5 pt-2.5 text-sm font-bold"
            style={{ color: tab === t ? '#14663C' : '#9a9284', borderBottom: tab === t ? '2px solid #14663C' : '2px solid transparent' }}
          >
            {tabLabel[t]}
          </Link>
        ))}
      </div>

      {tab === 'admins' && (
        <>
          <div className="mb-3.5 flex items-center justify-between">
            <div className="text-[13.5px] text-ink-muted">
              สูงสุด 5 บัญชี — <b className="text-primary">{adminCount} / 5</b>
            </div>
            <AddStaffModal role="admin" title="เพิ่มผู้ดูแลระบบใหม่" triggerLabel="+ เพิ่มผู้ดูแลระบบ" disabled={adminCount >= 5} />
          </div>
          <UserTable rows={admins.map((u) => ({ id: u.id, name: u.nameTh, email: u.email ?? '' }))} />
        </>
      )}

      {tab === 'cp' && (
        <>
          <div className="mb-3.5 flex justify-end">
            <AddStaffModal role="cp" title="เพิ่มผู้ใช้งาน CP" triggerLabel="+ เพิ่มผู้ใช้งาน CP" />
          </div>
          <UserTable rows={cpUsers.map((u) => ({ id: u.id, name: u.nameTh, email: u.email ?? '' }))} />
        </>
      )}

      {tab === 'users' && (
        <>
          <div className="mb-3.5 flex justify-end">
            <AddSchoolUserModal schools={schools} allowedRoles={['teacher', 'student']} triggerLabel="+ เพิ่มครู/นักเรียน" />
          </div>
          <div className="overflow-hidden rounded-card border border-border bg-white">
            <div className="grid grid-cols-[1.3fr_.7fr_1.3fr_.9fr_.5fr] bg-eggshell px-5 py-3 text-xs font-bold uppercase text-ink-muted">
              <div>ชื่อ</div>
              <div>บทบาท</div>
              <div>สถานศึกษา</div>
              <div>สร้างเมื่อ</div>
              <div />
            </div>
            {schoolUsers.map((u) => (
              <div key={u.id} className="grid grid-cols-[1.3fr_.7fr_1.3fr_.9fr_.5fr] items-center border-t border-border-faint px-5 py-3.5 text-sm">
                <div>
                  <div className="font-semibold text-ink">{u.nameTh}</div>
                  <div className="text-[11.5px] text-ink-faint">{u.nameEn}</div>
                </div>
                <div className="text-[11.5px] font-bold text-primary">
                  {ROLE_LABEL[u.role]}
                  {u.isMainContact && (
                    <span className="ml-1 rounded-pill bg-warning-bg px-[7px] py-0.5 text-[10.5px] text-warning">หลัก</span>
                  )}
                </div>
                <div className="text-ink-muted">{u.school?.name}</div>
                <div className="text-ink-faint">{u.createdAt.toLocaleDateString('th-TH')}</div>
                <RemoveButton url={`/api/users/${u.id}`} confirmMessage={`ลบบัญชี ${u.nameTh}?`} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function UserTable({ rows }: { rows: { id: string; name: string; email: string }[] }) {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-white">
      <div className="grid grid-cols-[1.4fr_1.6fr_.6fr] bg-eggshell px-5 py-3 text-xs font-bold uppercase text-ink-muted">
        <div>ชื่อ</div>
        <div>อีเมล</div>
        <div />
      </div>
      {rows.length === 0 && <p className="p-6 text-sm text-ink-faint">ยังไม่มีรายการ</p>}
      {rows.map((u) => (
        <div key={u.id} className="grid grid-cols-[1.4fr_1.6fr_.6fr] items-center border-t border-border-faint px-5 py-[13px] text-sm">
          <div className="font-semibold text-ink">{u.name}</div>
          <div className="text-ink-muted">{u.email}</div>
          <RemoveButton url={`/api/users/${u.id}`} confirmMessage={`ลบบัญชี ${u.name}?`} />
        </div>
      ))}
    </div>
  );
}

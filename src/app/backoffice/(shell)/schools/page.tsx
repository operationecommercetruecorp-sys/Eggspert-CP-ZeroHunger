import Link from 'next/link';
import { requireStaffPage } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { AddSchoolModal } from '@/components/backoffice/AddSchoolModal';
import { CsvImportButton } from '@/components/backoffice/CsvImportButton';

export default async function SchoolsPage() {
  await requireStaffPage(['developer', 'admin', 'cp']);
  const schools = await prisma.school.findMany({
    include: { users: { select: { role: true } } },
    orderBy: { name: 'asc' },
  });

  return (
    <div>
      <div className="mb-[22px] flex items-baseline justify-between">
        <div>
          <h1 className="mb-1.5 text-2xl font-extrabold text-ink">รายชื่อโรงเรียน</h1>
          <p className="text-[13.5px] text-ink-muted">{schools.length} โรงเรียนในระบบ</p>
        </div>
        <div className="flex items-center gap-2.5">
          <CsvImportButton />
          <a
            href="/api/schools/export"
            className="rounded-btn border-[1.5px] border-primary px-[18px] py-[11px] text-[13.5px] font-bold text-primary"
          >
            ส่งออก CSV
          </a>
          <AddSchoolModal />
        </div>
      </div>
      <div className="overflow-hidden rounded-card border border-border bg-white">
        <div className="grid grid-cols-[1.6fr_1.3fr_1fr_.6fr_.6fr_.7fr] bg-eggshell px-5 py-3 text-xs font-bold uppercase text-ink-muted">
          <div>ชื่อโรงเรียน</div>
          <div>ที่ตั้ง</div>
          <div>เข้าร่วมเมื่อ</div>
          <div>ครู</div>
          <div>นักเรียน</div>
          <div />
        </div>
        {schools.map((s) => {
          const teacherCount = s.users.filter((u) => u.role === 'teacher').length;
          const studentCount = s.users.filter((u) => u.role === 'student').length;
          return (
            <div key={s.id} className="grid grid-cols-[1.6fr_1.3fr_1fr_.6fr_.6fr_.7fr] items-center border-t border-border-faint px-5 py-3.5 text-sm">
              <div className="font-semibold text-ink">{s.name}</div>
              <div className="text-ink-muted">{s.location}</div>
              <div className="text-ink-muted">{s.joinedDate.toLocaleDateString('th-TH')}</div>
              <div className="text-ink">{teacherCount}</div>
              <div className="text-ink">{studentCount}</div>
              <Link href={`/backoffice/schools/${s.id}`} className="justify-self-end text-[13px] font-bold text-primary">
                เปิด →
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

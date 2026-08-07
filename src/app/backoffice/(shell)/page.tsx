import Link from 'next/link';
import { requireStaffPage } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { ROLE_SUB } from '@/lib/roleLabels';

function StatCard({ k, v, note }: { k: string; v: string | number; note: string }) {
  return (
    <div className="rounded-card-sm border border-border bg-white px-5 py-[18px]">
      <div className="text-[12px] text-ink-faint">{k}</div>
      <div className="mt-1.5 text-2xl font-extrabold text-primary">{v}</div>
      <div className="mt-0.5 text-[11.5px] text-ink-muted">{note}</div>
    </div>
  );
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'รอตรวจสอบ',
  APPROVED: 'อนุมัติแล้ว',
  REJECTED: 'ปฏิเสธ',
};
const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-warning-bg text-warning',
  APPROVED: 'bg-success-bg text-success',
  REJECTED: 'bg-error-bg text-error',
};

export default async function BackofficeDashboardPage() {
  const user = await requireStaffPage();
  const isDevAdmin = user.role === 'developer' || user.role === 'admin';
  const isManager = isDevAdmin || user.role === 'cp';

  let cards: { k: string; v: string | number; note: string }[] = [];
  let recentApplications: Awaited<ReturnType<typeof prisma.application.findMany>> = [];
  let adminCount = 0;

  if (isManager) {
    const [schoolCount, latestResult, pendingCount, learningCount, admins] = await Promise.all([
      prisma.school.count(),
      prisma.projectResult.findFirst({ orderBy: { updateDate: 'desc' } }),
      prisma.application.count({ where: { status: 'PENDING' } }),
      prisma.learningArticle.count(),
      prisma.user.count({ where: { role: 'admin' } }),
    ]);
    adminCount = admins;
    cards = [
      { k: 'โรงเรียนทั้งหมด', v: schoolCount, note: 'ครอบคลุมหลายจังหวัด' },
      { k: 'นักเรียนรวม', v: latestResult?.studentCount.toLocaleString() ?? '—', note: 'คน' },
      { k: 'ใบสมัครรอตรวจสอบ', v: pendingCount, note: 'รายการ' },
      { k: 'บทความในคลังความรู้', v: learningCount, note: 'หัวข้อ' },
    ];
    recentApplications = await prisma.application.findMany({ orderBy: { createdAt: 'desc' }, take: 3 });
  } else if (user.schoolId) {
    const schoolId = user.schoolId;
    const [latestEgg, studentCount, publishedCount, iotDeviceCount] = await Promise.all([
      prisma.eggLog.findFirst({ where: { schoolId }, orderBy: { date: 'desc' } }),
      prisma.user.count({ where: { schoolId, role: 'student' } }),
      prisma.syllabusDoc.count({ where: { schoolId, status: 'published' } }),
      prisma.iotDevice.count({ where: { schoolId } }),
    ]);
    cards = [
      { k: 'ไข่วันนี้', v: latestEgg?.count ?? 0, note: 'ฟอง' },
      { k: 'นักเรียน', v: studentCount, note: 'คน' },
      { k: 'เอกสารที่เผยแพร่', v: publishedCount, note: 'รายการ' },
      { k: 'อุปกรณ์ IoT', v: iotDeviceCount, note: 'เครื่อง' },
    ];
  }

  return (
    <div>
      <h1 className="mb-1.5 text-2xl font-extrabold text-ink">ภาพรวมระบบ</h1>
      <p className="mb-[26px] text-[13.5px] text-ink-muted">{ROLE_SUB[user.role]}</p>

      <div className="mb-[30px] grid grid-cols-4 gap-3.5">
        {cards.map((c) => (
          <StatCard key={c.k} {...c} />
        ))}
      </div>

      {isDevAdmin && (
        <div className="mb-[26px] flex items-center justify-between rounded-card-sm border border-border bg-eggshell px-5 py-4">
          <div className="text-[13.5px] font-semibold text-ink">การใช้งานสิทธิ์ผู้ดูแลระบบ (Admin)</div>
          <div className="text-[14px] font-extrabold text-primary">{adminCount} / 5</div>
        </div>
      )}

      {isManager && (
        <div className="rounded-card border border-border bg-white p-[22px]">
          <div className="mb-3.5 flex items-baseline justify-between">
            <div className="text-base font-bold text-ink">ใบสมัครล่าสุด</div>
            <Link href="/backoffice/applications" className="text-[13px] font-bold text-primary">
              ดูทั้งหมด →
            </Link>
          </div>
          {recentApplications.length === 0 && <p className="text-sm text-ink-faint">ยังไม่มีใบสมัคร</p>}
          {recentApplications.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between border-b border-border-faint py-[11px] last:border-b-0"
            >
              <div>
                <div className="text-sm font-semibold text-ink">{a.school}</div>
                <div className="text-xs text-ink-faint">
                  {a.name} · {a.createdAt.toLocaleDateString('th-TH')}
                </div>
              </div>
              <span className={`rounded-pill px-3 py-[5px] text-xs font-bold ${STATUS_BADGE[a.status]}`}>
                {STATUS_LABEL[a.status]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

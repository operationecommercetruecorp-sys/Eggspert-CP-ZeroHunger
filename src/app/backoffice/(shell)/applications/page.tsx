import { requireStaffPage } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { ApproveRejectButtons } from '@/components/backoffice/ApproveRejectButtons';

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

export default async function ApplicationsPage() {
  await requireStaffPage(['developer', 'admin', 'cp']);
  const applications = await prisma.application.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div>
      <h1 className="mb-1.5 text-2xl font-extrabold text-ink">ใบสมัครเข้าร่วมโครงการ</h1>
      <p className="mb-[22px] text-[13.5px] text-ink-muted">
        มาจากปุ่ม &quot;สมัครเข้าร่วมโครงการ&quot; / &quot;สมัครสมาชิก&quot; บนหน้าเว็บหลัก
      </p>
      <div className="overflow-hidden rounded-card border border-border bg-white">
        <div className="grid grid-cols-[1.3fr_1fr_1fr_1.3fr_.9fr_1fr] bg-eggshell px-5 py-[13px] text-xs font-bold uppercase tracking-wide text-ink-muted">
          <div>สถานศึกษา</div>
          <div>ผู้สมัคร</div>
          <div>เบอร์โทร</div>
          <div>อีเมล</div>
          <div>วันที่</div>
          <div>สถานะ</div>
        </div>
        {applications.length === 0 && <p className="p-6 text-sm text-ink-faint">ยังไม่มีใบสมัคร</p>}
        {applications.map((a) => (
          <div key={a.id} className="border-t border-border-faint">
            <div className="grid grid-cols-[1.3fr_1fr_1fr_1.3fr_.9fr_1fr] items-center px-5 py-3.5 text-[13.5px]">
              <div className="font-semibold text-ink">{a.school}</div>
              <div className="text-ink-body">{a.name}</div>
              <div className="text-ink-muted">{a.phone}</div>
              <div className="text-ink-muted">{a.email}</div>
              <div className="text-ink-muted">{a.createdAt.toLocaleDateString('th-TH')}</div>
              <span className={`w-fit rounded-pill px-2.5 py-1 text-[11.5px] font-bold ${STATUS_BADGE[a.status]}`}>
                {STATUS_LABEL[a.status]}
              </span>
            </div>
            {a.status === 'PENDING' && <ApproveRejectButtons applicationId={a.id} />}
          </div>
        ))}
      </div>
    </div>
  );
}

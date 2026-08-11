import { requireStaffPage } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { RemoveButton } from '@/components/backoffice/RemoveButton';
import { AddNotificationEmailModal } from '@/components/backoffice/AddNotificationEmailModal';
import { SiteImageSlot } from '@/components/backoffice/SiteImageSlot';

export default async function SettingsPage() {
  await requireStaffPage(['developer', 'admin']);
  const emails = await prisma.notificationEmail.findMany({ orderBy: { email: 'asc' } });
  const siteImages = await prisma.siteImage.findMany();
  const imageByKey = Object.fromEntries(siteImages.map((i) => [i.key, i.url]));

  return (
    <div>
      <h1 className="mb-1.5 text-2xl font-extrabold text-ink">ตั้งค่าระบบ</h1>
      <p className="mb-6 text-[13.5px] text-ink-muted">มองเห็นได้เฉพาะ Admin และ Developer</p>

      <div className="mb-6 max-w-[640px] rounded-card border border-border bg-white p-6">
        <div className="mb-1.5 text-[15px] font-bold text-ink">รูปภาพหน้าเว็บ</div>
        <p className="mb-4 text-[13px] leading-relaxed text-ink-muted">
          รูปประกอบสำหรับ &quot;สำหรับครูและผู้บริหาร&quot;, &quot;สำหรับนักเรียน&quot; และภาพประกอบโครงการบนหน้าแรก
          หากยังไม่อัปโหลด ระบบจะแสดงภาพตัวอย่างแทน
        </p>
        <div className="grid gap-2.5">
          <SiteImageSlot
            imageKey="teacher"
            label="ภาพสำหรับครูและผู้บริหาร"
            hint="แสดงในกล่อง &quot;สำหรับครูและผู้บริหาร&quot; บนหน้าแรก"
            currentUrl={imageByKey.teacher ?? null}
          />
          <SiteImageSlot
            imageKey="student"
            label="ภาพสำหรับนักเรียน"
            hint="แสดงในกล่อง &quot;สำหรับนักเรียน&quot; บนหน้าแรก"
            currentUrl={imageByKey.student ?? null}
          />
          <SiteImageSlot
            imageKey="project"
            label="ภาพประกอบโครงการ"
            hint="แสดงข้างคำอธิบายโครงการบนหน้าแรก"
            currentUrl={imageByKey.project ?? null}
          />
        </div>
      </div>

      <div className="max-w-[640px] rounded-card border border-border bg-white p-6">
        <div className="mb-1.5 text-[15px] font-bold text-ink">อีเมลรับแจ้งใบสมัครใหม่</div>
        <p className="mb-4 text-[13px] leading-relaxed text-ink-muted">
          ระบบจะส่งอีเมลหัวข้อ &quot;มีผู้สมัครใหม่ โครงการไก่ไข่เพื่ออาหารกลางวันนักเรียน วันที่ [วันที่สมัคร]&quot;
          ไปยังรายชื่อนี้ทุกครั้งที่มีผู้กดสมัครเข้าร่วมโครงการ
        </p>
        <div className="mb-3.5 grid gap-2">
          {emails.length === 0 && <p className="text-sm text-ink-faint">ยังไม่มีอีเมล</p>}
          {emails.map((e) => (
            <div key={e.id} className="flex items-center justify-between rounded-[9px] border border-border bg-[#FDFCF8] px-3.5 py-[11px]">
              <span className="text-sm text-ink">{e.email}</span>
              <RemoveButton url={`/api/notification-emails/${e.id}`} confirmMessage={`ลบอีเมล ${e.email}?`} />
            </div>
          ))}
        </div>
        <AddNotificationEmailModal />
      </div>
    </div>
  );
}

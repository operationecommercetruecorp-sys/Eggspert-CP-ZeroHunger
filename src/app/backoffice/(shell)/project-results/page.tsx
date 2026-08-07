import { requireStaffPage } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { AddProjectResultModal } from '@/components/backoffice/AddProjectResultModal';

export default async function ProjectResultsPage() {
  await requireStaffPage(['developer', 'admin', 'cp']);
  const results = await prisma.projectResult.findMany({ orderBy: { updateDate: 'desc' } });

  return (
    <div>
      <div className="mb-[22px] flex items-baseline justify-between">
        <div>
          <h1 className="mb-1.5 text-2xl font-extrabold text-ink">ผลลัพธ์โครงการ</h1>
          <p className="text-[13.5px] text-ink-muted">ข้อมูลที่แสดงในหน้าแรกของเว็บไซต์ (แถวล่าสุดจะถูกใช้)</p>
        </div>
        <AddProjectResultModal />
      </div>
      <div className="overflow-hidden rounded-card border border-border bg-white">
        <div className="grid grid-cols-[.9fr_.8fr_.8fr_.8fr_1fr_1fr_1.1fr_.9fr] bg-eggshell px-[18px] py-3 text-[11.5px] font-bold uppercase text-ink-muted">
          <div>วันที่อัปเดต</div>
          <div>จังหวัด</div>
          <div>ประเทศ</div>
          <div>โรงเรียน</div>
          <div>นักเรียน</div>
          <div>บุคลากร</div>
          <div>ชุมชน</div>
          <div>ไข่/รุ่น</div>
        </div>
        {results.map((p) => (
          <div key={p.id} className="grid grid-cols-[.9fr_.8fr_.8fr_.8fr_1fr_1fr_1.1fr_.9fr] border-t border-border-faint px-[18px] py-3.5 text-[13.5px]">
            <div className="text-ink-muted">{p.updateDate.toLocaleDateString('th-TH')}</div>
            <div className="font-bold text-primary">{p.provinces}</div>
            <div className="font-bold text-primary">{p.countries}</div>
            <div className="text-ink">{p.schoolCount.toLocaleString()}</div>
            <div className="text-ink">{p.studentCount.toLocaleString()}</div>
            <div className="text-ink">{p.staffCount.toLocaleString()}</div>
            <div className="text-ink">{p.communityCount.toLocaleString()}</div>
            <div className="text-ink">{p.eggsPerCycle}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

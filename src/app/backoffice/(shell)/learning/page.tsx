import { requireStaffPage } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { LearningArticleModal } from '@/components/backoffice/LearningArticleModal';

export default async function LearningPage() {
  await requireStaffPage(['developer', 'admin', 'cp']);
  const articles = await prisma.learningArticle.findMany({
    orderBy: { createdAt: 'desc' },
    include: { attachments: { orderBy: { createdAt: 'asc' } } },
  });

  return (
    <div>
      <div className="mb-[22px] flex items-baseline justify-between">
        <div>
          <h1 className="mb-1.5 text-2xl font-extrabold text-ink">คลังความรู้ (Learning Center)</h1>
          <p className="text-[13.5px] text-ink-muted">เนื้อหาที่ &quot;ask the Eggspert&quot; ใช้ค้นหาบนหน้าเว็บหลัก</p>
        </div>
        <LearningArticleModal
          triggerLabel="+ เขียนบทความใหม่"
          triggerClassName="rounded-btn bg-primary px-5 py-[11px] text-[13.5px] font-bold text-white"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {articles.map((k) => (
          <div key={k.id} className="overflow-hidden rounded-card border border-border bg-white">
            <div
              className="h-[90px]"
              style={{
                background: k.imageUrl
                  ? `url(${k.imageUrl}) center/cover`
                  : 'repeating-linear-gradient(135deg,#F7F1E3 0 10px,#EFE6D2 10px 20px)',
              }}
            />
            <div className="px-[18px] py-4">
              <div className="text-[11px] font-bold uppercase tracking-wide text-success">{k.tag}</div>
              <div className="my-1.5 text-[15px] font-bold text-ink">{k.title}</div>
              <p className="mb-2.5 text-[12.5px] leading-snug text-ink-muted">{k.body.slice(0, 110)}</p>
              <LearningArticleModal
                article={{ id: k.id, tag: k.tag, title: k.title, body: k.body, attachments: k.attachments }}
                triggerLabel="แก้ไข"
                triggerClassName="text-[12.5px] font-bold text-primary"
              />
            </div>
          </div>
        ))}
        {articles.length === 0 && <p className="text-sm text-ink-faint">ยังไม่มีบทความ</p>}
      </div>
    </div>
  );
}

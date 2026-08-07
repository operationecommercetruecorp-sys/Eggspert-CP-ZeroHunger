import Link from 'next/link';
import { requireStaffPage } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { AddNewsModal } from '@/components/backoffice/AddNewsModal';

export default async function GlobalNewsPage({ searchParams }: { searchParams: { school?: string } }) {
  await requireStaffPage(['developer', 'admin', 'cp']);
  const schools = await prisma.school.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
  const filterSchoolId = searchParams.school && searchParams.school !== 'all' ? searchParams.school : undefined;

  const news = await prisma.news.findMany({
    where: filterSchoolId ? { schoolId: filterSchoolId } : {},
    include: { school: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="mb-[18px] flex items-baseline justify-between">
        <div>
          <h1 className="mb-1.5 text-2xl font-extrabold text-ink">ข่าวสารทุกโรงเรียน</h1>
          <p className="text-[13.5px] text-ink-muted">กรองตามโรงเรียน</p>
        </div>
        <AddNewsModal schools={schools} triggerLabel="+ เขียนข่าว" />
      </div>
      <div className="mb-[18px] flex flex-wrap gap-2">
        <Link
          href="/backoffice/news"
          className="rounded-pill px-3.5 py-[7px] text-[12.5px] font-semibold"
          style={{
            border: `1px solid ${!filterSchoolId ? '#14663C' : '#E3D9C2'}`,
            background: !filterSchoolId ? '#14663C' : '#fff',
            color: !filterSchoolId ? '#fff' : '#4a4436',
          }}
        >
          ทุกโรงเรียน
        </Link>
        {schools.map((s) => (
          <Link
            key={s.id}
            href={`/backoffice/news?school=${s.id}`}
            className="rounded-pill px-3.5 py-[7px] text-[12.5px] font-semibold"
            style={{
              border: `1px solid ${filterSchoolId === s.id ? '#14663C' : '#E3D9C2'}`,
              background: filterSchoolId === s.id ? '#14663C' : '#fff',
              color: filterSchoolId === s.id ? '#fff' : '#4a4436',
            }}
          >
            {s.name}
          </Link>
        ))}
      </div>
      <div className="grid gap-3">
        {news.length === 0 && <p className="text-sm text-ink-faint">ยังไม่มีข่าว</p>}
        {news.map((n) => (
          <div key={n.id} className="rounded-card-sm border border-border bg-white px-[18px] py-4">
            <div className="text-[15px] font-bold text-ink">{n.title}</div>
            <div className="my-1 text-xs text-ink-faint">
              {n.school?.name} · {n.createdAt.toLocaleDateString('th-TH')}
            </div>
            <p className="text-[13.5px] leading-relaxed text-ink-body">{n.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

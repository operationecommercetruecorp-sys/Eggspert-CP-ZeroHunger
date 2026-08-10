import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireStaffPage, requireSchoolAccessPage } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { RemoveButton } from '@/components/backoffice/RemoveButton';
import { AddSchoolUserModal } from '@/components/backoffice/AddSchoolUserModal';
import { AddEggLogModal } from '@/components/backoffice/AddEggLogModal';
import { AddWaterFeedLogModal } from '@/components/backoffice/AddWaterFeedLogModal';
import { AddPhotoModal } from '@/components/backoffice/AddPhotoModal';
import { AddSyllabusModal } from '@/components/backoffice/AddSyllabusModal';
import { AddNewsModal } from '@/components/backoffice/AddNewsModal';
import { AddIotReadingModal } from '@/components/backoffice/AddIotReadingModal';
import { TogglePublishButton } from '@/components/backoffice/TogglePublishButton';

const TABS = ['overview', 'users', 'eggs', 'water', 'iot', 'photos', 'syllabus', 'news'] as const;
type Tab = (typeof TABS)[number];
const TAB_LABEL: Record<Tab, string> = {
  overview: 'ภาพรวม',
  users: 'ผู้ใช้งาน',
  eggs: 'ผลผลิตไข่',
  water: 'น้ำ/อาหาร',
  iot: 'IoT',
  photos: 'ภาพโรงเรือน',
  syllabus: 'แผนการสอน/การบ้าน',
  news: 'ข่าวสาร',
};
const SYLLABUS_TYPE_LABEL: Record<string, string> = { lesson_plan: 'แผนการสอน', worksheet: 'ใบงาน', quiz: 'แบบทดสอบ' };
const DAY_LABEL = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

export default async function SchoolDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { tab?: string };
}) {
  const user = await requireStaffPage();
  requireSchoolAccessPage(user, params.id);

  const school = await prisma.school.findUnique({ where: { id: params.id } });
  if (!school) notFound();

  const isManager = ['developer', 'admin', 'cp'].includes(user.role);
  const isTeacher = user.role === 'teacher';
  const isStudent = user.role === 'student';
  const canEdit = isManager || isTeacher;

  const visibleTabs = TABS.filter((t) => !(t === 'users' && isStudent));
  const tab: Tab = visibleTabs.includes(searchParams.tab as Tab) ? (searchParams.tab as Tab) : 'overview';

  return (
    <div>
      {isManager && (
        <Link href="/backoffice/schools" className="text-[13px] font-bold text-primary">
          ← กลับไปรายชื่อโรงเรียน
        </Link>
      )}
      <div className="mb-[22px] mt-2 flex items-start justify-between">
        <div>
          <h1 className="mb-1.5 text-2xl font-extrabold text-ink">{school.name}</h1>
          <p className="text-[13.5px] text-ink-muted">
            {school.location} · เข้าร่วมเมื่อ {school.joinedDate.toLocaleDateString('th-TH')}
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-1.5 border-b border-border">
        {visibleTabs.map((t) => (
          <Link
            key={t}
            href={`/backoffice/schools/${school.id}?tab=${t}`}
            className="px-3.5 pb-2.5 pt-2.5 text-[13.5px] font-bold"
            style={{ color: tab === t ? '#14663C' : '#9a9284', borderBottom: tab === t ? '2px solid #14663C' : '2px solid transparent' }}
          >
            {TAB_LABEL[t]}
          </Link>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab schoolId={school.id} />}
      {tab === 'users' && (
        <UsersTab schoolId={school.id} isManager={isManager} isTeacher={isTeacher} currentUserId={user.id} />
      )}
      {tab === 'eggs' && <EggsTab schoolId={school.id} canEdit={canEdit} />}
      {tab === 'water' && <WaterTab schoolId={school.id} canEdit={canEdit} />}
      {tab === 'iot' && <IotTab schoolId={school.id} canEdit={canEdit} />}
      {tab === 'photos' && <PhotosTab schoolId={school.id} canEdit={canEdit} />}
      {tab === 'syllabus' && <SyllabusTab schoolId={school.id} canEdit={canEdit} isStudent={isStudent} />}
      {tab === 'news' && <NewsTab schoolId={school.id} canEdit={canEdit} />}
    </div>
  );
}

async function OverviewTab({ schoolId }: { schoolId: string }) {
  const [latestEgg, teacherCount, studentCount, iotDeviceCount, publishedCount] = await Promise.all([
    prisma.eggLog.findFirst({ where: { schoolId }, orderBy: { date: 'desc' } }),
    prisma.user.count({ where: { schoolId, role: 'teacher' } }),
    prisma.user.count({ where: { schoolId, role: 'student' } }),
    prisma.iotDevice.count({ where: { schoolId } }),
    prisma.syllabusDoc.count({ where: { schoolId, status: 'published' } }),
  ]);
  const cards = [
    { k: 'ไข่วันนี้', v: latestEgg?.count ?? 0 },
    { k: 'ครู / นักเรียน', v: `${teacherCount} / ${studentCount}` },
    { k: 'อุปกรณ์ IoT', v: `${iotDeviceCount} เครื่อง` },
    { k: 'เอกสารที่เผยแพร่', v: publishedCount },
  ];
  return (
    <div className="grid grid-cols-4 gap-3.5">
      {cards.map((c) => (
        <div key={c.k} className="rounded-card-sm border border-border bg-white px-5 py-[18px]">
          <div className="text-[12px] text-ink-faint">{c.k}</div>
          <div className="mt-1.5 text-[22px] font-extrabold text-primary">{c.v}</div>
        </div>
      ))}
    </div>
  );
}

async function UsersTab({
  schoolId,
  isManager,
  isTeacher,
  currentUserId,
}: {
  schoolId: string;
  isManager: boolean;
  isTeacher: boolean;
  currentUserId: string;
}) {
  const [teachers, students] = await Promise.all([
    prisma.user.findMany({ where: { schoolId, role: 'teacher' }, orderBy: { createdAt: 'asc' } }),
    prisma.user.findMany({ where: { schoolId, role: 'student' }, orderBy: { createdAt: 'desc' } }),
  ]);
  return (
    <div>
      <div className="mb-3.5 flex justify-end">
        <AddSchoolUserModal
          schools={[]}
          fixedSchoolId={schoolId}
          allowedRoles={isManager ? ['teacher', 'student'] : ['student']}
          triggerLabel="+ เพิ่มครู/นักเรียน"
        />
      </div>
      <div className="mb-2 mt-1.5 text-[13px] font-bold text-ink-muted">ครู</div>
      <div className="mb-[18px] overflow-hidden rounded-card-sm border border-border bg-white">
        {teachers.map((u) => (
          <div key={u.id} className="flex items-center justify-between border-t border-border-faint px-[18px] py-3 first:border-t-0">
            <div>
              <span className="font-semibold text-ink">{u.nameTh}</span>{' '}
              <span className="text-[11.5px] text-ink-faint">{u.nameEn}</span>
              {u.isMainContact && (
                <span className="ml-1.5 rounded-pill bg-warning-bg px-[7px] py-0.5 text-[10.5px] text-warning">
                  ผู้รับผิดชอบหลัก
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[12.5px] text-ink-faint">
                {u.phone} · {u.email}
              </span>
              {(isManager || isTeacher) && u.id !== currentUserId && (
                <RemoveButton url={`/api/users/${u.id}`} confirmMessage={`ลบบัญชี ${u.nameTh}?`} />
              )}
            </div>
          </div>
        ))}
        {teachers.length === 0 && <p className="p-4 text-sm text-ink-faint">ยังไม่มีครู</p>}
      </div>
      <div className="mb-2 text-[13px] font-bold text-ink-muted">นักเรียน</div>
      <div className="overflow-hidden rounded-card-sm border border-border bg-white">
        {students.map((u) => (
          <div key={u.id} className="flex items-center justify-between border-t border-border-faint px-[18px] py-3 first:border-t-0">
            <div>
              <span className="font-semibold text-ink">{u.nameTh}</span>{' '}
              <span className="text-[11.5px] text-ink-faint">{u.nameEn}</span>
            </div>
            <div className="flex items-center gap-3.5">
              <span className="text-[12.5px] text-ink-faint">{u.createdAt.toLocaleDateString('th-TH')}</span>
              {(isManager || isTeacher) && <RemoveButton url={`/api/users/${u.id}`} confirmMessage={`ลบบัญชี ${u.nameTh}?`} />}
            </div>
          </div>
        ))}
        {students.length === 0 && <p className="p-4 text-sm text-ink-faint">ยังไม่มีนักเรียน</p>}
      </div>
    </div>
  );
}

async function EggsTab({ schoolId, canEdit }: { schoolId: string; canEdit: boolean }) {
  const logs = await prisma.eggLog.findMany({ where: { schoolId }, orderBy: { date: 'desc' }, take: 7 });
  const ordered = [...logs].reverse();
  const max = Math.max(1, ...ordered.map((l) => l.count));
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-bold text-ink">ผลผลิตไข่ไก่ 7 วันล่าสุด</div>
        {canEdit && <AddEggLogModal schoolId={schoolId} />}
      </div>
      <div className="rounded-card border border-border bg-white p-6">
        {ordered.length === 0 ? (
          <p className="text-sm text-ink-faint">ยังไม่มีข้อมูล</p>
        ) : (
          <div className="flex h-[150px] items-end gap-3.5 border-b border-border-soft">
            {ordered.map((l) => (
              <div key={l.id} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <div className="text-[11px] font-bold text-primary">{l.count}</div>
                <div className="w-full rounded-t-md bg-primary" style={{ height: `${(l.count / max) * 120}px` }} />
                <div className="text-[11px] text-ink-faint">{DAY_LABEL[l.date.getDay()]}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

async function WaterTab({ schoolId, canEdit }: { schoolId: string; canEdit: boolean }) {
  const logs = await prisma.waterFeedLog.findMany({ where: { schoolId }, orderBy: { date: 'desc' } });
  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between">
        <div className="text-sm font-bold text-ink">น้ำและอาหารไก่ — ประวัติสั่งซื้อ/ใช้งาน</div>
        {canEdit && <AddWaterFeedLogModal schoolId={schoolId} />}
      </div>
      <div className="overflow-hidden rounded-card border border-border bg-white">
        <div className="grid grid-cols-[.9fr_.8fr_.9fr_.8fr] bg-eggshell px-[18px] py-3 text-[11.5px] font-bold uppercase text-ink-muted">
          <div>วันที่</div>
          <div>ประเภท</div>
          <div>รายการ</div>
          <div>ปริมาณ</div>
        </div>
        {logs.length === 0 && <p className="p-4 text-sm text-ink-faint">ยังไม่มีข้อมูล</p>}
        {logs.map((l) => (
          <div key={l.id} className="grid grid-cols-[.9fr_.8fr_.9fr_.8fr] border-t border-border-faint px-[18px] py-3 text-[13.5px]">
            <div className="text-ink-muted">{l.date.toLocaleDateString('th-TH')}</div>
            <div className="font-semibold text-ink">{l.type === 'water' ? 'น้ำ' : 'อาหารไก่'}</div>
            <div className="text-ink-muted">{l.action === 'purchase' ? 'สั่งซื้อ' : 'ใช้งาน'}</div>
            <div className="text-ink">{l.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function IotTab({ schoolId, canEdit }: { schoolId: string; canEdit: boolean }) {
  const [devices, latestReading] = await Promise.all([
    prisma.iotDevice.findMany({ where: { schoolId } }),
    prisma.iotReading.findFirst({ where: { device: { schoolId } }, orderBy: { recordedAt: 'desc' } }),
  ]);
  const cards = [
    { k: 'อุณหภูมิ', v: latestReading ? `${latestReading.temp}°C` : '—' },
    { k: 'ความชื้น', v: latestReading ? `${latestReading.humidity}%` : '—' },
    { k: 'น้ำที่ใช้วันนี้', v: latestReading ? `${latestReading.water} L` : '—' },
    { k: 'อาหารคงเหลือ', v: latestReading ? `${latestReading.feed} kg` : '—' },
  ];
  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-ink">แดชบอร์ด IoT</div>
          <p className="mt-1 text-xs text-ink-faint">
            ยังไม่มีอุปกรณ์ IoT เชื่อมต่อจริง — ค่าด้านล่างมาจากการบันทึกด้วยตนเอง
          </p>
        </div>
        {canEdit && <AddIotReadingModal schoolId={schoolId} devices={devices} />}
      </div>
      <div className="mb-[22px] grid grid-cols-4 gap-3.5">
        {cards.map((c) => (
          <div key={c.k} className="rounded-card-sm bg-primary-dark px-5 py-[18px] text-white">
            <div className="text-[11px] opacity-75">{c.k}</div>
            <div className="mt-1.5 text-2xl font-extrabold">{c.v}</div>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-card border border-border bg-white">
        <div className="grid grid-cols-[1.3fr_1fr_.7fr_1fr] bg-eggshell px-[18px] py-3 text-[11.5px] font-bold uppercase text-ink-muted">
          <div>อุปกรณ์</div>
          <div>ประเภท</div>
          <div>สถานะ</div>
          <div>ติดตั้งเมื่อ</div>
        </div>
        {devices.length === 0 && <p className="p-4 text-sm text-ink-faint">ยังไม่มีอุปกรณ์</p>}
        {devices.map((d) => (
          <div key={d.id} className="grid grid-cols-[1.3fr_1fr_.7fr_1fr] items-center border-t border-border-faint px-[18px] py-3 text-[13.5px]">
            <div className="font-semibold text-ink">{d.name}</div>
            <div className="text-ink-muted">{d.type}</div>
            <div>
              <span className="rounded-pill bg-success-bg px-2.5 py-[3px] text-[11px] font-bold text-success">{d.status}</span>
            </div>
            <div className="text-ink-muted">{d.installedAt.toLocaleDateString('th-TH')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function PhotosTab({ schoolId, canEdit }: { schoolId: string; canEdit: boolean }) {
  const photos = await prisma.photo.findMany({ where: { schoolId }, orderBy: { publishedAt: 'desc' } });
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-bold text-ink">คลังภาพโรงเรือน</div>
        {canEdit && <AddPhotoModal schoolId={schoolId} />}
      </div>
      <div className="grid grid-cols-4 gap-3.5">
        {photos.map((p) => (
          <div key={p.id} className="overflow-hidden rounded-card-sm border border-border bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded photos, not an optimizable static asset */}
            <img src={p.url} alt="" className="h-[100px] w-full object-cover" />
            <div className="px-3 py-[9px] text-[11.5px] text-ink-faint">เผยแพร่ {p.publishedAt.toLocaleDateString('th-TH')}</div>
          </div>
        ))}
        {photos.length === 0 && <p className="text-sm text-ink-faint">ยังไม่มีภาพ</p>}
      </div>
    </div>
  );
}

async function SyllabusTab({ schoolId, canEdit, isStudent }: { schoolId: string; canEdit: boolean; isStudent: boolean }) {
  const docs = await prisma.syllabusDoc.findMany({
    where: { schoolId, ...(canEdit ? {} : { status: 'published' }) },
    orderBy: { createdAt: 'desc' },
  });
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-bold text-ink">แผนการสอนและการบ้าน</div>
        {canEdit && <AddSyllabusModal schoolId={schoolId} />}
      </div>
      <div className="overflow-hidden rounded-card border border-border bg-white">
        {docs.length === 0 && <p className="p-4 text-sm text-ink-faint">ยังไม่มีเอกสาร</p>}
        {docs.map((d) => (
          <div key={d.id} className="flex items-center justify-between border-t border-border-faint px-5 py-3.5 first:border-t-0">
            <div>
              <div className="text-sm font-semibold text-ink">{d.title}</div>
              <div className="text-xs text-ink-faint">
                {SYLLABUS_TYPE_LABEL[d.type] ?? d.type} · {d.createdAt.toLocaleDateString('th-TH')}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`rounded-pill px-2.5 py-1 text-[11.5px] font-bold ${
                  d.status === 'published' ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning'
                }`}
              >
                {d.status === 'published' ? 'เผยแพร่แล้ว' : 'ฉบับร่าง'}
              </span>
              {canEdit && <TogglePublishButton schoolId={schoolId} docId={d.id} published={d.status === 'published'} />}
              {isStudent && d.status === 'published' && (
                <a href={d.fileUrl} className="text-xs font-bold text-primary" download>
                  ดาวน์โหลด
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function NewsTab({ schoolId, canEdit }: { schoolId: string; canEdit: boolean }) {
  const news = await prisma.news.findMany({ where: { schoolId }, orderBy: { createdAt: 'desc' } });
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-bold text-ink">ข่าวสารของโรงเรียน</div>
        {canEdit && <AddNewsModal fixedSchoolId={schoolId} />}
      </div>
      <div className="grid gap-3">
        {news.length === 0 && <p className="text-sm text-ink-faint">ยังไม่มีข่าว</p>}
        {news.map((n) => (
          <div key={n.id} className="rounded-card-sm border border-border bg-white px-[18px] py-4">
            <div className="text-[15px] font-bold text-ink">{n.title}</div>
            <div className="my-1 text-xs text-ink-faint">{n.createdAt.toLocaleDateString('th-TH')}</div>
            <p className="text-[13.5px] leading-relaxed text-ink-body">{n.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

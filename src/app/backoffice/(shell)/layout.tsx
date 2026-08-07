import { requireStaffPage } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { BackofficeShell, type ShellNavItem } from '@/components/backoffice/Shell';
import { ROLE_LABEL, ROLE_SUB } from '@/lib/roleLabels';

const LABELS: Record<string, string> = {
  overview: 'ภาพรวม',
  applications: 'ใบสมัคร',
  access: 'สิทธิ์การเข้าถึง',
  project_results: 'ผลลัพธ์โครงการ',
  schools: 'โรงเรียน',
  learning: 'คลังความรู้',
  news: 'ข่าวสาร',
  settings: 'ตั้งค่า',
  my_school: 'โรงเรียนของฉัน',
};

const HREFS: Record<string, string> = {
  overview: '/backoffice',
  applications: '/backoffice/applications',
  access: '/backoffice/access',
  project_results: '/backoffice/project-results',
  schools: '/backoffice/schools',
  learning: '/backoffice/learning',
  news: '/backoffice/news',
  settings: '/backoffice/settings',
};

export default async function BackofficeShellLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaffPage();

  const isDevAdmin = user.role === 'developer' || user.role === 'admin';
  const isManager = isDevAdmin || user.role === 'cp';

  const navKeys = isManager
    ? ['overview', 'applications', 'access', 'project_results', 'schools', 'learning', 'news', ...(isDevAdmin ? ['settings'] : [])]
    : ['overview', 'my_school'];

  const navItems: ShellNavItem[] = navKeys.map((key) => ({
    key,
    label: LABELS[key],
    href: key === 'my_school' ? `/backoffice/schools/${user.schoolId}` : HREFS[key],
  }));

  let userSub = ROLE_SUB[user.role];
  if (!isManager && user.schoolId) {
    const school = await prisma.school.findUnique({ where: { id: user.schoolId }, select: { name: true } });
    userSub = `${ROLE_LABEL[user.role]} — ${school?.name ?? ''}`;
  }

  return (
    <BackofficeShell navItems={navItems} userName={user.nameTh} userSub={userSub}>
      {children}
    </BackofficeShell>
  );
}

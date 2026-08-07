import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, getSessionUser, requireRole } from '@/lib/rbac';

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export const GET = apiHandler(async () => {
  requireRole(await getSessionUser(), ['developer', 'admin', 'cp']);

  const schools = await prisma.school.findMany({
    include: { _count: { select: { users: true } }, users: { select: { role: true } } },
    orderBy: { name: 'asc' },
  });

  const header = ['name', 'location', 'code', 'joinedDate', 'teacherCount', 'studentCount'];
  const rows = schools.map((s) => {
    const teacherCount = s.users.filter((u) => u.role === 'teacher').length;
    const studentCount = s.users.filter((u) => u.role === 'student').length;
    return [s.name, s.location, s.code, s.joinedDate.toISOString().slice(0, 10), String(teacherCount), String(studentCount)]
      .map(csvEscape)
      .join(',');
  });
  const csv = [header.join(','), ...rows].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="schools-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
});

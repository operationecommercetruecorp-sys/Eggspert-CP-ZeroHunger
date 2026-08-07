import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DAY_LABEL = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

// Public: production history is not sensitive (it's what the public "Find your school" card
// already shows an eggs/day figure for) — only temp/humidity/water/feed insights are gated.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const school = await prisma.school.findUnique({ where: { id: params.id } });
  if (!school) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const logs = await prisma.eggLog.findMany({ where: { schoolId: params.id }, orderBy: { date: 'desc' }, take: 7 });
  const production = [...logs].reverse().map((l) => ({ day: DAY_LABEL[l.date.getDay()], count: l.count }));

  return NextResponse.json({
    id: school.id,
    name: school.name,
    location: school.location,
    joinedYearAD: school.joinedDate.getFullYear(),
    production,
  });
}

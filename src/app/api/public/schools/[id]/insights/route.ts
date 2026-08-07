import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, getSessionUser, requireSchoolSession } from '@/lib/rbac';

// The "Find your school" login gate: only a school session scoped to this exact schoolId
// may read its live insights.
export const GET = apiHandler(async (_req: Request, { params }: { params: { id: string } }) => {
  requireSchoolSession(await getSessionUser(), params.id);

  const reading = await prisma.iotReading.findFirst({
    where: { device: { schoolId: params.id } },
    orderBy: { recordedAt: 'desc' },
  });

  return NextResponse.json({
    temp: reading?.temp ?? null,
    humidity: reading?.humidity ?? null,
    water: reading?.water ?? null,
    feed: reading?.feed ?? null,
  });
});

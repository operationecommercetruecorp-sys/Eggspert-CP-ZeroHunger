import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, getSessionUser, requireRole, requireSchoolAccess } from '@/lib/rbac';
import { eggLogSchema } from '@/lib/validation';

export const POST = apiHandler(async (req: Request, { params }: { params: { id: string } }) => {
  const actor = requireRole(await getSessionUser(), ['developer', 'admin', 'cp', 'teacher']);
  requireSchoolAccess(actor, params.id);
  const body = eggLogSchema.parse(await req.json());

  const log = await prisma.eggLog.create({
    data: { schoolId: params.id, date: new Date(body.date), count: body.count },
  });
  return NextResponse.json({ log }, { status: 201 });
});

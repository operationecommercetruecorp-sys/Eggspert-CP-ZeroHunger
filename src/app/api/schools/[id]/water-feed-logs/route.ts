import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, getSessionUser, requireRole, requireSchoolAccess } from '@/lib/rbac';
import { waterFeedLogSchema } from '@/lib/validation';

export const POST = apiHandler(async (req: Request, { params }: { params: { id: string } }) => {
  const actor = requireRole(await getSessionUser(), ['developer', 'admin', 'cp', 'teacher']);
  requireSchoolAccess(actor, params.id);
  const body = waterFeedLogSchema.parse(await req.json());

  const log = await prisma.waterFeedLog.create({
    data: { schoolId: params.id, date: new Date(body.date), type: body.type, action: body.action, amount: body.amount },
  });
  return NextResponse.json({ log }, { status: 201 });
});

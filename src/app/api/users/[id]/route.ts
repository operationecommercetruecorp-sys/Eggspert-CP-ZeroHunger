import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, getSessionUser, requireRole, ForbiddenError } from '@/lib/rbac';

export const DELETE = apiHandler(async (_req: Request, { params }: { params: { id: string } }) => {
  const actor = requireRole(await getSessionUser(), ['developer', 'admin', 'cp', 'teacher']);
  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (target.id === actor.id) {
    throw new ForbiddenError('You cannot remove your own account');
  }

  if ((target.role === 'admin' || target.role === 'cp') && !['developer', 'admin'].includes(actor.role)) {
    throw new ForbiddenError('Only developer/admin can remove admin or CP accounts');
  }
  if (target.role === 'teacher' && !['developer', 'admin', 'cp'].includes(actor.role)) {
    if (actor.role !== 'teacher' || target.schoolId !== actor.schoolId) {
      throw new ForbiddenError('Teachers can only remove other teachers at their own school');
    }
  }
  if (target.role === 'student' && actor.role === 'teacher' && target.schoolId !== actor.schoolId) {
    throw new ForbiddenError('Teachers can only remove students at their own school');
  }

  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
});

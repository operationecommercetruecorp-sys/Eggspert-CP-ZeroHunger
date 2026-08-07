import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, getSessionUser, requireRole } from '@/lib/rbac';

export const DELETE = apiHandler(async (_req: Request, { params }: { params: { id: string } }) => {
  requireRole(await getSessionUser(), ['developer', 'admin']);
  await prisma.notificationEmail.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
});

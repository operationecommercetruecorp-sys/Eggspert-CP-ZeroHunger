import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiHandler, getSessionUser, requireRole } from '@/lib/rbac';

const bodySchema = z.object({ status: z.enum(['APPROVED', 'REJECTED']) });

export const PATCH = apiHandler(async (req: Request, { params }: { params: { id: string } }) => {
  requireRole(await getSessionUser(), ['developer', 'admin', 'cp']);
  const { status } = bodySchema.parse(await req.json());
  const application = await prisma.application.update({ where: { id: params.id }, data: { status } });
  return NextResponse.json({ application });
});

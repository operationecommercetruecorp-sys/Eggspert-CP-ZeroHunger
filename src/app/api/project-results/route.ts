import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, getSessionUser, requireRole } from '@/lib/rbac';
import { createProjectResultSchema } from '@/lib/validation';

export const POST = apiHandler(async (req: Request) => {
  requireRole(await getSessionUser(), ['developer', 'admin', 'cp']);
  const body = createProjectResultSchema.parse(await req.json());

  const result = await prisma.projectResult.create({
    data: { ...body, updateDate: new Date(body.updateDate) },
  });
  return NextResponse.json({ result }, { status: 201 });
});

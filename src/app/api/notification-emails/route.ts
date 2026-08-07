import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, getSessionUser, requireRole } from '@/lib/rbac';
import { emailSchema } from '@/lib/validation';

export const POST = apiHandler(async (req: Request) => {
  requireRole(await getSessionUser(), ['developer', 'admin']);
  const { email } = emailSchema.parse(await req.json());
  const record = await prisma.notificationEmail.create({ data: { email: email.toLowerCase().trim() } });
  return NextResponse.json({ record }, { status: 201 });
});

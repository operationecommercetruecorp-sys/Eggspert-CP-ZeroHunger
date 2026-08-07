import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { apiHandler, getSessionUser, requireRole } from '@/lib/rbac';
import { createSchoolSchema } from '@/lib/validation';
import { generatePassword } from '@/lib/generatePassword';
import { generateUniqueSchoolCode } from '@/lib/schoolCode';

export const POST = apiHandler(async (req: Request) => {
  requireRole(await getSessionUser(), ['developer', 'admin', 'cp']);
  const body = createSchoolSchema.parse(await req.json());

  const code = await generateUniqueSchoolCode();
  const password = generatePassword();
  const passwordHash = await bcrypt.hash(password, 10);

  const school = await prisma.school.create({
    data: { name: body.name, location: body.location, code, passwordHash },
  });

  return NextResponse.json({ school, code, password }, { status: 201 });
});

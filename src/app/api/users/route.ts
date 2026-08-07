import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiHandler, getSessionUser, requireRole, ForbiddenError } from '@/lib/rbac';
import { createStaffSchema, createSchoolUserSchema } from '@/lib/validation';
import { generatePassword } from '@/lib/generatePassword';

const bodySchema = z.discriminatedUnion('role', [
  createStaffSchema.extend({ role: z.literal('admin') }),
  createStaffSchema.extend({ role: z.literal('cp') }),
  createSchoolUserSchema.extend({ role: z.literal('teacher') }),
  createSchoolUserSchema.extend({ role: z.literal('student') }),
]);

export const POST = apiHandler(async (req: Request) => {
  const actor = requireRole(await getSessionUser(), ['developer', 'admin', 'cp', 'teacher']);
  const body = bodySchema.parse(await req.json());

  if ((body.role === 'admin' || body.role === 'cp') && !['developer', 'admin'].includes(actor.role)) {
    throw new ForbiddenError('Only developer/admin can add admin or CP accounts');
  }
  if (body.role === 'teacher' && !['developer', 'admin', 'cp'].includes(actor.role)) {
    throw new ForbiddenError('Only developer/admin/cp can add teacher accounts');
  }
  if (body.role === 'student' && actor.role === 'teacher' && body.schoolId !== actor.schoolId) {
    throw new ForbiddenError('Teachers can only add students to their own school');
  }

  const password = generatePassword();
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.$transaction(async (tx) => {
    if (body.role === 'admin') {
      const count = await tx.user.count({ where: { role: 'admin' } });
      if (count >= 5) throw new ForbiddenError('Admin seats are at the 5-account cap');
      return tx.user.create({
        data: { role: 'admin', email: body.email.toLowerCase().trim(), passwordHash, nameTh: body.nameTh, nameEn: body.nameEn },
      });
    }
    if (body.role === 'cp') {
      return tx.user.create({
        data: { role: 'cp', email: body.email.toLowerCase().trim(), passwordHash, nameTh: body.nameTh, nameEn: body.nameEn },
      });
    }
    return tx.user.create({
      data: {
        role: body.role,
        email: body.email.toLowerCase().trim(),
        passwordHash,
        nameTh: body.nameTh,
        nameEn: body.nameEn,
        phone: body.phone || null,
        schoolId: body.schoolId,
        isMainContact: body.role === 'teacher' ? !!body.isMainContact : false,
      },
    });
  });

  return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role }, password }, { status: 201 });
});

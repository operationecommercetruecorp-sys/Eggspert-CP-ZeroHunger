import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/rbac';
import { generatePassword } from '@/lib/generatePassword';
import { sendPasswordResetEmail } from '@/lib/email';

const bodySchema = z.object({ email: z.string().email() });

const COOLDOWN_MS = 5 * 60 * 1000;

// Public endpoint — the backoffice login page's "forgot password?" link. No auth: that's the point.
// Always returns the same generic response regardless of whether the email exists, so this can't
// be used to enumerate staff accounts.
export const POST = apiHandler(async (req: Request) => {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && (!user.passwordResetAt || Date.now() - user.passwordResetAt.getTime() > COOLDOWN_MS)) {
    const newPassword = generatePassword();
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, passwordResetAt: new Date() },
    });
    await sendPasswordResetEmail(email, newPassword);
  }

  return NextResponse.json({ ok: true });
});

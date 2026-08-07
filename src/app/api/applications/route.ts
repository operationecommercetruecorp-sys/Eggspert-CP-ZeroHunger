import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { applicationSchema } from '@/lib/validation';
import { sendNewApplicationEmail } from '@/lib/email';

// Public endpoint — the "Apply to program" form on the homepage. No auth: anyone may apply.
export async function POST(req: Request) {
  const parsed = applicationSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const application = await prisma.application.create({ data: parsed.data });
  await sendNewApplicationEmail(application);

  return NextResponse.json({ application }, { status: 201 });
}

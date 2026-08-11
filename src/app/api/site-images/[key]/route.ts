import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, getSessionUser, requireRole } from '@/lib/rbac';
import { storage } from '@/lib/storage';

const VALID_KEYS = new Set(['teacher', 'student', 'project']);

export const POST = apiHandler(async (req: Request, { params }: { params: { key: string } }) => {
  requireRole(await getSessionUser(), ['developer', 'admin']);
  if (!VALID_KEYS.has(params.key)) {
    return NextResponse.json({ error: 'Unknown image key' }, { status: 400 });
  }

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'ต้องแนบไฟล์ภาพ' }, { status: 400 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const { url } = await storage.upload({ buffer, filename: file.name }, 'site-images');

  const image = await prisma.siteImage.upsert({
    where: { key: params.key },
    create: { key: params.key, url },
    update: { url },
  });
  return NextResponse.json({ image }, { status: 201 });
});

export const DELETE = apiHandler(async (_req: Request, { params }: { params: { key: string } }) => {
  requireRole(await getSessionUser(), ['developer', 'admin']);
  if (!VALID_KEYS.has(params.key)) {
    return NextResponse.json({ error: 'Unknown image key' }, { status: 400 });
  }

  await prisma.siteImage.deleteMany({ where: { key: params.key } });
  return NextResponse.json({ ok: true });
});

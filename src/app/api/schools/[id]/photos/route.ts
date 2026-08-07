import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, getSessionUser, requireRole, requireSchoolAccess } from '@/lib/rbac';
import { storage } from '@/lib/storage';

export const POST = apiHandler(async (req: Request, { params }: { params: { id: string } }) => {
  const actor = requireRole(await getSessionUser(), ['developer', 'admin', 'cp', 'teacher']);
  requireSchoolAccess(actor, params.id);

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'ต้องแนบไฟล์ภาพ' }, { status: 400 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const { url } = await storage.upload({ buffer, filename: file.name }, `schools/${params.id}/photos`);

  const photo = await prisma.photo.create({ data: { schoolId: params.id, url } });
  return NextResponse.json({ photo }, { status: 201 });
});

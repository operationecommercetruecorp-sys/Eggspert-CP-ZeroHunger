import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, getSessionUser, requireRole, requireSchoolAccess } from '@/lib/rbac';
import { storage } from '@/lib/storage';
import { syllabusSchema } from '@/lib/validation';

const TYPE_LABEL: Record<string, string> = {
  lesson_plan: 'แผนการสอน',
  worksheet: 'ใบงาน',
  quiz: 'แบบทดสอบ',
};

export const POST = apiHandler(async (req: Request, { params }: { params: { id: string } }) => {
  const actor = requireRole(await getSessionUser(), ['developer', 'admin', 'cp', 'teacher']);
  requireSchoolAccess(actor, params.id);

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'ต้องแนบไฟล์เอกสาร' }, { status: 400 });
  }
  const body = syllabusSchema.parse({ title: form.get('title'), type: form.get('type') });

  const buffer = Buffer.from(await file.arrayBuffer());
  const { url } = await storage.upload({ buffer, filename: file.name }, `schools/${params.id}/syllabus`);

  const doc = await prisma.syllabusDoc.create({
    data: { schoolId: params.id, title: body.title, type: TYPE_LABEL[body.type], fileUrl: url, status: 'draft' },
  });
  return NextResponse.json({ doc }, { status: 201 });
});

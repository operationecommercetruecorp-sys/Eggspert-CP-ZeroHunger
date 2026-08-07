import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, getSessionUser, requireRole, requireSchoolAccess } from '@/lib/rbac';

export const PATCH = apiHandler(
  async (req: Request, { params }: { params: { id: string; docId: string } }) => {
    const actor = requireRole(await getSessionUser(), ['developer', 'admin', 'cp', 'teacher']);
    requireSchoolAccess(actor, params.id);

    const doc = await prisma.syllabusDoc.findUnique({ where: { id: params.docId } });
    if (!doc || doc.schoolId !== params.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const nextStatus = doc.status === 'published' ? 'draft' : 'published';
    const updated = await prisma.syllabusDoc.update({ where: { id: params.docId }, data: { status: nextStatus } });
    return NextResponse.json({ doc: updated });
  },
);

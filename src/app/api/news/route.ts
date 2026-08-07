import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, getSessionUser, requireRole, requireSchoolAccess } from '@/lib/rbac';
import { newsSchema } from '@/lib/validation';
import { indexSource, newsIndexContent } from '@/lib/ai/index-content';

export const POST = apiHandler(async (req: Request) => {
  const actor = requireRole(await getSessionUser(), ['developer', 'admin', 'cp', 'teacher']);
  const body = newsSchema.parse(await req.json());
  if (!body.schoolId) {
    return NextResponse.json({ error: 'schoolId is required' }, { status: 400 });
  }
  requireSchoolAccess(actor, body.schoolId);

  const news = await prisma.news.create({
    data: { schoolId: body.schoolId, title: body.title, body: body.body },
  });
  await indexSource('news', news.id, newsIndexContent(news));
  return NextResponse.json({ news }, { status: 201 });
});

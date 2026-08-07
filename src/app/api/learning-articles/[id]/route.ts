import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, getSessionUser, requireRole } from '@/lib/rbac';
import { createLearningArticleSchema } from '@/lib/validation';

export const PATCH = apiHandler(async (req: Request, { params }: { params: { id: string } }) => {
  requireRole(await getSessionUser(), ['developer', 'admin', 'cp']);
  const body = createLearningArticleSchema.parse(await req.json());
  const article = await prisma.learningArticle.update({ where: { id: params.id }, data: body });
  return NextResponse.json({ article });
});

export const DELETE = apiHandler(async (_req: Request, { params }: { params: { id: string } }) => {
  requireRole(await getSessionUser(), ['developer', 'admin', 'cp']);
  await prisma.learningArticle.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
});

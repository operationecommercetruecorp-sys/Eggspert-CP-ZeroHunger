import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, getSessionUser, requireRole } from '@/lib/rbac';
import { createLearningArticleSchema } from '@/lib/validation';
import { indexSource, articleIndexContent } from '@/lib/ai/index-content';

export const POST = apiHandler(async (req: Request) => {
  requireRole(await getSessionUser(), ['developer', 'admin', 'cp']);
  const body = createLearningArticleSchema.parse(await req.json());
  const article = await prisma.learningArticle.create({ data: body });
  await indexSource('article', article.id, articleIndexContent(article));
  return NextResponse.json({ article }, { status: 201 });
});

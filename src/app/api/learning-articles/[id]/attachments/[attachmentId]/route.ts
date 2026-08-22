import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, getSessionUser, requireRole } from '@/lib/rbac';

export const DELETE = apiHandler(
  async (_req: Request, { params }: { params: { id: string; attachmentId: string } }) => {
    requireRole(await getSessionUser(), ['developer', 'admin', 'cp']);
    await prisma.learningArticleAttachment.deleteMany({
      where: { id: params.attachmentId, articleId: params.id },
    });
    return NextResponse.json({ ok: true });
  },
);

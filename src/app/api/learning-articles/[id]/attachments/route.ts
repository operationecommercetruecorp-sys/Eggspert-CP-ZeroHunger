import { NextResponse } from 'next/server';
import path from 'node:path';
import { prisma } from '@/lib/prisma';
import { apiHandler, getSessionUser, requireRole } from '@/lib/rbac';
import { storage } from '@/lib/storage';

const ALLOWED_EXTENSIONS = new Set(['.doc', '.docx', '.pdf', '.xlsx', '.pptx', '.csv', '.html']);

export const POST = apiHandler(async (req: Request, { params }: { params: { id: string } }) => {
  requireRole(await getSessionUser(), ['developer', 'admin', 'cp']);

  const form = await req.formData();
  const file = form.get('file');
  const linkUrl = form.get('linkUrl');

  if (file instanceof File) {
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: 'รองรับเฉพาะไฟล์ .doc, .docx, .pdf, .xlsx, .pptx, .csv, .html' },
        { status: 400 },
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const { url } = await storage.upload({ buffer, filename: file.name }, `learning-articles/${params.id}`);
    const attachment = await prisma.learningArticleAttachment.create({
      data: { articleId: params.id, kind: 'file', label: file.name, url, fileType: ext.slice(1) },
    });
    return NextResponse.json({ attachment }, { status: 201 });
  }

  if (typeof linkUrl === 'string' && linkUrl.trim()) {
    let parsed: URL;
    try {
      parsed = new URL(linkUrl.trim());
    } catch {
      return NextResponse.json({ error: 'ลิงก์ไม่ถูกต้อง' }, { status: 400 });
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return NextResponse.json({ error: 'ลิงก์ไม่ถูกต้อง' }, { status: 400 });
    }
    const attachment = await prisma.learningArticleAttachment.create({
      data: { articleId: params.id, kind: 'link', label: parsed.toString(), url: parsed.toString(), fileType: null },
    });
    return NextResponse.json({ attachment }, { status: 201 });
  }

  return NextResponse.json({ error: 'ต้องแนบไฟล์หรือระบุลิงก์' }, { status: 400 });
});

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { apiHandler, getSessionUser, requireRole } from '@/lib/rbac';
import { generatePassword } from '@/lib/generatePassword';
import { generateUniqueSchoolCode } from '@/lib/schoolCode';
import { parseCsv } from '@/lib/csv';

export const POST = apiHandler(async (req: Request) => {
  requireRole(await getSessionUser(), ['developer', 'admin', 'cp']);

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'ต้องแนบไฟล์ CSV' }, { status: 400 });
  }

  const text = await file.text();
  const rows = parseCsv(text);
  if (rows.length === 0) return NextResponse.json({ error: 'ไฟล์ว่างเปล่า' }, { status: 400 });

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const nameIdx = header.indexOf('name');
  const locationIdx = header.indexOf('location');
  const dataRows = nameIdx === -1 || locationIdx === -1 ? rows : rows.slice(1);
  const nIdx = nameIdx === -1 ? 0 : nameIdx;
  const lIdx = locationIdx === -1 ? 1 : locationIdx;

  let created = 0;
  const errors: string[] = [];

  for (const row of dataRows) {
    const name = row[nIdx]?.trim();
    const location = row[lIdx]?.trim();
    if (!name || !location) {
      errors.push(`Skipped row: ${row.join(',')}`);
      continue;
    }
    const code = await generateUniqueSchoolCode();
    const passwordHash = await bcrypt.hash(generatePassword(), 10);
    await prisma.school.create({ data: { name, location, code, passwordHash } });
    created++;
  }

  return NextResponse.json({ created, errors });
});

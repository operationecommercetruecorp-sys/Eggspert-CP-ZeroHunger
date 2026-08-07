import { randomInt } from 'node:crypto';
import { prisma } from '@/lib/prisma';

/** Generates a unique school login code like "SCH-4821", retrying on collision. */
export async function generateUniqueSchoolCode(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const code = `SCH-${randomInt(1000, 9999)}`;
    const existing = await prisma.school.findUnique({ where: { code } });
    if (!existing) return code;
  }
  throw new Error('Could not generate a unique school code');
}

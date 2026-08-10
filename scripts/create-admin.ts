/**
 * One-off bootstrap for a fresh production database: creates the first real developer/admin
 * account with a securely generated password. Unlike prisma/seed.ts (which is dev-only and
 * creates accounts with predictable weak passwords), this is safe to run against production —
 * it makes exactly one account, with a random password printed once.
 *
 * Usage:
 *   npx tsx scripts/create-admin.ts --email=you@org.com --nameTh="ชื่อ" --nameEn="Name" [--role=developer|admin]
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generatePassword } from '../src/lib/generatePassword';

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const found = process.argv.find((a) => a.startsWith(prefix));
  return found?.slice(prefix.length);
}

async function main() {
  const email = arg('email');
  const nameTh = arg('nameTh');
  const nameEn = arg('nameEn');
  const role = arg('role') ?? 'developer';

  if (!email || !nameTh || !nameEn) {
    console.error(
      'Usage: npx tsx scripts/create-admin.ts --email=you@org.com --nameTh="ชื่อ" --nameEn="Name" [--role=developer|admin]',
    );
    process.exit(1);
  }
  if (role !== 'developer' && role !== 'admin') {
    console.error('--role must be "developer" or "admin"');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      console.error(`A user with email ${email} already exists (id: ${existing.id}). Nothing created.`);
      process.exit(1);
    }

    const password = generatePassword();
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { role, email: email.toLowerCase().trim(), passwordHash, nameTh, nameEn },
    });

    console.log('Account created:');
    console.log(`  id:       ${user.id}`);
    console.log(`  role:     ${user.role}`);
    console.log(`  email:    ${user.email}`);
    console.log(`  password: ${password}`);
    console.log('\nThis password is shown once — store it in a password manager now. Sign in at /backoffice/login.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

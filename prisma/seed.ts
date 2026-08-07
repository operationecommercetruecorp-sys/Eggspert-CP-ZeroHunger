import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const devPasswordHash = await bcrypt.hash('developer123', 10);
  await prisma.user.upsert({
    where: { email: 'developer@eggspert.local' },
    update: {},
    create: {
      role: 'developer',
      email: 'developer@eggspert.local',
      passwordHash: devPasswordHash,
      nameTh: 'ผู้ดูแลระบบ',
      nameEn: 'Developer Account',
    },
  });

  const school = await prisma.school.upsert({
    where: { code: 'DEMO001' },
    update: {},
    create: {
      name: 'Demo Elementary School',
      location: 'Bangkok',
      code: 'DEMO001',
      passwordHash: await bcrypt.hash('school123', 10),
    },
  });

  const teacherPasswordHash = await bcrypt.hash('teacher123', 10);
  await prisma.user.upsert({
    where: { email: 'teacher@eggspert.local' },
    update: {},
    create: {
      role: 'teacher',
      email: 'teacher@eggspert.local',
      passwordHash: teacherPasswordHash,
      nameTh: 'ครูตัวอย่าง',
      nameEn: 'Demo Teacher',
      schoolId: school.id,
      isMainContact: true,
    },
  });

  console.log('Seed complete.');
  console.log('  Staff login:  developer@eggspert.local / developer123');
  console.log('  Teacher login: teacher@eggspert.local / teacher123');
  console.log('  School login: DEMO001 / school123');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = (pw: string) => bcrypt.hash(pw, 10);

  await prisma.user.upsert({
    where: { email: 'developer@eggspert.local' },
    update: {},
    create: {
      role: 'developer',
      email: 'developer@eggspert.local',
      passwordHash: await hash('developer123'),
      nameTh: 'ผู้ดูแลระบบ',
      nameEn: 'Developer Account',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@eggspert.local' },
    update: {},
    create: {
      role: 'admin',
      email: 'admin@eggspert.local',
      passwordHash: await hash('admin123'),
      nameTh: 'สุดา ทองดี',
      nameEn: 'Suda Thongdee',
    },
  });

  await prisma.user.upsert({
    where: { email: 'cp@eggspert.local' },
    update: {},
    create: {
      role: 'cp',
      email: 'cp@eggspert.local',
      passwordHash: await hash('cp123'),
      nameTh: 'นภัส ชูเกียรติ',
      nameEn: 'Napat Chukiat',
    },
  });

  const school = await prisma.school.upsert({
    where: { code: 'DEMO001' },
    update: {},
    create: {
      name: 'โรงเรียนบ้านหนองบัว',
      location: 'อ.เมือง จ.ขอนแก่น',
      code: 'DEMO001',
      passwordHash: await hash('school123'),
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@eggspert.local' },
    update: {},
    create: {
      role: 'teacher',
      email: 'teacher@eggspert.local',
      passwordHash: await hash('teacher123'),
      nameTh: 'ครูสมหญิง ใจดี',
      nameEn: 'Somying Jaidee',
      schoolId: school.id,
      isMainContact: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'student@eggspert.local' },
    update: {},
    create: {
      role: 'student',
      email: 'student@eggspert.local',
      passwordHash: await hash('student123'),
      nameTh: 'กิตติ แสงทอง',
      nameEn: 'Kitti Saengthong',
      schoolId: school.id,
    },
  });

  const existingApplications = await prisma.application.count();
  if (existingApplications === 0) {
    await prisma.application.createMany({
      data: [
        {
          name: 'ครูมาลี พรหมมา',
          school: 'โรงเรียนบ้านโคกสูง',
          phone: '089-345-6712',
          email: 'malee@school.ac.th',
          address: 'ต.โคกสูง อ.เมือง จ.ขอนแก่น',
          status: 'PENDING',
        },
        {
          name: 'ครูประยุทธ วงศ์ทอง',
          school: 'โรงเรียนบ้านสันติสุข',
          phone: '086-567-8123',
          email: 'prayut@school.ac.th',
          address: 'ต.สันติสุข อ.แม่ริม จ.เชียงใหม่',
          status: 'PENDING',
        },
      ],
    });
  }

  const existingResults = await prisma.projectResult.count();
  if (existingResults === 0) {
    await prisma.projectResult.create({
      data: {
        updateDate: new Date('2025-01-01'),
        provinces: 74,
        countries: 1,
        schoolCount: 1018,
        studentCount: 229502,
        staffCount: 17447,
        communityCount: 2650,
        eggsPerCycle: '26 ล้านฟอง',
      },
    });
  }

  const existingArticles = await prisma.learningArticle.count();
  if (existingArticles === 0) {
    await prisma.learningArticle.createMany({
      data: [
        {
          tag: 'โภชนาการ',
          title: 'คุณค่าทางโภชนาการของไข่ไก่',
          body: 'ไข่ไก่หนึ่งฟองให้โปรตีนประมาณ 6 กรัม พลังงาน 78 กิโลแคลอรี และมีวิตามิน A, D, E, B12',
        },
        {
          tag: 'มาตรฐาน',
          title: 'เบอร์ไข่ ความสดใหม่ และการเก็บรักษา',
          body: 'ไข่ไก่แบ่งเป็นเบอร์ 0-5 ตามน้ำหนัก ทดสอบความสดด้วยการแช่น้ำ เก็บรักษาได้ 3-5 สัปดาห์ในอุณหภูมิห้องเย็น',
        },
      ],
    });
  }

  const existingEggLogs = await prisma.eggLog.count({ where: { schoolId: school.id } });
  if (existingEggLogs === 0) {
    const today = new Date();
    await prisma.eggLog.createMany({
      data: [241, 255, 249, 262, 258, 270, 268].map((count, i) => ({
        schoolId: school.id,
        date: new Date(today.getTime() - (6 - i) * 86400000),
        count,
      })),
    });
  }

  const existingDevices = await prisma.iotDevice.count({ where: { schoolId: school.id } });
  if (existingDevices === 0) {
    await prisma.iotDevice.createMany({
      data: [
        { schoolId: school.id, name: 'เซ็นเซอร์อุณหภูมิ', type: 'Temperature', status: 'online', deviceKey: 'demo-temp-01', installedAt: new Date('2023-03-01') },
        { schoolId: school.id, name: 'เซ็นเซอร์ความชื้น', type: 'Humidity', status: 'online', deviceKey: 'demo-humidity-01', installedAt: new Date('2023-03-01') },
        { schoolId: school.id, name: 'มิเตอร์น้ำ', type: 'Water meter', status: 'online', deviceKey: 'demo-water-01', installedAt: new Date('2023-06-15') },
      ],
    });
  }

  console.log('Seed complete.');
  console.log('  Developer login: developer@eggspert.local / developer123');
  console.log('  Admin login:     admin@eggspert.local / admin123');
  console.log('  CP login:        cp@eggspert.local / cp123');
  console.log('  Teacher login:   teacher@eggspert.local / teacher123');
  console.log('  Student login:   student@eggspert.local / student123');
  console.log('  School login:    DEMO001 / school123');
  console.log(`  Teacher: ${teacher.nameEn}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

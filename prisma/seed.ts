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
          body: 'ไข่ไก่ 1 ฟอง (50 กรัม) ให้พลังงานราว 70-78 กิโลแคลอรี พร้อมโปรตีนคุณภาพสูง วิตามิน A D E B12 โคลีน และลูทีนที่ช่วยการมองเห็น',
        },
        {
          tag: 'มาตรฐาน',
          title: 'เบอร์ไข่ ความสดใหม่ และการเก็บรักษา',
          body: 'ไข่ไก่ไทยแบ่งเป็น 6 เบอร์ตามน้ำหนัก ตั้งแต่เบอร์ 0 (จัมโบ้ ≥70 กรัม) ถึงเบอร์ 5 (จิ๋ว 45-49 กรัม) ทดสอบความสดง่ายๆ ด้วยการหย่อนไข่ลงน้ำ เก็บในตู้เย็นได้นาน 3-5 สัปดาห์',
        },
        {
          tag: 'การเลี้ยง',
          title: 'เริ่มเลี้ยงไก่ไข่ในโรงเรียน',
          body: 'โครงการสนับสนุนโรงเรือน กรงตับ ระบบน้ำ และพันธุ์ไก่สาว เลี้ยงต่อเนื่อง 60 สัปดาห์ต่อรุ่น ให้แสงสว่าง 16 ชั่วโมงต่อวันเพื่อกระตุ้นการไข่',
        },
        {
          tag: 'อาหารไก่',
          title: 'การให้อาหารและน้ำ',
          body: 'ไก่ไข่กินอาหารเฉลี่ย 110-120 กรัมต่อตัวต่อวัน และต้องมีน้ำสะอาดตลอดเวลาในปริมาณราว 2 เท่าของอาหารที่กิน เพื่อให้ไข่ดกและสม่ำเสมอ',
        },
        {
          tag: 'เทคโนโลยี',
          title: 'ติดตั้งอุปกรณ์ IoT ในโรงเรือน',
          body: 'เซ็นเซอร์วัดอุณหภูมิและความชื้น มิเตอร์วัดปริมาณน้ำ ส่งข้อมูลขึ้นแดชบอร์ดของโรงเรียนแบบเรียลไทม์ ช่วยครูและนักเรียนติดตามสภาพโรงเรือนได้ทุกที่',
        },
        {
          tag: 'เมนูอาหาร',
          title: 'เมนูไข่สำหรับอาหารกลางวัน',
          body: 'ไข่ไก่นำไปประกอบอาหารกลางวันได้หลากหลายเมนู ต้นทุนต่อจานต่ำ และให้โปรตีนเพียงพอตามเกณฑ์อาหารกลางวันของกระทรวงสาธารณสุข',
        },
        {
          tag: 'สื่อการสอน',
          title: 'แผนการสอนและใบงานดาวน์โหลด',
          body: 'ชุดแผนการสอนตามช่วงชั้น เชื่อมกิจกรรมเลี้ยงไก่ไข่เข้ากับวิชาวิทยาศาสตร์และการงานอาชีพ พร้อมใบงานและแบบบันทึกผลผลิตประจำวัน',
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
